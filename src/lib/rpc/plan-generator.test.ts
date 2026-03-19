import { describe, it, expect } from 'vitest';
import {
	auditartOptionValues,
	auditartOptionSchema,
	auditSpracheValues,
	auditSpracheSchema,
	schichtsystemValues,
	schichtsystemSchema,
	auditmethodeValues,
	auditmethodeSchema,
	teamRolleValues,
	teamRolleSchema,
	ISO_NORMEN,
	standortSchema,
	normAuswahlSchema,
	auditplanGrunddatenSchema,
	auditplanDetailsSchema,
	auditTeamMitgliedSchema,
	betriebsorganisationSchema,
	auditmethodeBlockSchema,
	revisionSchema,
	revisionMetaSchema,
	auditzeitZeileSchema,
	auditzeitenTabelleSchema,
	auditBlockNotizenSchema,
	manuellBearbeitetSchema,
	auditBlockZeileSchema,
	auditBlockSchema,
	hinweiseVerteilerSchema,
	auditplanDatenSchema,
	createDefaultManuellBearbeitet,
	createDefaultBlockNotizen,
	createDefaultBlockZeile,
	createDefaultAuditBlock,
	createDefaultAuditplanDaten
} from '$lib/types';
import { getSavedPlans, getSavedPlanById, savePlan, updatePlan, deletePlan } from './plans.remote';
import { organisationseinheitOptionen } from '$lib/data/organisationseinheiten';
import { abteilungBeschreibungen } from '$lib/data/abteilung-beschreibungen';
import { zusammenfassungBeschreibungen, zusammenfassungDefaultText } from '$lib/data/zusammenfassungen';

// --- Enum values ---

describe('auditartOptionValues', () => {
	it('contains initial_certification', () => {
		expect(auditartOptionValues).toContain('initial_certification');
	});

	it('contains surveillance_audit', () => {
		expect(auditartOptionValues).toContain('surveillance_audit');
	});

	it('contains recertification', () => {
		expect(auditartOptionValues).toContain('recertification');
	});

	it('contains internal', () => {
		expect(auditartOptionValues).toContain('internal');
	});

	it('contains remote_audit', () => {
		expect(auditartOptionValues).toContain('remote_audit');
	});

	it('contains hybrid_audit', () => {
		expect(auditartOptionValues).toContain('hybrid_audit');
	});

	it('has 16 entries', () => {
		expect(auditartOptionValues).toHaveLength(16);
	});
});

describe('auditSpracheValues', () => {
	it('contains de', () => {
		expect(auditSpracheValues).toContain('de');
	});

	it('contains en', () => {
		expect(auditSpracheValues).toContain('en');
	});

	it('contains fr', () => {
		expect(auditSpracheValues).toContain('fr');
	});

	it('contains zh', () => {
		expect(auditSpracheValues).toContain('zh');
	});
});

describe('schichtsystemValues', () => {
	it('contains single_shift', () => {
		expect(schichtsystemValues).toContain('single_shift');
	});

	it('contains double_shift', () => {
		expect(schichtsystemValues).toContain('double_shift');
	});

	it('contains triple_shift', () => {
		expect(schichtsystemValues).toContain('triple_shift');
	});

	it('contains other', () => {
		expect(schichtsystemValues).toContain('other');
	});

	it('has 4 entries', () => {
		expect(schichtsystemValues).toHaveLength(4);
	});
});

describe('auditmethodeValues', () => {
	it('contains on_site', () => {
		expect(auditmethodeValues).toContain('on_site');
	});

	it('contains on_site_and_remote', () => {
		expect(auditmethodeValues).toContain('on_site_and_remote');
	});

	it('contains fully_remote', () => {
		expect(auditmethodeValues).toContain('fully_remote');
	});

	it('has 3 entries', () => {
		expect(auditmethodeValues).toHaveLength(3);
	});
});

describe('teamRolleValues', () => {
	it('contains lead_auditor', () => {
		expect(teamRolleValues).toContain('lead_auditor');
	});

	it('contains auditors', () => {
		expect(teamRolleValues).toContain('auditors');
	});

	it('contains trainees', () => {
		expect(teamRolleValues).toContain('trainees');
	});

	it('contains experts', () => {
		expect(teamRolleValues).toContain('experts');
	});

	it('has 4 entries', () => {
		expect(teamRolleValues).toHaveLength(4);
	});
});

// --- ISO_NORMEN constant ---

