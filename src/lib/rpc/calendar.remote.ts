import { query, command } from '$app/server';
import type { CalendarEntry, CalendarEntryCreate, CalendarEntryUpdate } from '$lib/types';

export const getCalendarEntries = query('unchecked', async (_range: { start: string; end: string }): Promise<CalendarEntry[]> => {
	throw new Error('Not implemented');
});

export const getCalendarEntryById = query('unchecked', async (_id: string): Promise<CalendarEntry | null> => {
	throw new Error('Not implemented');
});

export const addCalendarEntry = command('unchecked', async (_data: CalendarEntryCreate): Promise<CalendarEntry> => {
	throw new Error('Not implemented');
});

export const updateCalendarEntry = command('unchecked', async (_payload: { id: string; data: CalendarEntryUpdate }): Promise<CalendarEntry> => {
	throw new Error('Not implemented');
});

export const deleteCalendarEntry = command('unchecked', async (_id: string): Promise<void> => {
	throw new Error('Not implemented');
});
