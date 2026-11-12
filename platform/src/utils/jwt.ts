import { sign } from "hono/jwt";

export const createJWT = async (secret: string, sub: string): Promise<string> => {
    const now = Math.floor(Date.now() / 1000);

    return sign({
        sub,
        iat: now,
        exp: now + 30 * 60,
        jti: crypto.randomUUID(),
    }, secret, "HS256")
}