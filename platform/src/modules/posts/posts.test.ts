import { beforeEach, describe, afterEach, test, expect, beforeAll, query } from "bun:test";
import { Database } from "bun:sqlite";
import { Hono } from "hono";
import { sign } from "hono/jwt";
import type { ApplicationEnviroment } from "../application.types";
import { createTestClient } from "../../testing/test-client";
import { PostsModule } from "./posts.module";
import z from "zod";
import { postSchema, postTokenSchema } from "./posts.type";

const bindings = { JWT_SECRET: "test-jwt-secret" };


describe("Посты", () => {
    let database: Database;
    let app: Hono<ApplicationEnviroment>;
    let client: ReturnType<typeof createTestClient>;

    let token: string;
    let hash: string;

    beforeAll(async () => {
        hash = await Bun.password.hash("nke.ru");
    })

    beforeEach(async () => {
        database = new Database(":memory:");

        const { authRouter, postsRouter, validate } = new PostsModule(database).init();

        app = new Hono<ApplicationEnviroment>();
        app.use("*", validate);
        app.route("/api/auth", authRouter);
        app.route("/api/posts", postsRouter);

        client = createTestClient(app, bindings);

        const insert = database.query(`
            INSERT INTO users (id, title, email, password) VALUES (?,?,?,?)
       `);

        insert.run(1, "Student One", "1@nke.ru", hash);
        insert.run(2, "Student Two", "2@nke.ru", hash);
        token = await sign({ sub: "1" }, bindings.JWT_SECRET, "HS256");
    });

    afterEach(() => database.close());

    describe.each(["/api/posts/1"])("доступ к %s", (path) => {
        test("без токена возвращает 401", async () => {
            const response = await client.get(path);

            expect(response.status).toBe(401);
            expect(await response.json()).toMatchObject({ success: false, error: "BAD AUTH" });
        })

        test("некорректный тип токена возвращает 401", async () => {
            const response = await app.request(path, {
                headers: {
                    Authorization: `Basic ${token}`,
                }
            }, bindings);

            expect(response.status).toBe(401);
            expect(await response.json()).toMatchObject({ success: false, error: "BAD AUTH" });
        });

        test("некорректный токен возвращает 401", async () =>{
            const response = await client.get(path, "invalid-token");

            expect(response.status).toBe(401);
            expect(await response.json()).toMatchObject({success:false, error:"BAD AUTH"});
        });
        
        test("поддельная подпись возвращает 401", async () =>{
            const fakeToken = await sign({sub: "1"}, "FakeSecret", "HS256");
            const response = await client.get(path, fakeToken);

            expect(response.status).toBe(401);
        });

        test("просроыеный токен возвращает 401", async () =>{
            const expiredToken = await sign({
                sub: "1",
                exp: Math.floor(Date.now() / 1000) - 60,
            }, bindings.JWT_SECRET);

            const response = await client.get(path, expiredToken);

            expect(response.status).toBe(401);
        });

        test("токен удаленного пользователя возвращает 401", async () =>{
            database.run(`DELETE FROM users WHERE id = 1`);
            const response = await client.get(path, token);

            expect(response.status).toBe(401);
        });

        // test("", async () =>{});
    });
});