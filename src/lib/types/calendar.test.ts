import { describe, it, expect } from 'vitest';
import { calendarEntrySchema } from './calendar';

const validEntry = {
	datum: '2026-03-18',
	titel: 'ISO 9001 Audit'
};

describe('calendarEntrySchema', () => {
	it('accepts valid minimal data', () => {
		const result = calendarEntrySchema.safeParse(validEntry);
		expect(result.success).toBe(true);
	});

	it('accepts full data', () => {
		const result = calendarEntrySchema.safeParse({
			...validEntry,
			startzeit: '09:00',
			endzeit: '17:00',
			unternehmen: 'TÜV Nord',
			auditorId: 'aud-123',
			beschreibung: 'Erstzertifizierung',
			auditId: 'audit-456'
		});
		expect(result.success).toBe(true);
	});

	it('rejects missing datum', () => {
		const { datum: _datum, ...rest } = validEntry;
		const result = calendarEntrySchema.safeParse(rest);
		expect(result.success).toBe(false);
	});

	it('rejects empty datum', () => {
		const result = calendarEntrySchema.safeParse({ ...validEntry, datum: '' });
		expect(result.success).toBe(false);
	});

	it('rejects missing titel', () => {
		const { titel: _titel, ...rest } = validEntry;
		const result = calendarEntrySchema.safeParse(rest);
		expect(result.success).toBe(false);
	});

	it('rejects empty titel', () => {
		const result = calendarEntrySchema.safeParse({ ...validEntry, titel: '' });
		expect(result.success).toBe(false);
	});

	it('allows optional fields to be undefined', () => {
		const result = calendarEntrySchema.parse(validEntry);
		expect(result.startzeit).toBeUndefined();
		expect(result.endzeit).toBeUndefined();
		expect(result.unternehmen).toBeUndefined();
		expect(result.auditorId).toBeUndefined();
		expect(result.beschreibung).toBeUndefined();
		expect(result.auditId).toBeUndefined();
	});

	it('preserves all provided values', () => {
		const full = {
			datum: '2026-06-15',
			titel: 'Überwachungsaudit',
			startzeit: '10:00',
			endzeit: '16:00',
			unternehmen: 'Firma GmbH',
			auditorId: 'aud-789',
			beschreibung: 'Jährliches Überwachungsaudit',
			auditId: 'audit-001'
		};
		const result = calendarEntrySchema.parse(full);
		expect(result).toEqual(full);
	});
});
