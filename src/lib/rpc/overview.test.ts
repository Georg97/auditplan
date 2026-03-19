import { describe, it, expect } from 'vitest';
import { overviewEntrySchema, savedDocumentCreateSchema, savedPlanSchema, savedNotesSchema, savedQuestionsSchema } from '$lib/types';
import { getSavedPlans, getSavedPlanById, savePlan, updatePlan, deletePlan } from './plans.remote';
import { getSavedNotes, getSavedNoteById, saveNote, updateNote, deleteNote } from './notes.remote';
import { getSavedQuestions, getSavedQuestionById, saveQuestion, updateQuestion, deleteQuestion } from './questions.remote';

// --- OverviewEntry schema ---

describe('overviewEntrySchema validation', () => {
	it('accepts valid document entry', () => {
		const result = overviewEntrySchema.safeParse({
			id: 'doc-1',
			name: 'ISO 9001 Auditfragen',
			createdAt: '2026-03-01',
			updatedAt: '2026-03-15',
			type: 'document'
		});
		expect(result.success).toBe(true);
	});

	it('accepts valid note entry', () => {
		const result = overviewEntrySchema.safeParse({
			id: 'note-1',
			name: 'Audit Q1 Notizen',
			createdAt: '2026-03-01',
			updatedAt: '2026-03-15',
			type: 'note'
		});
		expect(result.success).toBe(true);
	});

	it('accepts valid plan entry', () => {
		const result = overviewEntrySchema.safeParse({
			id: 'plan-1',
			name: 'Auditplan 2026',
			createdAt: '2026-01-10',
			updatedAt: '2026-02-20',
			type: 'plan'
		});
		expect(result.success).toBe(true);
	});

	it('rejects invalid type', () => {
		const result = overviewEntrySchema.safeParse({
			id: 'x',
			name: 'Test',
			createdAt: '2026-01-01',
			updatedAt: '2026-01-01',
			type: 'unknown'
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing name', () => {
		const result = overviewEntrySchema.safeParse({
			id: 'x',
			createdAt: '2026-01-01',
			updatedAt: '2026-01-01',
			type: 'plan'
		});
		expect(result.success).toBe(false);
	});
});

// --- SavedDocumentCreate schema ---

describe('savedDocumentCreateSchema validation', () => {
	it('accepts valid create data', () => {
		const result = savedDocumentCreateSchema.safeParse({
			name: 'Test Plan',
			data: '{"blocks":[]}'
		});
		expect(result.success).toBe(true);
	});

	it('rejects empty name', () => {
		const result = savedDocumentCreateSchema.safeParse({
			name: '',
			data: '{}'
		});
		expect(result.success).toBe(false);
	});

	it('rejects empty data', () => {
		const result = savedDocumentCreateSchema.safeParse({
			name: 'Test',
			data: ''
		});
		expect(result.success).toBe(false);
	});
});

// --- Full saved schemas ---

describe('savedPlanSchema validation', () => {
	const validPlan = {
		id: 'plan-1',
		organizationId: 'org-1',
		name: 'Auditplan 2026',
		data: '{"blocks":[]}',
		createdAt: new Date(),
		updatedAt: new Date()
	};

	it('accepts valid saved plan', () => {
		expect(savedPlanSchema.safeParse(validPlan).success).toBe(true);
	});

	it('rejects missing organizationId', () => {
		const { organizationId: _, ...partial } = validPlan;
		expect(savedPlanSchema.safeParse(partial).success).toBe(false);
	});
});

describe('savedNotesSchema validation', () => {
	it('accepts valid saved notes', () => {
		const result = savedNotesSchema.safeParse({
			id: 'note-1',
			organizationId: 'org-1',
			name: 'Audit Notizen',
			data: '{"sections":[]}',
			createdAt: new Date(),
			updatedAt: new Date()
		});
		expect(result.success).toBe(true);
	});
});

describe('savedQuestionsSchema validation', () => {
	it('accepts valid saved questions', () => {
		const result = savedQuestionsSchema.safeParse({
			id: 'q-1',
			organizationId: 'org-1',
			name: 'ISO 9001 Fragen',
			data: '{"questions":[]}',
			createdAt: new Date(),
			updatedAt: new Date()
		});
		expect(result.success).toBe(true);
	});
});

// --- Remote function exports: Plans ---

describe('plans remote function exports', () => {
	it('exports getSavedPlans', () => {
		expect(typeof getSavedPlans).toBe('function');
	});

	it('exports getSavedPlanById', () => {
		expect(typeof getSavedPlanById).toBe('function');
	});

	it('exports savePlan', () => {
		expect(typeof savePlan).toBe('function');
	});

	it('exports updatePlan', () => {
		expect(typeof updatePlan).toBe('function');
	});

	it('exports deletePlan', () => {
		expect(typeof deletePlan).toBe('function');
	});
});

// --- Remote function exports: Notes ---

describe('notes remote function exports', () => {
	it('exports getSavedNotes', () => {
		expect(typeof getSavedNotes).toBe('function');
	});

	it('exports getSavedNoteById', () => {
		expect(typeof getSavedNoteById).toBe('function');
	});

	it('exports saveNote', () => {
		expect(typeof saveNote).toBe('function');
	});

	it('exports updateNote', () => {
		expect(typeof updateNote).toBe('function');
	});

	it('exports deleteNote', () => {
		expect(typeof deleteNote).toBe('function');
	});
});

// --- Remote function exports: Questions ---

describe('questions remote function exports', () => {
	it('exports getSavedQuestions', () => {
		expect(typeof getSavedQuestions).toBe('function');
	});

	it('exports getSavedQuestionById', () => {
		expect(typeof getSavedQuestionById).toBe('function');
	});

	it('exports saveQuestion', () => {
		expect(typeof saveQuestion).toBe('function');
	});

	it('exports updateQuestion', () => {
		expect(typeof updateQuestion).toBe('function');
	});

	it('exports deleteQuestion', () => {
		expect(typeof deleteQuestion).toBe('function');
	});
});
