/**
 * Shared Word document generation helpers.
 * Used by auditplan, audit notes, and audit questions export endpoints.
 */
import { Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle, ImageRun, type ITableCellOptions, type IParagraphOptions } from 'docx';

// --- Page configuration ---

export const PAGE_MARGINS = {
	top: 2700,
	right: 360,
	bottom: 360,
	left: 360
};

export const PAGE_BORDER = {
	style: BorderStyle.SINGLE,
	color: '000000',
	size: 24
};

// --- Color constants ---

export const COLORS = {
	headerGray: 'D3D3D3',
	blockYellow: 'FFFF00',
	summaryGray: 'D3D3D3',
	white: 'FFFFFF',
	black: '000000'
};

// --- Font sizes (half-points for docx) ---

export const FONT_SIZES = {
	title: 32,
	header: 18,
	body: 20,
	small: 16
};

// --- Helper functions ---

export function createTextRun(text: string, options?: { bold?: boolean; size?: number; color?: string }): TextRun {
	return new TextRun({
		text,
		bold: options?.bold ?? false,
		size: options?.size ?? FONT_SIZES.body,
		color: options?.color ?? COLORS.black,
		font: 'Arial'
	});
}

export function createParagraph(text: string, options?: IParagraphOptions & { bold?: boolean; fontSize?: number }): Paragraph {
	const { bold, fontSize, ...paragraphOptions } = options ?? {};
	return new Paragraph({
		...paragraphOptions,
		children: [createTextRun(text, { bold, size: fontSize })]
	});
}

export function createTableCell(
	content: string | Paragraph[],
	options?: {
		width?: number;
		widthType?: (typeof WidthType)[keyof typeof WidthType];
		shading?: string;
		bold?: boolean;
		fontSize?: number;
		columnSpan?: number;
		verticalAlign?: ITableCellOptions['verticalAlign'];
	}
): TableCell {
	const paragraphs = typeof content === 'string' ? [createParagraph(content, { bold: options?.bold, fontSize: options?.fontSize })] : content;

	return new TableCell({
		children: paragraphs,
		width: options?.width ? { size: options.width, type: options?.widthType ?? WidthType.PERCENTAGE } : undefined,
		shading: options?.shading ? { fill: options.shading } : undefined,
		columnSpan: options?.columnSpan,
		verticalAlign: options?.verticalAlign
	});
}

export function createHeaderTable(config: {
	title: string;
	logoBase64?: string;
	fields: {
		firma?: string;
		standard?: string;
		zertifikat?: string;
		auditart?: string;
		datum?: string;
		standort?: string;
		auditor?: string;
		seite?: string;
	};
}): Table {
	const titleRow = new TableRow({
		children: [
			createTableCell(config.title, {
				width: 70,
				bold: true,
				fontSize: FONT_SIZES.title
			}),
			config.logoBase64
				? new TableCell({
						children: [
							new Paragraph({
								alignment: AlignmentType.RIGHT,
								children: [
									new ImageRun({
										data: Buffer.from(config.logoBase64, 'base64'),
										transformation: { width: 200, height: 60 },
										type: 'png'
									})
								]
							})
						],
						width: { size: 30, type: WidthType.PERCENTAGE }
					})
				: createTableCell('', { width: 30 })
		]
	});

	const dataRow1 = new TableRow({
		children: [
			createTableCell(`Firma: ${config.fields.firma ?? ''}`, {
				width: 25,
				shading: COLORS.headerGray,
				fontSize: FONT_SIZES.header
			}),
			createTableCell(`Standard: ${config.fields.standard ?? ''}`, {
				width: 28,
				shading: COLORS.headerGray,
				fontSize: FONT_SIZES.header
			}),
			createTableCell(`Zertifikat: ${config.fields.zertifikat ?? ''}`, {
				width: 20,
				shading: COLORS.headerGray,
				fontSize: FONT_SIZES.header
			}),
			createTableCell(`Auditart: ${config.fields.auditart ?? ''}`, {
				width: 27,
				shading: COLORS.headerGray,
				fontSize: FONT_SIZES.header
			})
		]
	});

	const dataRow2 = new TableRow({
		children: [
			createTableCell(`Datum: ${config.fields.datum ?? ''}`, {
				width: 25,
				fontSize: FONT_SIZES.header
			}),
			createTableCell(`Standort: ${config.fields.standort ?? ''}`, {
				width: 28,
				fontSize: FONT_SIZES.header
			}),
			createTableCell(`Auditor: ${config.fields.auditor ?? ''}`, {
				width: 20,
				fontSize: FONT_SIZES.header
			}),
			createTableCell(`Seite: ${config.fields.seite ?? ''}`, {
				width: 27,
				fontSize: FONT_SIZES.header
			})
		]
	});

	return new Table({
		rows: [titleRow, dataRow1, dataRow2],
		width: { size: 100, type: WidthType.PERCENTAGE }
	});
}

export function createSectionBorder() {
	return {
		top: { style: BorderStyle.SINGLE, size: 1, color: COLORS.black },
		bottom: { style: BorderStyle.SINGLE, size: 1, color: COLORS.black },
		left: { style: BorderStyle.SINGLE, size: 1, color: COLORS.black },
		right: { style: BorderStyle.SINGLE, size: 1, color: COLORS.black }
	};
}
