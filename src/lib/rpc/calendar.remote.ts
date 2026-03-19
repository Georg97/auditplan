import { query, command } from '$app/server';
import type { CalendarEntry, CalendarEntryFormData } from '$lib/types/calendar';

export const getCalendarEntries = query('unchecked', async (_args: { year: number; month: number }): Promise<CalendarEntry[]> => {
	throw new Error('Not implemented');
});

export const addCalendarEntry = command('unchecked', async (_data: CalendarEntryFormData): Promise<CalendarEntry> => {
	throw new Error('Not implemented');
});

export const editCalendarEntry = command('unchecked', async (_args: { id: string; data: CalendarEntryFormData }): Promise<CalendarEntry> => {
	throw new Error('Not implemented');
});

export const deleteCalendarEntry = command('unchecked', async (_id: string): Promise<void> => {
	throw new Error('Not implemented');
});
