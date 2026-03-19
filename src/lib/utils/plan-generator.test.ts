import { describe, it, expect } from 'vitest';
import {
	createEmptyBlock,
	createEmptyZeile,
	duplicateBlock,
	reindexBlocks,
	moveBlock,
	calculateHours,
	calculateTotalHours,
	createEmptyAuditzeit,
	applyAutoPopulation
} from './plan-generator';
import type { AuditPlanBlock, AuditPlanBlockZeile } from '$lib/types/audit-plan';

describe('createEmptyBlock', () => {
	it('creates block with one empty zeile', () => {
		const block = createEmptyBlock('plan-1', 0);
		expect(block.auditPlanId).toBe('plan-1');
		expect(block.position).toBe(0);
		expect(block.zeilen).toHaveLength(1);
		expect(block.zeilen[0].blockId).toBe(block.id);
		expect(block.zeilen[0].normkapitel).toEqual([]);
		expect(block.zeilen[0].toggles?.datumToggle).toBe(true);
	});
});

describe('createEmptyZeile', () => {
	it('creates zeile with defaults', () => {
		const zeile = createEmptyZeile('block-1', 2);
		expect(zeile.blockId).toBe('block-1');
		expect(zeile.position).toBe(2);
		expect(zeile.themen).toEqual([]);
		expect(zeile.elemente).toEqual([]);
	});
});

describe('duplicateBlock', () => {
	it('deep copies block with new IDs', () => {
		const original = createEmptyBlock('plan-1', 0);
		original.zeilen[0].organisationseinheit = 'IT';
		original.zeilen[0].normkapitel = ['4.1', '4.2'];
		original.zeilen[0].notizen = { beschreibung: 'Test' };

		const copy = duplicateBlock(original, 1);
		expect(copy.id).not.toBe(original.id);
		expect(copy.position).toBe(1);
		expect(copy.zeilen[0].id).not.toBe(original.zeilen[0].id);
		expect(copy.zeilen[0].blockId).toBe(copy.id);
		expect(copy.zeilen[0].organisationseinheit).toBe('IT');
		expect(copy.zeilen[0].normkapitel).toEqual(['4.1', '4.2']);
		expect(copy.zeilen[0].notizen?.beschreibung).toBe('Test');

		// Verify deep copy (mutations don't affect original)
		copy.zeilen[0].normkapitel.push('5.1');
		expect(original.zeilen[0].normkapitel).toEqual(['4.1', '4.2']);
	});
});

describe('reindexBlocks', () => {
	it('reassigns sequential positions', () => {
		const blocks: AuditPlanBlock[] = [
			{ id: 'a', auditPlanId: 'p', position: 5, zeilen: [] },
			{ id: 'b', auditPlanId: 'p', position: 10, zeilen: [] },
			{ id: 'c', auditPlanId: 'p', position: 2, zeilen: [] }
		];
		const result = reindexBlocks(blocks);
		expect(result.map((b) => b.position)).toEqual([0, 1, 2]);
		expect(result.map((b) => b.id)).toEqual(['a', 'b', 'c']);
	});
});

describe('moveBlock', () => {
	const blocks: AuditPlanBlock[] = [
		{ id: 'a', auditPlanId: 'p', position: 0, zeilen: [] },
		{ id: 'b', auditPlanId: 'p', position: 1, zeilen: [] },
		{ id: 'c', auditPlanId: 'p', position: 2, zeilen: [] }
	];

	it('moves block down', () => {
		const result = moveBlock(blocks, 0, 2);
		expect(result.map((b) => b.id)).toEqual(['b', 'c', 'a']);
		expect(result.map((b) => b.position)).toEqual([0, 1, 2]);
	});

	it('moves block up', () => {
		const result = moveBlock(blocks, 2, 0);
		expect(result.map((b) => b.id)).toEqual(['c', 'a', 'b']);
	});

	it('returns same array for same index', () => {
		const result = moveBlock(blocks, 1, 1);
		expect(result).toBe(blocks);
	});

	it('returns same array for out of bounds', () => {
		expect(moveBlock(blocks, -1, 0)).toBe(blocks);
		expect(moveBlock(blocks, 0, 5)).toBe(blocks);
	});
});

