import {
	Document,
	Paragraph,
	TextRun,
	Table,
	TableRow,
	TableCell,
	WidthType,
	AlignmentType,
	BorderStyle,
	ShadingType,
	PageNumber,
	NumberFormat,
	Header,
	type ITableCellOptions,
	type IParagraphOptions
} from 'docx';

// ============================================================
// Constants
// ============================================================

export const PAGE_MARGINS = {
	top: 2700,
	right: 360,
	bottom: 360,
	left: 360
};

export const BORDER_CONFIG = {
	style: BorderStyle.SINGLE,
	color: '000000',
	size: 24
};

export const HEADER_BG_COLOR = 'D3D3D3';

// ============================================================
// Text helpers
// ============================================================

export function boldText(text: string, size?: number): TextRun {
	return new TextRun({ text, bold: true, size: size ?? 20, font: 'Arial' });
}

export function normalText(text: string, size?: number): TextRun {
	return new TextRun({ text, size: size ?? 20, font: 'Arial' });
}

export function paragraph(children: TextRun[], options?: Partial<IParagraphOptions>): Paragraph {
	return new Paragraph({ children, ...options });
}

// ============================================================
// Table helpers
// ============================================================

export function headerCell(text: string, widthPercent: number, fontSize?: number): TableCell {
	return new TableCell({
		children: [paragraph([boldText(text, fontSize ?? 18)])],
		width: { size: widthPercent, type: WidthType.PERCENTAGE },
		shading: { type: ShadingType.SOLID, color: HEADER_BG_COLOR, fill: HEADER_BG_COLOR }
	});
}

export function dataCell(text: string, widthPercent: number, options?: Partial<ITableCellOptions>): TableCell {
	return new TableCell({
		children: [paragraph([normalText(text)])],
		width: { size: widthPercent, type: WidthType.PERCENTAGE },
		...options
	});
}

export function pageNumberCell(widthPercent: number): TableCell {
	return new TableCell({
		children: [
			new Paragraph({
				children: [
					normalText('Seite '),
					new TextRun({
						children: [PageNumber.CURRENT],
						size: 20,
						font: 'Arial'
					}),
					normalText(' / '),
					new TextRun({
						children: [PageNumber.TOTAL_PAGES],
						size: 20,
						font: 'Arial'
					})
				]
			})
		],
		width: { size: widthPercent, type: WidthType.PERCENTAGE }
	});
}

// ============================================================
// Document builder
// ============================================================

export interface WordDocumentConfig {
	title: string;
	firma: string;
	standard: string;
	zertifikat: string;
	auditart: string;
	datum: string;
	standort: string;
	auditor: string;
}

export function createHeaderTable(config: WordDocumentConfig): Table {
	return new Table({
		rows: [
			new TableRow({
				children: [
					new TableCell({
						children: [
							paragraph([boldText(config.title, 32)], {
								alignment: AlignmentType.LEFT
							})
						],
						width: { size: 100, type: WidthType.PERCENTAGE },
						columnSpan: 4
					})
				]
			}),
			new TableRow({
				children: [headerCell('Firma', 25), headerCell('Standard', 28), headerCell('Zertifikat', 20), headerCell('Auditart', 27)]
			}),
			new TableRow({
				children: [dataCell(config.firma, 25), dataCell(config.standard, 28), dataCell(config.zertifikat, 20), dataCell(config.auditart, 27)]
			}),
			new TableRow({
				children: [headerCell('Datum', 25), headerCell('Standort', 28), headerCell('Auditor', 20), headerCell('Seite', 27)]
			}),
			new TableRow({
				children: [dataCell(config.datum, 25), dataCell(config.standort, 28), dataCell(config.auditor, 20), pageNumberCell(27)]
			})
		],
		width: { size: 100, type: WidthType.PERCENTAGE }
	});
}

export function createWordDocument(sections: Paragraph[]): Document {
	return new Document({
		sections: [
			{
				properties: {
					page: {
						margin: PAGE_MARGINS,
						pageNumbers: { start: 1 }
					}
				},
				children: sections
			}
		]
	});
}

export function createWordDocumentWithHeader(config: WordDocumentConfig, children: (Paragraph | Table)[]): Document {
	return new Document({
		sections: [
			{
				properties: {
					page: {
						margin: PAGE_MARGINS,
						pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL }
					}
				},
				headers: {
					default: new Header({
						children: [
							new Paragraph({
								children: [boldText(config.title, 16)],
								alignment: AlignmentType.RIGHT
							})
						]
					})
				},
				children: [createHeaderTable(config), paragraph([normalText('')]), ...children]
			}
		]
	});
}
