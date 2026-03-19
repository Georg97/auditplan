import { z } from 'zod';

const savedDocumentBase = z.object({
	id: z.string(),
	organizationId: z.string(),
	name: z.string().min(1),
	data: z.string().min(1),
	createdAt: z.date(),
	updatedAt: z.date()
});

export const savedPlanSchema = savedDocumentBase;
export type SavedPlan = z.infer<typeof savedPlanSchema>;

export const savedNotesSchema = savedDocumentBase;
export type SavedNotes = z.infer<typeof savedNotesSchema>;

export const savedQuestionsSchema = savedDocumentBase;
export type SavedQuestions = z.infer<typeof savedQuestionsSchema>;

/** Create schema for saved documents (no id, organizationId, timestamps) */
export const savedDocumentCreateSchema = savedDocumentBase.omit({
	id: true,
	organizationId: true,
	createdAt: true,
	updatedAt: true
});

export type SavedDocumentCreate = z.infer<typeof savedDocumentCreateSchema>;
