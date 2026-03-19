import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, ShadingType, Header, TabStopPosition, TabStopType } from 'docx';
import { createHeaderTable, createBoldText, TABLE_BORDERS, COLORS, DEFAULT_PAGE_MARGINS, downloadBlob, type WordHeaderData } from './common';

// TabStopPosition and TabStopType are available for callers extending this module
void TabStopPosition;
void TabStopType;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function generatePlanWordDocument(planData: any, logo?: string): Promise<void> {
	const headerData: WordHeaderData = {
		title: 'Auditplan',
		firma: planData.auftraggeber?.split('\n')[0] || '',
		standard: (planData.normgrundlage || []).join(', '),
		zertifikat: '',
		auditart: planData.auditart || '',
		datum: '',
		standort: (planData.standorte || []).join(', '),
		auditor: '',
		logo
	};

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const children: any[] = [];

	// Auftraggeber section
	if (planData.auftraggeber) {
		children.push(
			new Paragraph({
				children: [createBoldText('Auftraggeber:', 22)],
				spacing: { before: 200, after: 100 }
			})
		);
		children.push(
			new Paragraph({
				children: [new TextRun({ text: planData.auftraggeber, size: 20 })],
				spacing: { after: 100 }
			})
		);
	}

	// Geltungsbereich
	if (planData.geltungsbereich) {
		children.push(
			new Paragraph({
				children: [createBoldText('Geltungsbereich:', 22)],
				spacing: { before: 200, after: 100 }
			})
		);
		children.push(
			new Paragraph({
				children: [new TextRun({ text: planData.geltungsbereich, size: 20 })],
				spacing: { after: 100 }
			})
		);
	}

	// Standorte
	if (planData.standorte?.length > 0) {
		children.push(
			new Paragraph({
				children: [createBoldText('Standorte:', 22)],
				spacing: { before: 200, after: 100 }
			})
		);
		for (const s of planData.standorte) {
			if (s) children.push(new Paragraph({ children: [new TextRun({ text: `• ${s}`, size: 20 })] }));
		}
	}

	// Audit-Blöcke
	if (planData.bloecke?.length > 0) {
		children.push(
			new Paragraph({
				children: [createBoldText('Audit-Blöcke:', 22)],
				spacing: { before: 300, after: 100 }
			})
		);

		for (const block of planData.bloecke) {
			const rows: TableRow[] = [];

			for (const row of block.rows || []) {
				const parts: string[] = [];
				if (row.datum) parts.push(row.datum);
				if (row.zeitVon || row.zeitBis) parts.push(`${row.zeitVon || ''} - ${row.zeitBis || ''}`);
				if (row.remote) parts.push('Remote');
				if (row.organisationseinheit) parts.push(row.organisationseinheit);
				if (row.auditor) parts.push(row.auditor);
				if (row.gespraechspartner) parts.push(row.gespraechspartner);

				rows.push(
					new TableRow({
						children: [
							new TableCell({
								children: [
									new Paragraph({
										children: [new TextRun({ text: parts.join(' | '), bold: true, size: 20 })]
									})
								],
								shading: { type: ShadingType.CLEAR, fill: COLORS.yellow },
								width: { size: 100, type: WidthType.PERCENTAGE }
							})
						]
					})
				);
			}

			if (block.notes) {
				if (block.notes.abteilungsbeschreibung) {
					rows.push(
						new TableRow({
							children: [
								new TableCell({
									children: [
										new Paragraph({
											children: [new TextRun({ text: block.notes.abteilungsbeschreibung, size: 18 })]
										})
									],
									shading: { type: ShadingType.CLEAR, fill: COLORS.gray },
									width: { size: 100, type: WidthType.PERCENTAGE }
								})
							]
						})
					);
				}

				if (block.notes.zusammenfassung) {
					rows.push(
						new TableRow({
							children: [
								new TableCell({
									children: [
										new Paragraph({
											children: [createBoldText('Zusammenfassung: ', 18), new TextRun({ text: block.notes.zusammenfassung, size: 18 })]
										})
									],
									shading: { type: ShadingType.CLEAR, fill: COLORS.gray },
									width: { size: 100, type: WidthType.PERCENTAGE }
								})
							]
						})
					);
				}

				if (block.notes.themen) {
					rows.push(
						new TableRow({
							children: [
								new TableCell({
									children: [
										new Paragraph({
											children: [createBoldText('Themen: ', 18), new TextRun({ text: block.notes.themen, size: 18 })]
										})
									],
									width: { size: 100, type: WidthType.PERCENTAGE }
								})
							]
						})
					);
				}
			}

			if (rows.length > 0) {
				children.push(new Paragraph({ spacing: { before: 200 } }));
				children.push(new Table({ rows, width: { size: 100, type: WidthType.PERCENTAGE }, borders: TABLE_BORDERS }));
			}
		}
	}

	const doc = new Document({
		sections: [
			{
				properties: { page: { margin: DEFAULT_PAGE_MARGINS } },
				headers: { default: new Header({ children: [createHeaderTable(headerData)] }) },
				children
			}
		]
	});

	const blob = await Packer.toBlob(doc);
	downloadBlob(blob, `Auditplan_${Date.now()}.docx`);
}
