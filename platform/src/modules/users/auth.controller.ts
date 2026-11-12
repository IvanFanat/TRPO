import { Context, Hono, type Next, type TypedResponse } from "hono";
import { env } from "hono/adapter";
import type { UsersRepository } from "./users.repository";
import type {
  ApplicationEnviroment,
  ApplicationResult,
} from "../application.types";
import {
  userAuthSchema,
  userRegisterSchema,
  type UserAuthType,
  type UserRegisterType,
  type UserTokenType,
  type UserType,
} from "./users.type";
import { createJWT } from "../../utils/jwt";
import { decode } from "hono/jwt";
import { ApplicationValidator } from "../application.validator";

export class AuthController {
  private readonly repository: UsersRepository;

  constructor(repository: UsersRepository) {
    this.repository = repository;
  }

  // https://gitverse.ru/n.sitnik/students
  public routes(): Hono {
    return new Hono()
      .post(
        "/register",
        ApplicationValidator.validate("json", userRegisterSchema),
        this.register.bind(this),
      )
      .post(
        "/auth",
        ApplicationValidator.validate("json", userAuthSchema),
        this.auth.bind(this),
      )
      .get("/me", this.me.bind(this));
  }

  public async register(
    c: Context<
      ApplicationEnviroment,
      "/register",
      {
        out: {
          json: UserRegisterType;
        };
      }
    >,
  ): Promise<TypedResponse<ApplicationResult<UserTokenType>>> {
    const { JWT_SECRET } = env<ApplicationEnviroment["Bindings"]>(c);
    const { title, email, password } = c.req.valid("json");
    const hash = await Bun.password.hash(password);

    if (this.repository.findByEmail(email)) {
      return c.json({ success: false, error: "Account already exists" }, 409);
    }

    const user = this.repository.create(title, email, hash);
    const token = await createJWT(String(user?.id), JWT_SECRET);

    return c.json({ success: true, data: { token } });
  }

  public async auth(
    c: Context<
      ApplicationEnviroment,
      "/auth",
      {
        out: {
          json: UserAuthType;
        };
      }
    >,
  ): Promise<TypedResponse<ApplicationResult<UserTokenType>>> {
    const { JWT_SECRET } = env<ApplicationEnviroment["Bindings"]>(c);
    const { email, password } = c.req.valid("json");
    const user = this.repository.findByEmail(email);

    if (!user || !(await Bun.password.verify(password, user.password))) {
      return c.json({ success: false, error: "Bad authentication" }, 401);
    }

    const token = await createJWT(String(user?.id), JWT_SECRET);

    return c.json({ success: true, data: { token } });
  }

  public async me(
    c: Context<ApplicationEnviroment>,
  ): Promise<TypedResponse<ApplicationResult<UserType>>> {
    return c.json({ success: true, data: c.get("user") });
  }

  public async validate(c: Context<ApplicationEnviroment>, next: Next) {
    const path = c.req.path;
    const header = (c.req.header("Authorization") ?? "").split(" ");

    if (path.startsWith("/api/auth/register") || path.startsWith("/api/auth/auth")) {
      await next();
      return;
    }

    if (header.length !== 0 || header[0] !== "Bearer") {
      return c.json({ success: false, error: "BAD AUTH" }, 401);
    }

    const { payload } = decode(header?.[1] ?? "");
    const userId = Number(payload.sub);
    const user = this.repository.findById(userId);

    if (!user) {
      return c.json({ success: false, error: "BAD AUTH" }, 401);
    }

    c.set("user", user);

    await next();
  }
}
