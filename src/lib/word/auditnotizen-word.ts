/**
 * Audit Notes Word Export (§18 + §19)
 * Generates a .docx document from audit notes data.
 */
import { Document, Packer, Paragraph, Table, TableRow, TextRun, Header, Footer, PageNumber, WidthType, BorderStyle } from 'docx';
import { PAGE_MARGINS, PAGE_BORDER, COLORS, FONT_SIZES, createTextRun, createParagraph, createTableCell, createHeaderTable } from './helpers';

export interface AuditNoteBlockData {
	uhrzeit?: string;
	abteilung?: string;
	auditor?: string;
	beschreibung?: string;
	vorstellung?: string;
	allgemein?: string;
	notizen?: string;
	dokumente?: string;
	qhseDocs?: { name: string; datum?: string; notizen?: string }[];
	bewertungen?: { typ: string; kapitel?: string; beschreibung?: string }[];
	zusammenfassung?: string;
}

export interface AuditNotizenWordData {
	firma?: string;
	standard?: string;
	zertifikat?: string;
	auditart?: string;
	datum?: string;
	standort?: string;
	auditor?: string;
	logoBase64?: string;
	blocks: AuditNoteBlockData[];
}

/** Table borders: outer + horizontal, NO inner vertical */
function noteTableBorders() {
	return {
		top: { style: BorderStyle.SINGLE, size: 1, color: COLORS.black },
		bottom: { style: BorderStyle.SINGLE, size: 1, color: COLORS.black },
		left: { style: BorderStyle.SINGLE, size: 1, color: COLORS.black },
		right: { style: BorderStyle.SINGLE, size: 1, color: COLORS.black },
		insideHorizontal: {
			style: BorderStyle.SINGLE,
			size: 1,
			color: COLORS.black
		},
		insideVertical: { style: BorderStyle.NONE, size: 0, color: COLORS.white }
	};
}

function createNoteBlockTable(block: AuditNoteBlockData): Table {
	const rows: TableRow[] = [];

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

	// Description (gray)
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
	if (block.vorstellung) {
		rows.push(
			new TableRow({
				children: [
					createTableCell(`Vorstellung: ${block.vorstellung}`, {
						fontSize: FONT_SIZES.small
					})
				]
			})
		);
	}

	if (block.allgemein) {
		rows.push(
			new TableRow({
				children: [
					createTableCell(`Allgemein: ${block.allgemein}`, {
						fontSize: FONT_SIZES.small
					})
				]
			})
		);
	}

	// Conditional sections
	if (block.notizen) {
		rows.push(
			new TableRow({
				children: [
					createTableCell(`Notizen: ${block.notizen}`, {
						fontSize: FONT_SIZES.small
					})
				]
			})
		);
	}

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

	// QHSE Documents — each as its own row
	if (block.qhseDocs && block.qhseDocs.length > 0) {
		for (const doc of block.qhseDocs) {
			const parts = [doc.name];
			if (doc.datum) parts.push(`(${doc.datum})`);
			if (doc.notizen) parts.push(`- ${doc.notizen}`);
			rows.push(
				new TableRow({
					children: [
						createTableCell(parts.join(' '), {
							fontSize: FONT_SIZES.small
						})
					]
				})
			);
		}
	}

	// Bewertungen
	if (block.bewertungen && block.bewertungen.length > 0) {
		for (const bew of block.bewertungen) {
			const paragraphs = [createParagraph(`${bew.typ}${bew.kapitel ? ` (${bew.kapitel})` : ''}`, { bold: true, fontSize: FONT_SIZES.small })];
			if (bew.beschreibung) {
				paragraphs.push(
					createParagraph(bew.beschreibung, {
						fontSize: FONT_SIZES.small
					})
				);
			}
			rows.push(
				new TableRow({
					children: [
						createTableCell(paragraphs, {
							shading: COLORS.blockYellow
						})
					]
				})
			);
		}
	}

	// Zusammenfassung (gray, bold)
	if (block.zusammenfassung) {
		const title = block.abteilung ? `Zusammenfassung ${block.abteilung}:` : 'Zusammenfassung:';
		rows.push(
			new TableRow({
				children: [
					createTableCell(
						[
							createParagraph(title, {
								bold: true,
								fontSize: FONT_SIZES.small
							}),
							createParagraph(block.zusammenfassung, {
								fontSize: FONT_SIZES.small
							})
						],
						{ shading: COLORS.summaryGray }
					)
				]
			})
		);
	}

	return new Table({
		rows,
		width: { size: 100, type: WidthType.PERCENTAGE },
		borders: noteTableBorders()
	});
}

export async function generateAuditNotizenWord(data: AuditNotizenWordData): Promise<Blob> {
	const headerTable = createHeaderTable({
		title: 'Audit Notes / Auditnotizen',
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

	for (const block of data.blocks) {
		children.push(createParagraph(''));
		children.push(createNoteBlockTable(block));
	}

	if (children.length === 0) {
		children.push(createParagraph('Keine Notizen-Blöcke vorhanden.'));
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
