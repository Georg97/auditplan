import { describe, it, expect } from 'vitest';
import { actionSchema, FINDING_TYPES, ACTION_STATUSES, PRIORITIES, ACTION_AUDIT_TYPES, ACTION_NORMS, findingTypeColor, isOverdue } from './action';

describe('action constants', () => {
	it('has 7 finding types', () => {
		expect(FINDING_TYPES).toHaveLength(7);
	});

	it('has 5 action statuses', () => {
		expect(ACTION_STATUSES).toHaveLength(5);
	});

	it('has 3 priorities', () => {
		expect(PRIORITIES).toHaveLength(3);
	});

	it('has 6 audit types', () => {
		expect(ACTION_AUDIT_TYPES).toHaveLength(6);
	});

	it('has 7 action norms', () => {
		expect(ACTION_NORMS).toHaveLength(7);
	});
});

describe('actionSchema', () => {
	it('accepts minimal valid data', () => {
		const result = actionSchema.safeParse({});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.status).toBe('open');
		}
	});

	it('accepts full valid data', () => {
		const result = actionSchema.safeParse({
			auditId: 'audit-1',
			description: 'Test finding',
			findingType: 'major_nonconformity',
			plannedAction: 'Fix it',
			status: 'in_progress',
			responsible: 'John',
			priority: 'high',
			dueDate: '2026-04-01',
			completionDate: '2026-04-15',
			norm: 'ISO 9001',
			evidenceNotes: 'Evidence attached',
			auditType: 'internal'
		});
		expect(result.success).toBe(true);
	});

	it('rejects invalid finding type', () => {
		const result = actionSchema.safeParse({ findingType: 'invalid' });
		expect(result.success).toBe(false);
	});

	it('rejects invalid status', () => {
		const result = actionSchema.safeParse({ status: 'invalid' });
		expect(result.success).toBe(false);
	});

	it('rejects invalid audit type', () => {
		const result = actionSchema.safeParse({ auditType: 'invalid' });
		expect(result.success).toBe(false);
	});
});

describe('findingTypeColor', () => {
	it('returns destructive for major_nonconformity', () => {
		expect(findingTypeColor('major_nonconformity')).toContain('destructive');
	});

	it('returns green for positive_finding', () => {
		expect(findingTypeColor('positive_finding')).toContain('green');
	});

	it('returns muted for note', () => {
		expect(findingTypeColor('note')).toContain('muted');
	});
});

describe('isOverdue', () => {
	it('returns false when no due date', () => {
		expect(isOverdue(undefined, 'open')).toBe(false);
	});

	it('returns false when status is completed', () => {
		expect(isOverdue('2020-01-01', 'completed')).toBe(false);
	});

	it('returns true when due date is in the past and not completed', () => {
		expect(isOverdue('2020-01-01', 'open')).toBe(true);
	});

	it('returns false when due date is in the future', () => {
		expect(isOverdue('2099-12-31', 'open')).toBe(false);
	});
});
