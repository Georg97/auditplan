import { z } from 'zod';

export const auditorSchema = z.object({
	id: z.string(),
	organizationId: z.string(),
	firstName: z.string().min(1),
	lastName: z.string().min(1),
	email: z.string().email(),
	phone: z.string().nullable().optional(),
	company: z.string().nullable().optional(),
	role: z.string().nullable().optional(),
	street: z.string().nullable().optional(),
	zip: z.string().nullable().optional(),
	city: z.string().nullable().optional(),
	country: z.string().nullable().optional(),
	iso9001: z.boolean().optional().default(false),
	iso14001: z.boolean().optional().default(false),
	iso45001: z.boolean().optional().default(false),
	iso27001: z.boolean().optional().default(false),
	iso50001: z.boolean().optional().default(false),
	availableFrom: z.string().nullable().optional(),
	availableTo: z.string().nullable().optional(),
	notes: z.string().nullable().optional(),
	isExternal: z.boolean().optional().default(false),
	createdAt: z.date(),
	updatedAt: z.date()
});

export type Auditor = z.infer<typeof auditorSchema>;

/** Schema for creating a new auditor (no id, organizationId, or timestamps) */
export const auditorCreateSchema = auditorSchema.omit({
	id: true,
	organizationId: true,
	createdAt: true,
	updatedAt: true
});

export type AuditorCreate = z.infer<typeof auditorCreateSchema>;

/** Schema for updating an auditor (all fields optional except required ones) */
export const auditorUpdateSchema = auditorCreateSchema.partial();

export type AuditorUpdate = z.infer<typeof auditorUpdateSchema>;
