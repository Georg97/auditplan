import { z } from 'zod';

export const auditTypes = ['internal', 'external', 'certification', 'surveillance', 'recertification'] as const;
export type AuditType = (typeof auditTypes)[number];

export const auditFormats = ['on_site', 'remote', 'hybrid'] as const;
export type AuditFormat = (typeof auditFormats)[number];

export const auditStatuses = ['planned', 'in_progress', 'completed', 'cancelled'] as const;
export type AuditStatus = (typeof auditStatuses)[number];

export const auditSchema = z.object({
	auditName: z.string().min(1, 'Auditname ist erforderlich'),
	auditTyp: z.enum(auditTypes),
	startDatum: z.string().min(1, 'Startdatum ist erforderlich'),
	endDatum: z.string().optional(),
	uhrzeitVon: z.string().optional(),
	uhrzeitBis: z.string().optional(),
	unternehmen: z.string().min(1, 'Unternehmen ist erforderlich'),
	abteilung: z.string().min(1, 'Abteilung ist erforderlich'),
	standort: z.string().optional(),
	format: z.enum(auditFormats).optional(),
	normen: z.string().optional(),
	geltungsbereich: z.string().optional(),
	leitenderAuditorId: z.string().optional(),
	auditTeam: z.string().optional(),
	ansprechpartner: z.string().optional(),
	kontaktEmail: z.string().optional(),
	notizen: z.string().optional(),
	dokumenteLinks: z.string().optional(),
	status: z.enum(auditStatuses).default('planned')
});

export type AuditFormData = z.infer<typeof auditSchema>;

export interface Audit extends AuditFormData {
	id: string;
	organizationId: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface AuditDatei {
	id: string;
	auditId: string;
	dateiName: string;
	dateiTyp: string;
	dateiGroesse: number;
	dateiInhalt: string;
	createdAt: Date;
}