describe('ISO_NORMEN', () => {
	it('has 6 entries', () => {
		expect(ISO_NORMEN).toHaveLength(6);
	});

	it('contains iso9001', () => {
		expect(ISO_NORMEN.some((n) => n.id === 'iso9001')).toBe(true);
	});

	it('contains iso14001', () => {
		expect(ISO_NORMEN.some((n) => n.id === 'iso14001')).toBe(true);
	});

	it('contains iso45001', () => {
		expect(ISO_NORMEN.some((n) => n.id === 'iso45001')).toBe(true);
	});

	it('contains iso50001', () => {
		expect(ISO_NORMEN.some((n) => n.id === 'iso50001')).toBe(true);
	});

	it('contains iso27001', () => {
		expect(ISO_NORMEN.some((n) => n.id === 'iso27001')).toBe(true);
	});

	it('contains andere', () => {
		expect(ISO_NORMEN.some((n) => n.id === 'andere')).toBe(true);
	});

	it('each entry has id and label', () => {
		for (const norm of ISO_NORMEN) {
			expect(norm).toHaveProperty('id');
			expect(norm).toHaveProperty('label');
		}
	});
});

// --- Enum schema validation ---

describe('auditartOptionSchema validation', () => {
	it('accepts valid value', () => {
		expect(auditartOptionSchema.safeParse('internal').success).toBe(true);
	});

	it('rejects invalid value', () => {
		expect(auditartOptionSchema.safeParse('geplant').success).toBe(false);
	});

	it('rejects empty string', () => {
		expect(auditartOptionSchema.safeParse('').success).toBe(false);
	});
});

describe('auditSpracheSchema validation', () => {
	it('accepts de', () => {
		expect(auditSpracheSchema.safeParse('de').success).toBe(true);
	});

	it('accepts en', () => {
		expect(auditSpracheSchema.safeParse('en').success).toBe(true);
	});

	it('rejects invalid language code', () => {
		expect(auditSpracheSchema.safeParse('xx').success).toBe(false);
	});
});

describe('schichtsystemSchema validation', () => {
	it('accepts single_shift', () => {
		expect(schichtsystemSchema.safeParse('single_shift').success).toBe(true);
	});

	it('rejects invalid value', () => {
		expect(schichtsystemSchema.safeParse('nachtschicht').success).toBe(false);
	});
});

describe('auditmethodeSchema validation', () => {
	it('accepts on_site', () => {
		expect(auditmethodeSchema.safeParse('on_site').success).toBe(true);
	});

	it('rejects invalid value', () => {
		expect(auditmethodeSchema.safeParse('hybrid').success).toBe(false);
	});
});

describe('teamRolleSchema validation', () => {
	it('accepts lead_auditor', () => {
		expect(teamRolleSchema.safeParse('lead_auditor').success).toBe(true);
	});

	it('rejects invalid value', () => {
		expect(teamRolleSchema.safeParse('beobachter').success).toBe(false);
	});
});

// --- Sub-schema validation ---

describe('standortSchema validation', () => {
	it('accepts valid standort', () => {
		expect(standortSchema.safeParse({ id: 'loc-1', name: 'Berlin' }).success).toBe(true);
	});

	it('rejects missing id', () => {
		expect(standortSchema.safeParse({ name: 'Berlin' }).success).toBe(false);
	});

	it('rejects missing name', () => {
		expect(standortSchema.safeParse({ id: 'loc-1' }).success).toBe(false);
	});
});

describe('normAuswahlSchema validation', () => {
	const valid = { ausgewaehlteNormen: ['iso9001'], freitext: '', suchbegriff: '' };

	it('accepts valid data', () => {
		expect(normAuswahlSchema.safeParse(valid).success).toBe(true);
	});

	it('accepts empty ausgewaehlteNormen', () => {
		expect(normAuswahlSchema.safeParse({ ...valid, ausgewaehlteNormen: [] }).success).toBe(true);
	});

	it('rejects missing ausgewaehlteNormen', () => {
		const { ausgewaehlteNormen: _, ...rest } = valid;
		expect(normAuswahlSchema.safeParse(rest).success).toBe(false);
	});
});

describe('auditplanGrunddatenSchema validation', () => {
	const valid = {
		auftraggeber: 'Musterfirma GmbH',
		standorte: [{ id: 'loc-1', name: 'Hamburg' }],
		geltungsbereich: 'Produktion',
		normgrundlage: { ausgewaehlteNormen: ['iso9001'], freitext: '', suchbegriff: '' }
	};

	it('accepts valid grunddaten', () => {
		expect(auditplanGrunddatenSchema.safeParse(valid).success).toBe(true);
	});

	it('accepts empty standorte array', () => {
		expect(auditplanGrunddatenSchema.safeParse({ ...valid, standorte: [] }).success).toBe(true);
	});

	it('rejects missing auftraggeber', () => {
		const { auftraggeber: _, ...rest } = valid;
		expect(auditplanGrunddatenSchema.safeParse(rest).success).toBe(false);
	});
});

