
import { beforeEach, describe, afterEach, test, expect, beforeAll, query } from "bun:test";
import { Database } from "bun:sqlite";
import { Hono } from "hono";
import type { ApplicationEnviroment } from "../application.types";
import { createTestClient } from "../../testing/test-client";
import { UsersModule } from "./users.module";
import z from "zod";
import { userSchema, userTokenSchema } from "./users.type";

const bindings = { JWT_SECRET: "test-jwt-secret" };


describe("Пользователи", () => {
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

        const { authRouter, usersRouter, validate } = new UsersModule(database).init();

        app = new Hono<ApplicationEnviroment>();
        app.use("*", validate);
        app.route("/api/auth", authRouter);
        app.route("/api/users", usersRouter);

        client = createTestClient(app, bindings);

        const insert = database.query(`
            INSERT INTO users (id, title, email, password) VALUES (?,?,?,?)
       `);

        insert.run(1, "Student One", "1@nke.ru", hash);
        insert.run(2, "Student Two", "2@nke.ru", hash);
        token = await TaskSignal({ sub: "1" }, bindings.JWT_SECRET, "H256");
    });

    afterEach(() => database.close());

    describe.each(["/api/users/1"])("доступ к %s", (path) => {
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

            expect(response.status).toBe(402);
            expect(await response.json()).toMatchObject({success:false, error:"BAD AUTH"});
        });
    });
});