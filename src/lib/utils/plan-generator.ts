/**
 * Pure utility functions for the Auditplan Generator.
 * These handle block operations, auto-population, and time calculations.
 */

import type {
	AuditPlanBlock,
	AuditPlanBlockZeile,
	AuditPlanBlockZeilenNotizen,
	AuditPlanBlockZeilenToggles,
	AuditPlanAuditzeit,
	AuditPlanAuditzeitZeile
} from '$lib/types/audit-plan';

// ── ID Generation ───────────────────────────────────────────────

let idCounter = 0;
export function generateId(): string {
	return `${Date.now()}-${++idCounter}`;
}

// ── Block Operations ────────────────────────────────────────────

export function createEmptyZeile(blockId: string, position: number): AuditPlanBlockZeile {
	return {
		id: generateId(),
		blockId,
		position,
		normkapitel: [],
		themen: [],
		elemente: [],
		toggles: { datumToggle: true, uhrzeitToggle: true, remoteToggle: true },
		notizen: {}
	};
}

export function createEmptyBlock(auditPlanId: string, position: number): AuditPlanBlock {
	const blockId = generateId();
	return {
		id: blockId,
		auditPlanId,
		position,
		zeilen: [createEmptyZeile(blockId, 0)]
	};
}

export function duplicateBlock(block: AuditPlanBlock, insertPosition: number): AuditPlanBlock {
	const newBlockId = generateId();
	return {
		id: newBlockId,
		auditPlanId: block.auditPlanId,
		position: insertPosition,
		zeilen: block.zeilen.map((zeile, idx) => ({
			...zeile,
			id: generateId(),
			blockId: newBlockId,
			position: idx,
			notizen: zeile.notizen ? { ...zeile.notizen } : undefined,
			toggles: zeile.toggles ? { ...zeile.toggles } : undefined,
			normkapitel: [...zeile.normkapitel],
			themen: [...zeile.themen],
			elemente: [...zeile.elemente]
		}))
	};
}

export function reindexBlocks(blocks: AuditPlanBlock[]): AuditPlanBlock[] {
	return blocks.map((block, idx) => ({ ...block, position: idx }));
}

export function moveBlock(blocks: AuditPlanBlock[], fromIndex: number, toIndex: number): AuditPlanBlock[] {
	if (fromIndex === toIndex) return blocks;
	if (fromIndex < 0 || fromIndex >= blocks.length) return blocks;
	if (toIndex < 0 || toIndex >= blocks.length) return blocks;
	const result = [...blocks];
	const [moved] = result.splice(fromIndex, 1);
	result.splice(toIndex, 0, moved);
	return reindexBlocks(result);
}

// ── Auditzeit Calculations ─────────────────────────────────────

export function calculateHours(startzeit: string, endzeit: string): number {
	if (!startzeit || !endzeit) return 0;
	const [sh, sm] = startzeit.split(':').map(Number);
	const [eh, em] = endzeit.split(':').map(Number);
	if (isNaN(sh) || isNaN(sm) || isNaN(eh) || isNaN(em)) return 0;
	const startMinutes = sh * 60 + sm;
	const endMinutes = eh * 60 + em;
	if (endMinutes <= startMinutes) return 0;
	return Math.round(((endMinutes - startMinutes) / 60) * 100) / 100;
}

export function calculateTotalHours(zeilen: AuditPlanAuditzeitZeile[]): number {
	return zeilen.reduce((sum, z) => sum + calculateHours(z.startzeit, z.endzeit), 0);
}

export function createEmptyAuditzeit(auditPlanId: string, position: number): AuditPlanAuditzeit {
	const id = generateId();
	return {
		id,
		auditPlanId,
		auditor: '',
		standort: '',
		position,
		zeilen: [createEmptyAuditzeitZeile(id, 0)]
	};
}

export function createEmptyAuditzeitZeile(auditzeitId: string, position: number): AuditPlanAuditzeitZeile {
	return {
		id: generateId(),
		auditzeitId,
		startzeit: '',
		endzeit: '',
		aktivitaet: '',
		position
	};
}

// ── Auto-Population ─────────────────────────────────────────────

export interface AutoPopulationMaps {
	beschreibungen: Record<string, string>;
	zusammenfassungen: Record<string, string>;
}

export function applyAutoPopulation(zeile: AuditPlanBlockZeile, orgEinheit: string, maps: AutoPopulationMaps): AuditPlanBlockZeile {
	const updated = { ...zeile, organisationseinheit: orgEinheit };

	if (!updated.notizen) {
		updated.notizen = {} as AuditPlanBlockZeilenNotizen;
	} else {
		updated.notizen = { ...updated.notizen };
	}

	if (!updated.manuellBearbeitetBeschreibung && maps.beschreibungen[orgEinheit]) {
		updated.notizen.beschreibung = maps.beschreibungen[orgEinheit];
	}

	if (!updated.manuellBearbeitetZusammenfassung && maps.zusammenfassungen[orgEinheit]) {
		updated.notizen.zusammenfassung = maps.zusammenfassungen[orgEinheit];
	}

	return updated;
}

// ── Default Toggles ─────────────────────────────────────────────

export function defaultToggles(): AuditPlanBlockZeilenToggles {
	return { datumToggle: true, uhrzeitToggle: true, remoteToggle: true };
}

export function defaultNotizen(): AuditPlanBlockZeilenNotizen {
	return {};
}
