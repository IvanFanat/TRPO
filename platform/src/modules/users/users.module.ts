
import { Database } from "bun:sqlite";
import { AuthController } from "./auth.controller";
import { UsersRepository } from "./users.repository";
import { UsersController } from "./users.controller";

export class UsersModule {
  private readonly repository: UsersRepository;

  private readonly usersController: UsersController;
  private readonly authController: AuthController;

  constructor(database: Database) {
    this.repository = new UsersRepository(database);

    this.usersController = new UsersController(this.repository);
    this.authController = new AuthController(this.repository);
  }

  public init() {
    this.repository.init();

    return {
      authRouter: this.authController.routes(),
      usersRouter: this.usersController.routes(),

      validate: this.authController.validate.bind(this.authController),
    }
  }
}
