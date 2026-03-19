import { query, command } from '$app/server';
import type { SavedQuestions, SavedDocumentCreate } from '$lib/types';

export const getSavedQuestions = query(async (): Promise<SavedQuestions[]> => {
	throw new Error('Not implemented');
});

export const getSavedQuestionById = query('unchecked', async (_id: string): Promise<SavedQuestions | null> => {
	throw new Error('Not implemented');
});

export const saveQuestion = command('unchecked', async (_data: SavedDocumentCreate): Promise<SavedQuestions> => {
	throw new Error('Not implemented');
});

export const updateQuestion = command('unchecked', async (_payload: { id: string; data: SavedDocumentCreate }): Promise<SavedQuestions> => {
	throw new Error('Not implemented');
});

export const deleteQuestion = command('unchecked', async (_id: string): Promise<void> => {
	throw new Error('Not implemented');
});
