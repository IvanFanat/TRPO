import { Database } from "bun:sqlite";
import { type UserType } from "./users.type";

export class UsersRepository {
  constructor(private readonly database: Database) { }

  public init(): void {
    this.database.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        email TEXT NOT NULL,
        hash TEXT NOT NULL
      );
    `);
  }

  public findAll(): UserType[] {
    return this.database.query<UserType, []>("SELECT * FROM users").all();
  }

  public findById(id: number): UserType | null {
    return this.database
      .query<UserType, [number]>("SELECT * FROM users WHERE id = ?")
      .get(id);
  }

  public findByEmail(email: string): UserType | null {
    return this.database
      .query<UserType, [string]>("SELECT * FROM users WHERE email = ?")
      .get(email.toLowerCase().trim());
  }

  public create(title: string, email: string, hash: string): UserType | null {
    return this.database
      .query<
        UserType,
        string[]
      >("INSERT INTO users (title, email, hash) VALUES (?, ?, ?) RETURNING id, title, email")
      .get(title, email.toLowerCase().trim(), hash);
  }
}
