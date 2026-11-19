
import { Database } from "bun:sqlite";
import { CommsRepository } from "./comms.repository.ts";
import { CommsController } from "./comms.controller.ts";
import type {Hono} from "hono";

export class CommsModule {
  private readonly repository: CommsRepository;
  private readonly controller: CommsController;

  constructor(database: Database) {
    this.repository = new CommsRepository(database);

    this.repository = new CommsRepository(database);
    this.controller = new CommsController(this.repository);
  }

  public init(): Hono {
    this.repository.init();

    return this.controller.routes();
  }
}
