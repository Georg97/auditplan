import { describe, it, expect } from 'vitest';
import { auditorCreateSchema, auditorUpdateSchema, auditorSchema } from '$lib/types';
import { getAuditors, getAuditorById, addAuditor, updateAuditor, deleteAuditor } from './auditors.remote';

describe('auditorCreateSchema validation', () => {
	const validData = {
		firstName: 'Max',
		lastName: 'Mustermann',
		email: 'max@example.com'
	};

	it('accepts valid minimal auditor data', () => {
		const result = auditorCreateSchema.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it('accepts full auditor data with all optional fields', () => {
		const result = auditorCreateSchema.safeParse({
			...validData,
			phone: '+49 123 456789',
			company: 'Audit GmbH',
			role: 'Lead Auditor',
			street: 'Hauptstraße 1',
			zip: '12345',
			city: 'Berlin',
			country: 'DE',
			iso9001: true,
			iso14001: false,
			iso45001: true,
			iso27001: false,
			iso50001: false,
			availableFrom: '2026-01-01',
			availableTo: '2026-12-31',
			notes: 'Experienced auditor',
			isExternal: true
		});
		expect(result.success).toBe(true);
	});

	it('rejects missing firstName', () => {
		const result = auditorCreateSchema.safeParse({ lastName: 'Mustermann', email: 'a@b.com' });
		expect(result.success).toBe(false);
	});

	it('rejects empty firstName', () => {
		const result = auditorCreateSchema.safeParse({ ...validData, firstName: '' });
		expect(result.success).toBe(false);
	});

	it('rejects missing lastName', () => {
		const result = auditorCreateSchema.safeParse({ firstName: 'Max', email: 'a@b.com' });
		expect(result.success).toBe(false);
	});

	it('rejects empty lastName', () => {
		const result = auditorCreateSchema.safeParse({ ...validData, lastName: '' });
		expect(result.success).toBe(false);
	});

	it('rejects missing email', () => {
		const result = auditorCreateSchema.safeParse({ firstName: 'Max', lastName: 'Mustermann' });
		expect(result.success).toBe(false);
	});

	it('rejects invalid email format', () => {
		const result = auditorCreateSchema.safeParse({ ...validData, email: 'not-an-email' });
		expect(result.success).toBe(false);
	});

	it('accepts null for nullable optional fields', () => {
		const result = auditorCreateSchema.safeParse({
			...validData,
			phone: null,
			company: null,
			notes: null
		});
		expect(result.success).toBe(true);
	});

	it('defaults ISO booleans to false when omitted', () => {
		const result = auditorCreateSchema.safeParse(validData);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.iso9001).toBe(false);
			expect(result.data.iso14001).toBe(false);
			expect(result.data.iso45001).toBe(false);
			expect(result.data.iso27001).toBe(false);
			expect(result.data.iso50001).toBe(false);
		}
	});

	it('defaults isExternal to false when omitted', () => {
		const result = auditorCreateSchema.safeParse(validData);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.isExternal).toBe(false);
		}
	});
});

describe('auditorUpdateSchema validation', () => {
	it('accepts partial data (all fields optional)', () => {
		const result = auditorUpdateSchema.safeParse({ firstName: 'Updated' });
		expect(result.success).toBe(true);
	});

	it('accepts empty object', () => {
		const result = auditorUpdateSchema.safeParse({});
		expect(result.success).toBe(true);
	});

	it('accepts only email update', () => {
		const result = auditorUpdateSchema.safeParse({ email: 'new@example.com' });
		expect(result.success).toBe(true);
	});

	it('rejects invalid email in update', () => {
		const result = auditorUpdateSchema.safeParse({ email: 'bad-email' });
		expect(result.success).toBe(false);
	});

	it('accepts ISO qualification toggle', () => {
		const result = auditorUpdateSchema.safeParse({ iso9001: true, iso14001: true });
		expect(result.success).toBe(true);
	});
});

describe('auditorSchema (full)', () => {
	it('requires id, organizationId, and timestamps', () => {
		const result = auditorSchema.safeParse({
			firstName: 'Max',
			lastName: 'Mustermann',
			email: 'max@example.com'
		});
		expect(result.success).toBe(false);
	});

	it('accepts complete auditor object', () => {
		const result = auditorSchema.safeParse({
			id: 'aud-1',
			organizationId: 'org-1',
			firstName: 'Max',
			lastName: 'Mustermann',
			email: 'max@example.com',
			createdAt: new Date(),
			updatedAt: new Date()
		});
		expect(result.success).toBe(true);
	});
});

describe('auditor remote function signatures', () => {
	it('getAuditors is a function', () => {
		expect(typeof getAuditors).toBe('function');
	});

	it('getAuditorById is a function', () => {
		expect(typeof getAuditorById).toBe('function');
	});

	it('addAuditor is a function', () => {
		expect(typeof addAuditor).toBe('function');
	});

	it('updateAuditor is a function', () => {
		expect(typeof updateAuditor).toBe('function');
	});

	it('deleteAuditor is a function', () => {
		expect(typeof deleteAuditor).toBe('function');
	});
});
