import z from "zod";

export const commsSchema = z.object({
  id: z.number(),
  content: z.string().min(2),
  userId: z.number(),
});

export const commCreateSchema = commsSchema.omit({ id: true, userId:  true});

export type CommsType = z.infer<typeof commsSchema>;
export type CommsCreateType = z.infer<typeof commCreateSchema>;
