import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, ShadingType, Header, BorderStyle } from 'docx';
import { createHeaderTable, TABLE_BORDERS, COLORS, DEFAULT_PAGE_MARGINS, downloadBlob, type WordHeaderData } from './common';
import type { NotizenDaten } from '$lib/types/notes';

// BorderStyle is used transitively via TABLE_BORDERS — keep import to satisfy bundler tree-shaking
void BorderStyle;

export async function generateNotesWordDocument(data: NotizenDaten): Promise<void> {
	const headerData: WordHeaderData = {
		title: 'Audit Notes / Auditnotizen',
		firma: data.header.firmaAuftraggeber,
		standard: data.header.standards,
		zertifikat: data.header.zertifikat,
		auditart: data.header.auditart,
		datum: `${data.header.datumVon} - ${data.header.datumBis}`,
		standort: data.header.standorte,
		auditor: data.header.auditor,
		logo: data.logoBase64 ?? undefined
	};

	const blockTables = data.notizenBloecke.map((block) => {
		const infoParts: string[] = [];
		if (block.toggles.datum) infoParts.push(block.datum);
		if (block.toggles.uhrzeit) infoParts.push(`${block.uhrzeitVon} - ${block.uhrzeitBis}`);
		if (block.toggles.remote && block.istRemote) infoParts.push('Remote');
		infoParts.push(block.organisationseinheit);
		infoParts.push(block.auditor);

		const rows: TableRow[] = [];

		rows.push(
			new TableRow({
				children: [
					new TableCell({
						children: [
							new Paragraph({
								children: [new TextRun({ text: infoParts.join(' | '), bold: true, size: 20 })]
							})
						],
						shading: { type: ShadingType.CLEAR, fill: COLORS.yellow },
						width: { size: 100, type: WidthType.PERCENTAGE }
					})
				]
			})
		);

		if (block.beschreibung) {
			rows.push(
				new TableRow({
					children: [
						new TableCell({
							children: [
								new Paragraph({
									children: [new TextRun({ text: block.beschreibung, size: 18 })]
								})
							],
							shading: { type: ShadingType.CLEAR, fill: COLORS.gray },
							width: { size: 100, type: WidthType.PERCENTAGE }
						})
					]
				})
			);
		}

		if (block.vorstellung) {
			rows.push(
				new TableRow({
					children: [
						new TableCell({
							children: [
								new Paragraph({
									children: [new TextRun({ text: block.vorstellung, size: 18 })]
								})
							],
							width: { size: 100, type: WidthType.PERCENTAGE }
						})
					]
				})
			);
		}

		if (block.allgemein) {
			rows.push(
				new TableRow({
					children: [
						new TableCell({
							children: [
								new Paragraph({
									children: [new TextRun({ text: block.allgemein, size: 18 })]
								})
							],
							width: { size: 100, type: WidthType.PERCENTAGE }
						})
					]
				})
			);
		}

		if (block.toggles.notizenAnzeigen && block.notizen) {
			rows.push(
				new TableRow({
					children: [
						new TableCell({
							children: [
								new Paragraph({
									children: [new TextRun({ text: block.notizen, size: 18 })]
								})
							],
							width: { size: 100, type: WidthType.PERCENTAGE }
						})
					]
				})
			);
		}

		if (block.toggles.dokumenteAnzeigen && block.dokumente) {
			rows.push(
				new TableRow({
					children: [
						new TableCell({
							children: [
								new Paragraph({
									children: [new TextRun({ text: block.dokumente, size: 18 })]
								})
							],
							shading: { type: ShadingType.CLEAR, fill: COLORS.gray },
							width: { size: 100, type: WidthType.PERCENTAGE }
						})
					]
				})
			);
		}

		if (block.toggles.dokumenteAnzeigen) {
			for (const doc of block.qhseDokumente) {
				const t = `${doc.name}${doc.datum ? ` (${doc.datum})` : ''}${doc.notizen ? ` - ${doc.notizen}` : ''}`;
				rows.push(
					new TableRow({
						children: [
							new TableCell({
								children: [
									new Paragraph({
										children: [new TextRun({ text: t, size: 18 })]
									})
								],
								width: { size: 100, type: WidthType.PERCENTAGE }
							})
						]
					})
				);
			}
		}

		if (block.toggles.bewertungAnzeigen) {
			for (const bew of block.bewertungen) {
				const kap = bew.kapitel.length > 0 ? ` (${bew.kapitel.join(', ')})` : '';
				rows.push(
					new TableRow({
						children: [
							new TableCell({
								children: [
									new Paragraph({
										children: [new TextRun({ text: `[${bew.typ}]`, bold: true, size: 18, highlight: 'yellow' }), new TextRun({ text: `${kap}: ${bew.beschreibung}`, size: 18 })]
									})
								],
								width: { size: 100, type: WidthType.PERCENTAGE }
							})
						]
					})
				);
			}
		}

		if (block.zusammenfassung) {
			rows.push(
				new TableRow({
					children: [
						new TableCell({
							children: [
								new Paragraph({
									children: [
										new TextRun({
											text: `Zusammenfassung ${block.organisationseinheit}: `,
											bold: true,
											size: 18
										}),
										new TextRun({ text: block.zusammenfassung, size: 18 })
									]
								})
							],
							shading: { type: ShadingType.CLEAR, fill: COLORS.gray },
							width: { size: 100, type: WidthType.PERCENTAGE }
						})
					]
				})
			);
		}

		return new Table({ rows, width: { size: 100, type: WidthType.PERCENTAGE }, borders: TABLE_BORDERS });
	});

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const children: any[] = [];
	for (const table of blockTables) {
		children.push(new Paragraph({ spacing: { before: 200 } }));
		children.push(table);
	}

	const doc = new Document({
		sections: [
			{
				properties: {
					page: { margin: DEFAULT_PAGE_MARGINS }
				},
				headers: {
					default: new Header({ children: [createHeaderTable(headerData)] })
				},
				children
			}
		]
	});

	const blob = await Packer.toBlob(doc);
	downloadBlob(blob, `Auditnotizen_${Date.now()}.docx`);
}
