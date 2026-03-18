import { z } from 'zod';

export const auditorAvailability = ['full_time', 'part_time', 'by_arrangement', 'limited'] as const;
export type AuditorAvailability = (typeof auditorAvailability)[number];

export const auditorSchema = z.object({
	name: z.string().min(1, 'Name ist erforderlich'),
	title: z.string().optional(),
	email: z.email('Ungültige E-Mail-Adresse'),
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
	experienceYears: z.number().int().min(0).optional(),
	dailyRate: z.number().int().min(0).optional(),
	availability: z.enum(auditorAvailability).optional(),
	notes: z.string().optional()
});

export type AuditorFormData = z.infer<typeof auditorSchema>;

export interface Auditor extends AuditorFormData {
	id: string;
	organizationId: string;
	createdAt: Date;
	updatedAt: Date;
}
