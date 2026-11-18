import type { Hono } from "hono";
import type { ApplicationEnviroment } from "../modules/application.types";

export const createTestClient = (
    app: Hono<ApplicationEnviroment>,
    bindings: ApplicationEnviroment["Bindings"],
) => {
    const get = (path: string, token?: string) =>
        app.request(path, {
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            }
        }, bindings);

    const post = (path: string, body: unknown, token?: string) =>
        app.request(path, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(body),
        }, bindings);

    const me = (token?: string) => get("/api/auth/me", token);

    return {
        get, post, me
    }
}