describe('auditplanDetailsSchema validation', () => {
	const valid = {
		auditart: ['internal'],
		auditartFreitext: '',
		beauftragter: 'Max Mustermann',
		auditziel: 'Konformitaetsnachweis',
		auditzielEditierbar: false,
		auditsprachen: ['de']
	};

	it('accepts valid details', () => {
		expect(auditplanDetailsSchema.safeParse(valid).success).toBe(true);
	});

	it('accepts empty auditsprachen', () => {
		expect(auditplanDetailsSchema.safeParse({ ...valid, auditsprachen: [] }).success).toBe(true);
	});

	it('rejects invalid auditsprache', () => {
		expect(auditplanDetailsSchema.safeParse({ ...valid, auditsprachen: ['xx'] }).success).toBe(false);
	});

	it('rejects missing auditzielEditierbar', () => {
		const { auditzielEditierbar: _, ...rest } = valid;
		expect(auditplanDetailsSchema.safeParse(rest).success).toBe(false);
	});
});

describe('auditTeamMitgliedSchema validation', () => {
	const valid = {
		id: 'tm-1',
		rolle: 'lead_auditor',
		name: 'Anna Schmidt',
		istExtern: false,
		firmenname: ''
	};

	it('accepts valid team member', () => {
		expect(auditTeamMitgliedSchema.safeParse(valid).success).toBe(true);
	});

	it('rejects invalid rolle', () => {
		expect(auditTeamMitgliedSchema.safeParse({ ...valid, rolle: 'observer' }).success).toBe(false);
	});

	it('rejects missing istExtern', () => {
		const { istExtern: _, ...rest } = valid;
		expect(auditTeamMitgliedSchema.safeParse(rest).success).toBe(false);
	});
});

describe('betriebsorganisationSchema validation', () => {
	const valid = {
		schichtsystem: 'single_shift',
		schichtsystemFreitext: '',
		schichtuebergaben: '',
		bemerkung: ''
	};

	it('accepts valid betriebsorganisation', () => {
		expect(betriebsorganisationSchema.safeParse(valid).success).toBe(true);
	});

	it('rejects invalid schichtsystem', () => {
		expect(betriebsorganisationSchema.safeParse({ ...valid, schichtsystem: 'quad_shift' }).success).toBe(false);
	});
});

describe('auditmethodeBlockSchema validation', () => {
	const valid = {
		methode: 'on_site',
		iktTechnik: '',
		iktTestdatum: '',
		testLetztesAudit: false,
		gastgeber: ''
	};

	it('accepts valid auditmethode block', () => {
		expect(auditmethodeBlockSchema.safeParse(valid).success).toBe(true);
	});

	it('rejects invalid methode', () => {
		expect(auditmethodeBlockSchema.safeParse({ ...valid, methode: 'mixed' }).success).toBe(false);
	});
});

describe('revisionSchema validation', () => {
	const valid = { id: 'rev-1', nummer: '1.0', datum: '2026-01-01', beschreibung: 'Initial' };

	it('accepts valid revision', () => {
		expect(revisionSchema.safeParse(valid).success).toBe(true);
	});

	it('rejects missing nummer', () => {
		const { nummer: _, ...rest } = valid;
		expect(revisionSchema.safeParse(rest).success).toBe(false);
	});
});

describe('revisionMetaSchema validation', () => {
	const valid = { ortDatum: 'Berlin, 2026-01-01', aenderungWaehrendAudit: '', kommentare: '' };

	it('accepts valid revision meta', () => {
		expect(revisionMetaSchema.safeParse(valid).success).toBe(true);
	});

	it('rejects missing ortDatum', () => {
		const { ortDatum: _, ...rest } = valid;
		expect(revisionMetaSchema.safeParse(rest).success).toBe(false);
	});
});

describe('auditzeitZeileSchema validation', () => {
	const valid = { id: 'z-1', startzeit: '09:00', endzeit: '12:00', aktivitaet: 'Eroeffnung', stunden: 3 };

	it('accepts valid zeile', () => {
		expect(auditzeitZeileSchema.safeParse(valid).success).toBe(true);
	});

	it('rejects non-number stunden', () => {
		expect(auditzeitZeileSchema.safeParse({ ...valid, stunden: '3' }).success).toBe(false);
	});
});

describe('auditzeitenTabelleSchema validation', () => {
	const valid = {
		id: 'tab-1',
		auditorId: 'aud-1',
		auditorName: 'Max Muster',
		standortId: 'loc-1',
		standortName: 'Berlin',
		zeilen: [],
		gesamtStunden: 0
	};

	it('accepts valid tabelle', () => {
		expect(auditzeitenTabelleSchema.safeParse(valid).success).toBe(true);
	});

	it('rejects non-number gesamtStunden', () => {
		expect(auditzeitenTabelleSchema.safeParse({ ...valid, gesamtStunden: '0' }).success).toBe(false);
	});
});

