import z from "zod";

export const createLinkSchema = z.object({
  url: z.url()
})

const updateLinkBaseSchema = z.object({
  title: z.string(),
  summary: z.string(),
  categoryId: z.uuid(),
  isConsumed: z.boolean()
}).partial()

type UpdateLinkBaseInput = z.infer<typeof updateLinkBaseSchema>

export const updateLinkSchema = updateLinkBaseSchema
  .transform((data): UpdateLinkBaseInput => {
  // Filter out undefined values
    return Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== undefined)
    );
});

export type CreateLinkInput = z.infer<typeof createLinkSchema>
export type UpdateLinkInput = z.infer<typeof updateLinkSchema>