describe('calculateHours', () => {
	it('calculates hours between times', () => {
		expect(calculateHours('09:00', '12:00')).toBe(3);
		expect(calculateHours('08:30', '17:00')).toBe(8.5);
		expect(calculateHours('14:00', '14:30')).toBe(0.5);
	});

	it('returns 0 for empty inputs', () => {
		expect(calculateHours('', '')).toBe(0);
		expect(calculateHours('09:00', '')).toBe(0);
	});

	it('returns 0 when end is before start', () => {
		expect(calculateHours('17:00', '09:00')).toBe(0);
	});

	it('returns 0 for invalid format', () => {
		expect(calculateHours('abc', 'def')).toBe(0);
	});
});

describe('calculateTotalHours', () => {
	it('sums hours across zeilen', () => {
		const zeilen = [
			{ id: '1', auditzeitId: 'a', startzeit: '09:00', endzeit: '12:00', aktivitaet: '', position: 0 },
			{ id: '2', auditzeitId: 'a', startzeit: '13:00', endzeit: '17:00', aktivitaet: '', position: 1 }
		];
		expect(calculateTotalHours(zeilen)).toBe(7);
	});

	it('returns 0 for empty array', () => {
		expect(calculateTotalHours([])).toBe(0);
	});
});

describe('createEmptyAuditzeit', () => {
	it('creates auditzeit with one empty zeile', () => {
		const az = createEmptyAuditzeit('plan-1', 0);
		expect(az.auditPlanId).toBe('plan-1');
		expect(az.zeilen).toHaveLength(1);
		expect(az.zeilen[0].auditzeitId).toBe(az.id);
	});
});

describe('applyAutoPopulation', () => {
	const maps = {
		beschreibungen: {
			IT: 'IT-Abteilung Beschreibung',
			Produktion: 'Produktions Beschreibung'
		},
		zusammenfassungen: {
			IT: 'IT Zusammenfassung',
			Produktion: 'Produktions Zusammenfassung'
		}
	};

	it('fills beschreibung and zusammenfassung', () => {
		const zeile: AuditPlanBlockZeile = createEmptyZeile('b', 0);
		const result = applyAutoPopulation(zeile, 'IT', maps);
		expect(result.organisationseinheit).toBe('IT');
		expect(result.notizen?.beschreibung).toBe('IT-Abteilung Beschreibung');
		expect(result.notizen?.zusammenfassung).toBe('IT Zusammenfassung');
	});

	it('does not overwrite manually edited fields', () => {
		const zeile: AuditPlanBlockZeile = {
			...createEmptyZeile('b', 0),
			manuellBearbeitetBeschreibung: true,
			notizen: { beschreibung: 'Custom text' }
		};
		const result = applyAutoPopulation(zeile, 'IT', maps);
		expect(result.notizen?.beschreibung).toBe('Custom text');
		expect(result.notizen?.zusammenfassung).toBe('IT Zusammenfassung');
	});

	it('does not overwrite manually edited zusammenfassung', () => {
		const zeile: AuditPlanBlockZeile = {
			...createEmptyZeile('b', 0),
			manuellBearbeitetZusammenfassung: true,
			notizen: { zusammenfassung: 'Custom summary' }
		};
		const result = applyAutoPopulation(zeile, 'IT', maps);
		expect(result.notizen?.beschreibung).toBe('IT-Abteilung Beschreibung');
		expect(result.notizen?.zusammenfassung).toBe('Custom summary');
	});

	it('leaves fields empty for unknown org unit', () => {
		const zeile = createEmptyZeile('b', 0);
		const result = applyAutoPopulation(zeile, 'Unknown', maps);
		expect(result.organisationseinheit).toBe('Unknown');
		expect(result.notizen?.beschreibung).toBeUndefined();
	});
});
