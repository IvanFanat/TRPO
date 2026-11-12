import z from "zod";

export const postsSchema = z.object({
  id: z.number(),
  content: z.string().min(2),
});

export const postCreateSchema = postsSchema.omit({ id: true});

export type PostsType = z.infer<typeof postsSchema>;
export type PostsCreateType = z.infer<typeof postCreateSchema>;