describe('auditBlockNotizenSchema validation', () => {
	const valid = {
		beschreibung: '',
		vorstellung: '',
		allgemein: '',
		notizen: '',
		dokumente: '',
		zusammenfassung: ''
	};

	it('accepts valid notizen', () => {
		expect(auditBlockNotizenSchema.safeParse(valid).success).toBe(true);
	});

	it('rejects missing zusammenfassung', () => {
		const { zusammenfassung: _, ...rest } = valid;
		expect(auditBlockNotizenSchema.safeParse(rest).success).toBe(false);
	});
});

describe('manuellBearbeitetSchema validation', () => {
	const valid = { beschreibung: false, zusammenfassung: false, thema: false, normkapitel: false };

	it('accepts valid manuell bearbeitet', () => {
		expect(manuellBearbeitetSchema.safeParse(valid).success).toBe(true);
	});

	it('rejects non-boolean beschreibung', () => {
		expect(manuellBearbeitetSchema.safeParse({ ...valid, beschreibung: 'false' }).success).toBe(false);
	});
});

describe('auditBlockZeileSchema validation', () => {
	const valid = {
		id: 'zeile-1',
		blockId: 'block-1',
		datum: '2026-03-19',
		uhrzeitVon: '09:00',
		uhrzeitBis: '10:00',
		istRemote: false,
		organisationseinheit: 'Produktion',
		normkapitel: [],
		thema: [],
		elementProzess: [],
		auditor: 'Max Muster',
		gespraechspartner: '',
		datumToggle: true,
		uhrzeitToggle: true,
		remoteToggle: true,
		notizen: {
			beschreibung: '',
			vorstellung: '',
			allgemein: '',
			notizen: '',
			dokumente: '',
			zusammenfassung: ''
		},
		manuellBearbeitet: { beschreibung: false, zusammenfassung: false, thema: false, normkapitel: false }
	};

	it('accepts valid block zeile', () => {
		expect(auditBlockZeileSchema.safeParse(valid).success).toBe(true);
	});

	it('rejects missing blockId', () => {
		const { blockId: _, ...rest } = valid;
		expect(auditBlockZeileSchema.safeParse(rest).success).toBe(false);
	});

	it('rejects non-boolean istRemote', () => {
		expect(auditBlockZeileSchema.safeParse({ ...valid, istRemote: 'false' }).success).toBe(false);
	});
});

describe('auditBlockSchema validation', () => {
	const valid = { id: 'block-1', zeilen: [], position: 0 };

	it('accepts valid block', () => {
		expect(auditBlockSchema.safeParse(valid).success).toBe(true);
	});

	it('rejects non-number position', () => {
		expect(auditBlockSchema.safeParse({ ...valid, position: '0' }).success).toBe(false);
	});

	it('rejects missing position', () => {
		const { position: _, ...rest } = valid;
		expect(auditBlockSchema.safeParse(rest).success).toBe(false);
	});
});

describe('hinweiseVerteilerSchema validation', () => {
	const valid = {
		infoText: '',
		verteiler: '',
		verteilungOptionen: {
			auditteam: false,
			geschaeftsfuehrung: false,
			fachabteilungen: false,
			extern: false
		}
	};

	it('accepts valid hinweise verteiler', () => {
		expect(hinweiseVerteilerSchema.safeParse(valid).success).toBe(true);
	});

	it('rejects missing verteilungOptionen', () => {
		const { verteilungOptionen: _, ...rest } = valid;
		expect(hinweiseVerteilerSchema.safeParse(rest).success).toBe(false);
	});

	it('rejects non-boolean auditteam', () => {
		expect(
			hinweiseVerteilerSchema.safeParse({
				...valid,
				verteilungOptionen: { ...valid.verteilungOptionen, auditteam: 'true' }
			}).success
		).toBe(false);
	});
});

// --- auditplanDatenSchema (main schema) ---

