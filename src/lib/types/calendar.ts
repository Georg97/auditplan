import { z } from 'zod';

export const calendarEntrySchema = z.object({
	datum: z.string().min(1, 'Datum ist erforderlich'),
	titel: z.string().min(1, 'Titel ist erforderlich'),
	startzeit: z.string().optional(),
	endzeit: z.string().optional(),
	unternehmen: z.string().optional(),
	auditorId: z.string().optional(),
	beschreibung: z.string().optional(),
	auditId: z.string().optional()
});

export type CalendarEntryFormData = z.infer<typeof calendarEntrySchema>;

export interface CalendarEntry extends CalendarEntryFormData {
	id: string;
	organizationId: string;
	createdAt: Date;
	updatedAt: Date;
}

export type CalendarView = 'month' | 'week' | 'day';
