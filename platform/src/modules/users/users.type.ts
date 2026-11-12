import z from "zod";

export const userSchema = z.object({
  id: z.number(),
  title: z.string().min(2),
  email: z.email(),
  password: z.string(),
});

export const userRegisterSchema = userSchema.omit({ id: true});
export const userAuthSchema = userSchema.pick({ email: true, password: true });
export const userTokenSchema = z.object({ token: z.string() });

export type UserType = z.infer<typeof userSchema>;
export type UserRegisterType = z.infer<typeof userRegisterSchema>;
export type UserAuthType = z.infer<typeof userAuthSchema>;
export type UserTokenType = z.infer<typeof userTokenSchema>;
