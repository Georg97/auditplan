import { query, command } from '$app/server';

export const getSavedQuestions = query(async () => {
	throw new Error('Not implemented');
});

export const getSavedQuestionById = query('unchecked', async (_id: string) => {
	throw new Error('Not implemented');
});

export const saveQuestion = command('unchecked', async (_data: unknown) => {
	throw new Error('Not implemented');
});

export const updateQuestion = command('unchecked', async (_id: string) => {
	throw new Error('Not implemented');
});

export const deleteQuestion = command('unchecked', async (_id: string) => {
	throw new Error('Not implemented');
});
