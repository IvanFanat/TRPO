import {Database} from "bun:sqlite";
import { type UserType, type UserUpdateType} from "./users.type";
import { number, string } from "zod";
import { base64Charset } from "zod/v4/core";
import { PreparedRegExpRouter } from "hono/router/reg-exp-router";

export class UsersRepository{
    private readonly database: Database;

    constructor(database: Database){
        this.database = database;
    }

    public init(): void{
        this.database.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                email TEXT NOT NULL,
                password TEXT NOt NUll
            )
        `);
    }

    public create(title:string, email:string, password:string): UserType | null{
        return this.database
        .query<
        UserType,
        {$title: string; $email: string; $password:string}
        >("INSERT INTO users (title, email, password) VALUES ($title, $email, $password) RETURNING(id, title, email)")
        .get({
            $title:title,
            $email: email,
            $password:password,

        })
    }

    public existsByEmail(email:string): boolean{
        const prepared = email.trim().toLowerCase();

        const results = this.database
        .query<number, [string]>("SELECT EXISTS(SELECT 1 FROM users where email =?)")
        .values(prepared);

        return Boolean(results?.[0]?.[0] ?? false);
    }

    public findAll(): UserType[] {
        return this.database
            .query<UserType, []>("SELECT * FROM users")
            .all();
    }

    public findById(id: number): UserType | null {
        return this.database
          .query<UserType, [number]>("SELECT * FROM users WHERE id = ?")
          .get(id);
    }

    public findByEmail(email:string): UserType | null {
        return this.database
          .query<UserType, [string]>("SELECT * FROM users WHERE email = ?")
          .get(email.toLowerCase().trim());
    }



    public leteById(id:number): void{
        this.database
           .query<undefined, [number]>("DELETE FORM user WHERE id=?")
           .run(id);
    }

    public update(id: number, data: UserUpdateType): UserType | null {
        this.database
            .query<undefined, { $id: number; $title:string | null; $email:string | null}>(
                `
                UPDATE users
                SET
                  title = COALESCE($title, title),
                  email=COALESC ($email , email)
                WHERE id = $id
                `,
            )
            .run({
                $id:id,
                $title:data.title,
                $email:data.email,
            });

        return this.findById(id);
    }
}