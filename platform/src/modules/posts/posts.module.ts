
import { Database } from "bun:sqlite";
import { PostsRepository } from "./posts.repository.ts";
import { PostsController } from "./posts.controller.ts";
import type {Hono} from "hono";

export class PostsModule {
  private readonly repository: PostsRepository;
  private readonly controller: PostsController;

  constructor(database: Database) {
    this.repository = new PostsRepository(database);

    this.repository = new PostsRepository(database);
    this.controller = new PostsController(this.repository);
  }

  public init(): Hono {
    this.repository.init();

    return this.controller.routes();
  }
}