describe('auditplanDatenSchema validation', () => {
	const validDaten = {
		zertifikatsnummern: [],
		logoBase64: null,
		logoDateiname: null,
		grunddaten: {
			auftraggeber: 'Testfirma AG',
			standorte: [],
			geltungsbereich: 'Alle Prozesse',
			normgrundlage: { ausgewaehlteNormen: [], freitext: '', suchbegriff: '' }
		},
		auditdetails: {
			auditart: [],
			auditartFreitext: '',
			beauftragter: '',
			auditziel: '',
			auditzielEditierbar: false,
			auditsprachen: []
		},
		auditTeam: [],
		betriebsorganisation: {
			schichtsystem: 'single_shift',
			schichtsystemFreitext: '',
			schichtuebergaben: '',
			bemerkung: ''
		},
		auditmethode: {
			methode: 'on_site',
			iktTechnik: '',
			iktTestdatum: '',
			testLetztesAudit: false,
			gastgeber: ''
		},
		revisionen: [],
		revisionMeta: { ortDatum: '', aenderungWaehrendAudit: '', kommentare: '' },
		auditzeiten: [],
		auditBloecke: [],
		hinweiseVerteiler: {
			infoText: '',
			verteiler: '',
			verteilungOptionen: {
				auditteam: false,
				geschaeftsfuehrung: false,
				fachabteilungen: false,
				extern: false
			}
		}
	};

	it('accepts valid auditplan daten', () => {
		expect(auditplanDatenSchema.safeParse(validDaten).success).toBe(true);
	});

	it('accepts null logoBase64', () => {
		expect(auditplanDatenSchema.safeParse({ ...validDaten, logoBase64: null }).success).toBe(true);
	});

	it('accepts string logoBase64', () => {
		expect(auditplanDatenSchema.safeParse({ ...validDaten, logoBase64: 'data:image/png;base64,...' }).success).toBe(true);
	});

	it('rejects missing grunddaten', () => {
		const { grunddaten: _, ...rest } = validDaten;
		expect(auditplanDatenSchema.safeParse(rest).success).toBe(false);
	});

	it('rejects missing auditBloecke', () => {
		const { auditBloecke: _, ...rest } = validDaten;
		expect(auditplanDatenSchema.safeParse(rest).success).toBe(false);
	});

	it('rejects invalid schichtsystem in betriebsorganisation', () => {
		expect(
			auditplanDatenSchema.safeParse({
				...validDaten,
				betriebsorganisation: { ...validDaten.betriebsorganisation, schichtsystem: 'invalid' }
			}).success
		).toBe(false);
	});
});

// --- Factory functions ---

describe('createDefaultManuellBearbeitet', () => {
	it('returns all false booleans', () => {
		const result = createDefaultManuellBearbeitet();
		expect(result.beschreibung).toBe(false);
		expect(result.zusammenfassung).toBe(false);
		expect(result.thema).toBe(false);
		expect(result.normkapitel).toBe(false);
	});

	it('returns valid manuellBearbeitet object', () => {
		expect(manuellBearbeitetSchema.safeParse(createDefaultManuellBearbeitet()).success).toBe(true);
	});
});

describe('createDefaultBlockNotizen', () => {
	it('returns all empty strings', () => {
		const result = createDefaultBlockNotizen();
		expect(result.beschreibung).toBe('');
		expect(result.vorstellung).toBe('');
		expect(result.allgemein).toBe('');
		expect(result.notizen).toBe('');
		expect(result.dokumente).toBe('');
		expect(result.zusammenfassung).toBe('');
	});

	it('returns valid auditBlockNotizen object', () => {
		expect(auditBlockNotizenSchema.safeParse(createDefaultBlockNotizen()).success).toBe(true);
	});
});

describe('createDefaultBlockZeile', () => {
	it('sets blockId and id correctly', () => {
		const result = createDefaultBlockZeile('block-42', 'zeile-99');
		expect(result.blockId).toBe('block-42');
		expect(result.id).toBe('zeile-99');
	});

	it('initializes arrays as empty', () => {
		const result = createDefaultBlockZeile('b', 'z');
		expect(result.normkapitel).toEqual([]);
		expect(result.thema).toEqual([]);
		expect(result.elementProzess).toEqual([]);
	});

	it('sets toggle defaults to true', () => {
		const result = createDefaultBlockZeile('b', 'z');
		expect(result.datumToggle).toBe(true);
		expect(result.uhrzeitToggle).toBe(true);
		expect(result.remoteToggle).toBe(true);
	});

	it('sets istRemote to false', () => {
		expect(createDefaultBlockZeile('b', 'z').istRemote).toBe(false);
	});

	it('returns valid auditBlockZeile object', () => {
		expect(auditBlockZeileSchema.safeParse(createDefaultBlockZeile('b', 'z')).success).toBe(true);
	});
});

