import type { UsersRepository } from "./users.repository";
import { Context, Hono, type TypedResponse } from "hono";
import {
  IDParamSchema,
  type ApplicationEnviroment,
  type ApplicationResult,
  type IDParamType,
} from "../application.types";
import { type UserType } from "./users.type";
import { ApplicationValidator } from "../application.validator";

export class UsersController {
  private readonly repository: UsersRepository;

  constructor(repository: UsersRepository) {
    this.repository = repository;
  }

  public routes(): Hono {
    return new Hono()
      .get("/", this.findAll.bind(this))
      .get(
        "/:id",
        ApplicationValidator.validate("param", IDParamSchema),
        this.findOne.bind(this),
      );
  }

  public async findAll(
    c: Context,
  ): Promise<TypedResponse<ApplicationResult<UserType[]>>> {
    return c.json({ success: true, data: this.repository.findAll() });
  }

  public async findOne(
    c: Context<ApplicationEnviroment, "/:id", { out: { param: IDParamType } }>,
  ): Promise<TypedResponse<ApplicationResult<UserType>>> {
    const { id } = c.req.valid("param");
    const user = this.repository.findById(id);

    if (!user) {
      return c.json({ success: false, error: "User not found" }, 404);
    }

    return c.json({ success: true, data: user });
  }
}
