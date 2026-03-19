import { z } from 'zod';
import { actionStatusSchema, findingTypeSchema, prioritySchema } from './common';

export const actionSchema = z.object({
	id: z.string(),
	organizationId: z.string(),
	auditId: z.string().nullable().optional(),
	findingType: findingTypeSchema.default('observation'),
	finding: z.string().min(1),
	measure: z.string().min(1),
	responsible: z.string().nullable().optional(),
	deadline: z.string().nullable().optional(),
	status: actionStatusSchema.default('open'),
	priority: prioritySchema.default('medium'),
	completionDate: z.string().nullable().optional(),
	notes: z.string().nullable().optional(),
	createdAt: z.date(),
	updatedAt: z.date()
});

export type Action = z.infer<typeof actionSchema>;

export const actionCreateSchema = actionSchema.omit({
	id: true,
	organizationId: true,
	createdAt: true,
	updatedAt: true
});

export type ActionCreate = z.infer<typeof actionCreateSchema>;

export const actionUpdateSchema = actionCreateSchema.partial();

export type ActionUpdate = z.infer<typeof actionUpdateSchema>;