describe('createDefaultAuditBlock', () => {
	it('sets id and position correctly', () => {
		const result = createDefaultAuditBlock('block-1', 0);
		expect(result.id).toBe('block-1');
		expect(result.position).toBe(0);
	});

	it('initializes with one zeile', () => {
		const result = createDefaultAuditBlock('block-1', 0);
		expect(result.zeilen).toHaveLength(1);
	});

	it('the initial zeile has the correct blockId', () => {
		const result = createDefaultAuditBlock('block-abc', 2);
		expect(result.zeilen[0].blockId).toBe('block-abc');
	});

	it('returns valid auditBlock object', () => {
		expect(auditBlockSchema.safeParse(createDefaultAuditBlock('b', 0)).success).toBe(true);
	});
});

describe('createDefaultAuditplanDaten', () => {
	it('returns valid auditplanDaten', () => {
		expect(auditplanDatenSchema.safeParse(createDefaultAuditplanDaten()).success).toBe(true);
	});

	it('initializes zertifikatsnummern as empty array', () => {
		expect(createDefaultAuditplanDaten().zertifikatsnummern).toEqual([]);
	});

	it('initializes logoBase64 as null', () => {
		expect(createDefaultAuditplanDaten().logoBase64).toBeNull();
	});

	it('initializes logoDateiname as null', () => {
		expect(createDefaultAuditplanDaten().logoDateiname).toBeNull();
	});

	it('initializes auditTeam as empty array', () => {
		expect(createDefaultAuditplanDaten().auditTeam).toEqual([]);
	});

	it('initializes auditBloecke as empty array', () => {
		expect(createDefaultAuditplanDaten().auditBloecke).toEqual([]);
	});

	it('sets default schichtsystem to single_shift', () => {
		expect(createDefaultAuditplanDaten().betriebsorganisation.schichtsystem).toBe('single_shift');
	});

	it('sets default auditmethode to on_site', () => {
		expect(createDefaultAuditplanDaten().auditmethode.methode).toBe('on_site');
	});

	it('initializes grunddaten with one standort', () => {
		const daten = createDefaultAuditplanDaten();
		expect(daten.grunddaten.standorte).toHaveLength(1);
	});

	it('sets auditzielEditierbar to false', () => {
		expect(createDefaultAuditplanDaten().auditdetails.auditzielEditierbar).toBe(false);
	});

	it('sets all hinweiseVerteiler verteilungOptionen to false', () => {
		const { verteilungOptionen } = createDefaultAuditplanDaten().hinweiseVerteiler;
		expect(verteilungOptionen.auditteam).toBe(false);
		expect(verteilungOptionen.geschaeftsfuehrung).toBe(false);
		expect(verteilungOptionen.fachabteilungen).toBe(false);
		expect(verteilungOptionen.extern).toBe(false);
	});
});

// --- Remote function exports ---

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

// --- PG04: Block CRUD operations ---

describe('createDefaultAuditBlock — factory (PG04)', () => {
	it('creates a block with the given id', () => {
		const block = createDefaultAuditBlock('block-xyz', 3);
		expect(block.id).toBe('block-xyz');
	});

	it('creates a block with the given position', () => {
		const block = createDefaultAuditBlock('block-xyz', 3);
		expect(block.position).toBe(3);
	});

	it('creates a block with exactly one default zeile', () => {
		const block = createDefaultAuditBlock('block-xyz', 3);
		expect(block.zeilen).toHaveLength(1);
	});

	it('the default zeile references the block id via blockId', () => {
		const block = createDefaultAuditBlock('block-abc', 0);
		expect(block.zeilen[0].blockId).toBe('block-abc');
	});

	it('default zeile has datumToggle set to true', () => {
		const block = createDefaultAuditBlock('b', 0);
		expect(block.zeilen[0].datumToggle).toBe(true);
	});

	it('default zeile has uhrzeitToggle set to true', () => {
		const block = createDefaultAuditBlock('b', 0);
		expect(block.zeilen[0].uhrzeitToggle).toBe(true);
	});

	it('default zeile has remoteToggle set to true', () => {
		const block = createDefaultAuditBlock('b', 0);
		expect(block.zeilen[0].remoteToggle).toBe(true);
	});

	it('default zeile has manuellBearbeitet.beschreibung set to false', () => {
		const block = createDefaultAuditBlock('b', 0);
		expect(block.zeilen[0].manuellBearbeitet.beschreibung).toBe(false);
	});

	it('default zeile has manuellBearbeitet.zusammenfassung set to false', () => {
		const block = createDefaultAuditBlock('b', 0);
		expect(block.zeilen[0].manuellBearbeitet.zusammenfassung).toBe(false);
	});

	it('default zeile has manuellBearbeitet.thema set to false', () => {
		const block = createDefaultAuditBlock('b', 0);
		expect(block.zeilen[0].manuellBearbeitet.thema).toBe(false);
	});

	it('default zeile has manuellBearbeitet.normkapitel set to false', () => {
		const block = createDefaultAuditBlock('b', 0);
		expect(block.zeilen[0].manuellBearbeitet.normkapitel).toBe(false);
	});

	it('default zeile has all notizen fields as empty strings', () => {
		const block = createDefaultAuditBlock('b', 0);
		const { notizen } = block.zeilen[0];
		expect(notizen.beschreibung).toBe('');
		expect(notizen.vorstellung).toBe('');
		expect(notizen.allgemein).toBe('');
		expect(notizen.notizen).toBe('');
		expect(notizen.dokumente).toBe('');
		expect(notizen.zusammenfassung).toBe('');
	});

	it('block position field is a number', () => {
		const block = createDefaultAuditBlock('b', 7);
		expect(typeof block.position).toBe('number');
	});

	it('default zeile normkapitel is an array', () => {
		const block = createDefaultAuditBlock('b', 0);
		expect(Array.isArray(block.zeilen[0].normkapitel)).toBe(true);
	});

	it('default zeile thema is an array', () => {
		const block = createDefaultAuditBlock('b', 0);
		expect(Array.isArray(block.zeilen[0].thema)).toBe(true);
	});

	it('default zeile elementProzess is an array', () => {
		const block = createDefaultAuditBlock('b', 0);
		expect(Array.isArray(block.zeilen[0].elementProzess)).toBe(true);
	});

	it('auditBlockSchema validates a block with multiple zeilen', () => {
		const zeile1 = createDefaultBlockZeile('block-1', 'zeile-1');
		const zeile2 = createDefaultBlockZeile('block-1', 'zeile-2');
		const block = { id: 'block-1', zeilen: [zeile1, zeile2], position: 0 };
		expect(auditBlockSchema.safeParse(block).success).toBe(true);
	});
});

