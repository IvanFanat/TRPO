import { Database } from "bun:sqlite";
import { type PostsType } from "./posts.type";

export class PostsRepository {
  constructor(private readonly database: Database) { }

  public init(): void {
    this.database.run(`
      CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL,
        userId INTEGER NOT NULL,
        FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
      );
    `);
  }

  public findAll(): PostsType[] {
    return this.database.query<PostsType, []>("SELECT * FROM posts").all();
  }

  public findById(id: number): PostsType | null {
    return this.database
      .query<PostsType, [number]>("SELECT * FROM posts WHERE id = ?")
      .get(id);
  }

  public findByEmail(email: string): PostsType | null {
    return this.database
      .query<PostsType, [string]>("SELECT * FROM posts WHERE email = ?")
      .get(email.toLowerCase().trim());
  }

  public create(content: string, userId: number): PostsType | null {
    return this.database
      .query<
        PostsType,
        [string, number]
      >("INSERT INTO posts (content, userId) VALUES (?, ?) RETURNING id, content, userId")
      .get(content, userId);
  }
}
