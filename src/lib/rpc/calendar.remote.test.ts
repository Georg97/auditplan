import { describe, it, expect } from 'vitest';
import { calendarEntrySchema, calendarEntryCreateSchema, calendarEntryUpdateSchema, calendarViewSchema } from '$lib/types';
import { getCalendarEntries, getCalendarEntryById, addCalendarEntry, updateCalendarEntry, deleteCalendarEntry } from './calendar.remote';

// --- CalendarView schema ---

describe('calendarViewSchema validation', () => {
	it('accepts month view', () => {
		expect(calendarViewSchema.safeParse('month').success).toBe(true);
	});

	it('accepts week view', () => {
		expect(calendarViewSchema.safeParse('week').success).toBe(true);
	});

	it('accepts day view', () => {
		expect(calendarViewSchema.safeParse('day').success).toBe(true);
	});

	it('rejects invalid view', () => {
		expect(calendarViewSchema.safeParse('year').success).toBe(false);
	});
});

// --- CalendarEntry schema ---

describe('calendarEntrySchema validation', () => {
	const validEntry = {
		id: 'cal-1',
		organizationId: 'org-1',
		title: 'ISO 9001 Audit',
		date: '2026-03-18',
		createdAt: new Date(),
		updatedAt: new Date()
	};

	it('accepts valid minimal entry', () => {
		expect(calendarEntrySchema.safeParse(validEntry).success).toBe(true);
	});

	it('accepts full entry with all optional fields', () => {
		const result = calendarEntrySchema.safeParse({
			...validEntry,
			description: 'Audit der Produktion',
			startTime: '09:00',
			endTime: '17:00',
			allDay: false,
			company: 'Musterfirma GmbH',
			auditorId: 'aud-1',
			auditId: 'audit-1',
			color: '#667eea'
		});
		expect(result.success).toBe(true);
	});

	it('rejects missing title', () => {
		const { title: _, ...noTitle } = validEntry;
		expect(calendarEntrySchema.safeParse(noTitle).success).toBe(false);
	});

	it('rejects empty title', () => {
		expect(calendarEntrySchema.safeParse({ ...validEntry, title: '' }).success).toBe(false);
	});

	it('rejects missing date', () => {
		const { date: _, ...noDate } = validEntry;
		expect(calendarEntrySchema.safeParse(noDate).success).toBe(false);
	});

	it('accepts null optional fields', () => {
		const result = calendarEntrySchema.safeParse({
			...validEntry,
			description: null,
			startTime: null,
			endTime: null,
			company: null,
			auditorId: null,
			auditId: null,
			color: null
		});
		expect(result.success).toBe(true);
	});

	it('defaults allDay to false', () => {
		const result = calendarEntrySchema.safeParse(validEntry);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.allDay).toBe(false);
		}
	});
});

// --- CalendarEntryCreate schema ---

describe('calendarEntryCreateSchema validation', () => {
	it('accepts valid create data', () => {
		const result = calendarEntryCreateSchema.safeParse({
			title: 'Team Meeting',
			date: '2026-04-01',
			startTime: '10:00',
			endTime: '11:00'
		});
		expect(result.success).toBe(true);
	});

	it('omits id, organizationId, timestamps', () => {
		const result = calendarEntryCreateSchema.safeParse({
			id: 'should-be-ignored',
			title: 'Test',
			date: '2026-04-01'
		});
		// id is not in the schema, so it gets stripped but parse still succeeds
		expect(result.success).toBe(true);
	});

	it('rejects missing title', () => {
		expect(calendarEntryCreateSchema.safeParse({ date: '2026-04-01' }).success).toBe(false);
	});

	it('accepts company and auditorId', () => {
		const result = calendarEntryCreateSchema.safeParse({
			title: 'Audit',
			date: '2026-04-01',
			company: 'Firma ABC',
			auditorId: 'aud-2'
		});
		expect(result.success).toBe(true);
	});
});

// --- CalendarEntryUpdate schema ---

describe('calendarEntryUpdateSchema validation', () => {
	it('accepts partial update with only title', () => {
		expect(calendarEntryUpdateSchema.safeParse({ title: 'Updated' }).success).toBe(true);
	});

	it('accepts partial update with only date', () => {
		expect(calendarEntryUpdateSchema.safeParse({ date: '2026-05-01' }).success).toBe(true);
	});

	it('accepts empty object (all fields optional)', () => {
		expect(calendarEntryUpdateSchema.safeParse({}).success).toBe(true);
	});

	it('accepts updating company and auditorId', () => {
		const result = calendarEntryUpdateSchema.safeParse({
			company: 'New Company',
			auditorId: 'aud-3'
		});
		expect(result.success).toBe(true);
	});
});

// --- Remote function exports ---

describe('calendar remote function exports', () => {
	it('exports getCalendarEntries', () => {
		expect(typeof getCalendarEntries).toBe('function');
	});

	it('exports getCalendarEntryById', () => {
		expect(typeof getCalendarEntryById).toBe('function');
	});

	it('exports addCalendarEntry', () => {
		expect(typeof addCalendarEntry).toBe('function');
	});

	it('exports updateCalendarEntry', () => {
		expect(typeof updateCalendarEntry).toBe('function');
	});

	it('exports deleteCalendarEntry', () => {
		expect(typeof deleteCalendarEntry).toBe('function');
	});
});