// --- PG04: Block deep clone behavior ---

describe('AuditBlock deep clone behavior (PG04)', () => {
	it('structuredClone preserves block id', () => {
		const original = createDefaultAuditBlock('block-original', 1);
		const clone = structuredClone(original);
		expect(clone.id).toBe('block-original');
	});

	it('structuredClone preserves block position', () => {
		const original = createDefaultAuditBlock('block-original', 5);
		const clone = structuredClone(original);
		expect(clone.position).toBe(5);
	});

	it('structuredClone preserves nested zeile blockId', () => {
		const original = createDefaultAuditBlock('block-original', 0);
		const clone = structuredClone(original);
		expect(clone.zeilen[0].blockId).toBe('block-original');
	});

	it('cloned block zeilen have independent manuellBearbeitet flags', () => {
		const original = createDefaultAuditBlock('block-clone', 0);
		const clone = structuredClone(original);
		clone.zeilen[0].manuellBearbeitet.beschreibung = true;
		expect(original.zeilen[0].manuellBearbeitet.beschreibung).toBe(false);
	});

	it('cloned block zeilen have independent notizen.beschreibung', () => {
		const original = createDefaultAuditBlock('block-clone', 0);
		const clone = structuredClone(original);
		clone.zeilen[0].notizen.beschreibung = 'changed';
		expect(original.zeilen[0].notizen.beschreibung).toBe('');
	});

	it('cloned block zeilen have independent notizen.zusammenfassung', () => {
		const original = createDefaultAuditBlock('block-clone', 0);
		const clone = structuredClone(original);
		clone.zeilen[0].notizen.zusammenfassung = 'summary changed';
		expect(original.zeilen[0].notizen.zusammenfassung).toBe('');
	});

	it('cloned block zeilen array is independent from original', () => {
		const original = createDefaultAuditBlock('block-clone', 0);
		const clone = structuredClone(original);
		clone.zeilen.push(createDefaultBlockZeile('block-clone', 'extra-zeile'));
		expect(original.zeilen).toHaveLength(1);
	});
});

// --- PG06: Auto-population data ---

describe('organisationseinheitOptionen (PG06)', () => {
	it('is a non-empty array', () => {
		expect(Array.isArray(organisationseinheitOptionen)).toBe(true);
		expect(organisationseinheitOptionen.length).toBeGreaterThan(0);
	});

	it('has at least 5 entries', () => {
		expect(organisationseinheitOptionen.length).toBeGreaterThanOrEqual(5);
	});

	it('each entry has a name string', () => {
		for (const entry of organisationseinheitOptionen) {
			expect(typeof entry.name).toBe('string');
		}
	});

	it('each entry has a themen array', () => {
		for (const entry of organisationseinheitOptionen) {
			expect(Array.isArray(entry.themen)).toBe(true);
		}
	});

	it('each themen array contains only strings', () => {
		for (const entry of organisationseinheitOptionen) {
			for (const thema of entry.themen) {
				expect(typeof thema).toBe('string');
			}
		}
	});

	it('each entry themen array is non-empty', () => {
		for (const entry of organisationseinheitOptionen) {
			expect(entry.themen.length).toBeGreaterThan(0);
		}
	});

	it('contains a Management entry', () => {
		expect(organisationseinheitOptionen.some((e) => e.name === 'Management')).toBe(true);
	});

	it('contains a Produktion entry', () => {
		expect(organisationseinheitOptionen.some((e) => e.name === 'Produktion')).toBe(true);
	});
});

