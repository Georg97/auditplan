import { query, command } from '$app/server';

export const getCalendarEntries = query('unchecked', async (_month: string) => {
	throw new Error('Not implemented');
});

export const getCalendarEntryById = query('unchecked', async (_id: string) => {
	throw new Error('Not implemented');
});

export const addCalendarEntry = command('unchecked', async (_data: unknown) => {
	throw new Error('Not implemented');
});

export const updateCalendarEntry = command('unchecked', async (_id: string) => {
	throw new Error('Not implemented');
});

export const deleteCalendarEntry = command('unchecked', async (_id: string) => {
	throw new Error('Not implemented');
});
