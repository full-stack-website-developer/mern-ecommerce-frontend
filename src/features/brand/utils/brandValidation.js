import { z } from "zod";

export const brandSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 letters').max(20, 'Name must be at most 20 letters'),
    status: z.string().min(1, 'Status is required'),
});