describe('abteilungBeschreibungen (PG06)', () => {
	it('is defined and not null', () => {
		expect(abteilungBeschreibungen).toBeDefined();
		expect(abteilungBeschreibungen).not.toBeNull();
	});

	it('is an object', () => {
		expect(typeof abteilungBeschreibungen).toBe('object');
	});

	it('contains a Management description', () => {
		expect(typeof abteilungBeschreibungen['Management']).toBe('string');
		expect(abteilungBeschreibungen['Management'].length).toBeGreaterThan(0);
	});

	it('contains a Produktion description', () => {
		expect(typeof abteilungBeschreibungen['Produktion']).toBe('string');
		expect(abteilungBeschreibungen['Produktion'].length).toBeGreaterThan(0);
	});
});

describe('zusammenfassungBeschreibungen (PG06)', () => {
	it('is defined and not null', () => {
		expect(zusammenfassungBeschreibungen).toBeDefined();
		expect(zusammenfassungBeschreibungen).not.toBeNull();
	});

	it('is an object', () => {
		expect(typeof zusammenfassungBeschreibungen).toBe('object');
	});

	it('contains a Management summary', () => {
		expect(typeof zusammenfassungBeschreibungen['Management']).toBe('string');
		expect(zusammenfassungBeschreibungen['Management'].length).toBeGreaterThan(0);
	});

	it('contains a Produktion summary', () => {
		expect(typeof zusammenfassungBeschreibungen['Produktion']).toBe('string');
		expect(zusammenfassungBeschreibungen['Produktion'].length).toBeGreaterThan(0);
	});

	it('zusammenfassungDefaultText is a non-empty string', () => {
		expect(typeof zusammenfassungDefaultText).toBe('string');
		expect(zusammenfassungDefaultText.length).toBeGreaterThan(0);
	});
});

// --- PG06: Manual edit protection schema ---

describe('manuellBearbeitetSchema — extended validation (PG06)', () => {
	const allFalse = { beschreibung: false, zusammenfassung: false, thema: false, normkapitel: false };

	it('validates when all fields are false', () => {
		expect(manuellBearbeitetSchema.safeParse(allFalse).success).toBe(true);
	});

	it('validates when all fields are true', () => {
		const allTrue = { beschreibung: true, zusammenfassung: true, thema: true, normkapitel: true };
		expect(manuellBearbeitetSchema.safeParse(allTrue).success).toBe(true);
	});

	it('rejects when beschreibung is missing', () => {
		const { beschreibung: _, ...rest } = allFalse;
		expect(manuellBearbeitetSchema.safeParse(rest).success).toBe(false);
	});

	it('rejects when zusammenfassung is missing', () => {
		const { zusammenfassung: _, ...rest } = allFalse;
		expect(manuellBearbeitetSchema.safeParse(rest).success).toBe(false);
	});

	it('rejects when thema is missing', () => {
		const { thema: _, ...rest } = allFalse;
		expect(manuellBearbeitetSchema.safeParse(rest).success).toBe(false);
	});

	it('rejects when normkapitel is missing', () => {
		const { normkapitel: _, ...rest } = allFalse;
		expect(manuellBearbeitetSchema.safeParse(rest).success).toBe(false);
	});

	it('rejects when beschreibung is a string instead of boolean', () => {
		expect(manuellBearbeitetSchema.safeParse({ ...allFalse, beschreibung: 'false' }).success).toBe(false);
	});

	it('rejects when zusammenfassung is a number instead of boolean', () => {
		expect(manuellBearbeitetSchema.safeParse({ ...allFalse, zusammenfassung: 0 }).success).toBe(false);
	});

	it('rejects when thema is null instead of boolean', () => {
		expect(manuellBearbeitetSchema.safeParse({ ...allFalse, thema: null }).success).toBe(false);
	});

	it('rejects when normkapitel is undefined instead of boolean', () => {
		expect(manuellBearbeitetSchema.safeParse({ ...allFalse, normkapitel: undefined }).success).toBe(false);
	});

	it('createDefaultManuellBearbeitet output passes the schema', () => {
		expect(manuellBearbeitetSchema.safeParse(createDefaultManuellBearbeitet()).success).toBe(true);
	});
});
