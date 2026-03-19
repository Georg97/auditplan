import { z } from 'zod';

export const auditorSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	title: z.string().optional(),
	email: z.string().email('Invalid email'),
	phone: z.string().optional(),
	mobile: z.string().optional(),
	company: z.string().optional(),
	street: z.string().optional(),
	zipCode: z.string().optional(),
	city: z.string().optional(),
	country: z.string().optional(),
	iso9001: z.boolean().default(false),
	iso14001: z.boolean().default(false),
	iso45001: z.boolean().default(false),
	iso50001: z.boolean().default(false),
	iso27001: z.boolean().default(false),
	certifications: z.string().optional(),
	languages: z.string().optional(),
	experienceYears: z.number().int().nonnegative().optional(),
	dailyRate: z.number().int().nonnegative().optional(),
	availability: z.enum(['full_time', 'part_time', 'by_arrangement', 'limited']).optional(),
	notes: z.string().optional()
});

export type AuditorFormData = z.infer<typeof auditorSchema>;

export interface Auditor extends AuditorFormData {
	id: string;
	organizationId: string;
	createdAt: Date;
	updatedAt: Date;
}
