import { Hono } from "hono";
import { UsersModule } from "./users/users.module";
import { Database } from "bun:sqlite";
import { PostsModule } from "./posts/posts.module";
import { CommsModule } from "./comms/comms.module";

export class ApplicationModule {
  private readonly server: Hono;
  private readonly database: Database;
  private readonly users: UsersModule;
  private readonly posts: PostsModule;
  private readonly comms: CommsModule;

  constructor() {
    this.server = new Hono();
    this.database = new Database("platform.sqlite");
    this.users = new UsersModule(this.database);
    this.posts = new PostsModule(this.database);
    this.comms = new CommsModule(this.database);
  }

  public init(): ApplicationModule {
    const { authRouter, usersRouter, validate } = this.users.init();
    const postsRouter = this.posts.init();
    const commsRouter = this.comms.init();

    this.server.use('*', validate);
    this.server.route("/api/users", usersRouter);
    this.server.route("/api/auth", authRouter);
    this.server.route("/api/posts", postsRouter);
    this.server.route("/api/comms", commsRouter);

    return this;
  }

  public start(): Hono {
    return this.server;
  }
}
