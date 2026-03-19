/**
 * Auditplan Word Export (§17)
 * Generates a .docx document from audit plan data.
 */
import { Document, Packer, Paragraph, Table, TableRow, TextRun, Header, Footer, PageNumber, WidthType } from 'docx';
import { PAGE_MARGINS, PAGE_BORDER, COLORS, FONT_SIZES, createTextRun, createParagraph, createTableCell, createHeaderTable, createSectionBorder } from './helpers';

export interface AuditplanWordData {
	firma?: string;
	standard?: string;
	zertifikat?: string;
	auditart?: string;
	datum?: string;
	standort?: string;
	auditor?: string;
	logoBase64?: string;

	auftraggeber?: {
		name?: string;
		anschrift?: string;
	};

	standorte?: { name: string; adresse?: string }[];

	blocks: AuditplanBlockData[];
}

export interface AuditplanBlockData {
	uhrzeit?: string;
	abteilung?: string;
	auditor?: string;
	beschreibung?: string;
	vorstellung?: string;
	allgemein?: string;
	notizen?: string;
	dokumente?: string;
	zusammenfassung?: string;
}

function createBlockTable(block: AuditplanBlockData): Table {
	const rows: TableRow[] = [];
	const borders = createSectionBorder();

	// Info row (yellow)
	const infoParts: string[] = [];
	if (block.uhrzeit) infoParts.push(block.uhrzeit);
	if (block.abteilung) infoParts.push(block.abteilung);
	if (block.auditor) infoParts.push(`Auditor: ${block.auditor}`);

	rows.push(
		new TableRow({
			children: [
				createTableCell(infoParts.join(' | '), {
					shading: COLORS.blockYellow,
					bold: true,
					fontSize: FONT_SIZES.body
				})
			]
		})
	);

	// Description row (gray)
	if (block.beschreibung) {
		rows.push(
			new TableRow({
				children: [
					createTableCell(block.beschreibung, {
						shading: COLORS.summaryGray,
						fontSize: FONT_SIZES.small
					})
				]
			})
		);
	}

	// White rows
	const whiteFields = [
		{ label: 'Vorstellung', value: block.vorstellung },
		{ label: 'Allgemein', value: block.allgemein },
		{ label: 'Notizen', value: block.notizen }
	];

	for (const field of whiteFields) {
		if (field.value) {
			rows.push(
				new TableRow({
					children: [
						createTableCell(`${field.label}: ${field.value}`, {
							fontSize: FONT_SIZES.small
						})
					]
				})
			);
		}
	}

	// Gray rows
	if (block.dokumente) {
		rows.push(
			new TableRow({
				children: [
					createTableCell(`Dokumente: ${block.dokumente}`, {
						shading: COLORS.summaryGray,
						fontSize: FONT_SIZES.small
					})
				]
			})
		);
	}

	if (block.zusammenfassung) {
		rows.push(
			new TableRow({
				children: [
					createTableCell(`Zusammenfassung: ${block.zusammenfassung}`, {
						shading: COLORS.summaryGray,
						bold: true,
						fontSize: FONT_SIZES.small
					})
				]
			})
		);
	}

	return new Table({
		rows,
		width: { size: 100, type: WidthType.PERCENTAGE },
		borders
	});
}

export async function generateAuditplanWord(data: AuditplanWordData): Promise<Blob> {
	const headerTable = createHeaderTable({
		title: 'Auditplan',
		logoBase64: data.logoBase64,
		fields: {
			firma: data.firma,
			standard: data.standard,
			zertifikat: data.zertifikat,
			auditart: data.auditart,
			datum: data.datum,
			standort: data.standort,
			auditor: data.auditor
		}
	});

	const children: (Paragraph | Table)[] = [];

	// Auftraggeber section
	if (data.auftraggeber?.name) {
		children.push(createParagraph(''));
		children.push(
			createParagraph(`Auftraggeber: ${data.auftraggeber.name}`, {
				bold: true,
				fontSize: FONT_SIZES.body
			})
		);
		if (data.auftraggeber.anschrift) {
			children.push(
				createParagraph(data.auftraggeber.anschrift, {
					fontSize: FONT_SIZES.small
				})
			);
		}
	}

	// Standorte section
	if (data.standorte && data.standorte.length > 0) {
		children.push(createParagraph(''));
		children.push(
			createParagraph('Standorte:', {
				bold: true,
				fontSize: FONT_SIZES.body
			})
		);
		for (const s of data.standorte) {
			children.push(createParagraph(`• ${s.name}${s.adresse ? ` — ${s.adresse}` : ''}`, { fontSize: FONT_SIZES.small }));
		}
	}

	// Blocks
	for (const block of data.blocks) {
		children.push(createParagraph(''));
		children.push(createBlockTable(block));
	}

	if (children.length === 0) {
		children.push(createParagraph('Keine Auditplan-Blöcke vorhanden.'));
	}

	const doc = new Document({
		sections: [
			{
				properties: {
					page: {
						margin: PAGE_MARGINS,
						borders: {
							pageBorderTop: PAGE_BORDER,
							pageBorderRight: PAGE_BORDER,
							pageBorderBottom: PAGE_BORDER,
							pageBorderLeft: PAGE_BORDER
						},
						pageNumbers: { start: 1 }
					}
				},
				headers: {
					default: new Header({ children: [headerTable] })
				},
				footers: {
					default: new Footer({
						children: [
							new Paragraph({
								children: [createTextRun('Seite '), new TextRun({ children: [PageNumber.CURRENT] })]
							})
						]
					})
				},
				children
			}
		]
	});

	return await Packer.toBlob(doc);
}
