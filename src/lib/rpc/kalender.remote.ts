import { query, command } from '$app/server';

export const getCalendarEntries = query(async () => {
	throw new Error('Not implemented');
});

export const addCalendarEntry = command('unchecked', async (_data: unknown) => {
	throw new Error('Not implemented');
});

export const editCalendarEntry = command('unchecked', async (_input: { id: string; data: unknown }) => {
	throw new Error('Not implemented');
});

export const deleteCalendarEntry = command('unchecked', async (_id: string) => {
	throw new Error('Not implemented');
});
