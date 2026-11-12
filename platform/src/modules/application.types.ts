import { Hono } from "hono";
import { UsersModule } from "./users/users.module";
import { Database } from "bun:sqlite";

export class ApplicationModule {
  private readonly server: Hono;
  private readonly database: Database;
  private readonly users: UsersModule;

  constructor() {
    this.server = new Hono();
    this.database = new Database("platform.sqlite");
    this.users = new UsersModule(this.database);
  }

  public init(): ApplicationModule {
    const { authRouter, usersRouter, validate } = this.users.init();

    this.server.use('*', validate);
    this.server.route("/api/users", usersRouter);
    this.server.route("/api/auth", authRouter);

    return this;
  }

  public start(): Hono {
    return this.server;
  }
}
