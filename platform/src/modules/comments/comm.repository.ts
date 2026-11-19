import { Database } from "bun:sqlite";
import { type CommsType } from "./comms.type";

export class CommsRepository {
  constructor(private readonly database: Database) { }

  public init(): void {
    this.database.run(`
      CREATE TABLE IF NOT EXISTS comms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL,
        userId INTEGER NOT NULL,
        FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
      );
    `);
  }

  public findAll(): CommsType[] {
    return this.database.query<CommsType, []>("SELECT * FROM comms").all();
  }

  public findById(id: number): CommsType | null {
    return this.database
      .query<CommsType, [number]>("SELECT * FROM comms WHERE id = ?")
      .get(id);
  }

  public findByEmail(email: string): CommsType | null {
    return this.database
      .query<CommsType, [string]>("SELECT * FROM comms WHERE email = ?")
      .get(email.toLowerCase().trim());
  }

  public create(content: string, userId: number): CommsType | null {
    return this.database
      .query<
        CommsType,
        [string, number]
      >("INSERT INTO comms (content, userId) VALUES (?, ?) RETURNING id, content, userId")
      .get(content, userId);
  }
}
