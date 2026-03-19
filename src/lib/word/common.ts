import {
	Table,
	TableRow,
	TableCell,
	Paragraph,
	TextRun,
	WidthType,
	AlignmentType,
	ShadingType,
	BorderStyle,
	PageNumber,
	ImageRun,
	type ITableCellOptions,
	type IBorderOptions
} from 'docx';

export interface WordHeaderData {
	title: string;
	firma: string;
	standard: string;
	zertifikat: string;
	auditart: string;
	datum: string;
	standort: string;
	auditor: string;
	logo?: string;
}

export interface WordPageMargins {
	top: number;
	right: number;
	bottom: number;
	left: number;
}

export const DEFAULT_PAGE_MARGINS: WordPageMargins = {
	top: 2700,
	right: 360,
	bottom: 360,
	left: 360
};

export const COLORS = {
	yellow: 'FFFF00',
	gray: 'D3D3D3',
	white: 'FFFFFF',
	black: '000000'
} as const;

const thinBorder: IBorderOptions = {
	style: BorderStyle.SINGLE,
	size: 1,
	color: COLORS.black
};

export const TABLE_BORDERS = {
	top: thinBorder,
	bottom: thinBorder,
	left: thinBorder,
	right: thinBorder,
	insideHorizontal: thinBorder,
	insideVertical: { style: BorderStyle.NONE, size: 0, color: COLORS.black }
};

export function createShadedCell(text: string, color: string, options?: Partial<ITableCellOptions>): TableCell {
	return new TableCell({
		children: [
			new Paragraph({
				children: [new TextRun({ text, size: 20 })]
			})
		],
		shading: { type: ShadingType.CLEAR, fill: color },
		...options
	});
}

export function createBoldText(text: string, size: number = 20): TextRun {
	return new TextRun({ text, bold: true, size });
}

export function createLabelValueParagraph(label: string, value: string): Paragraph {
	return new Paragraph({
		children: [createBoldText(`${label}: `, 18), new TextRun({ text: value, size: 18 })]
	});
}

export function createHeaderTable(data: WordHeaderData): Table {
	const titleCells: TableCell[] = [
		new TableCell({
			children: [
				new Paragraph({
					children: [createBoldText(data.title, 32)],
					alignment: AlignmentType.LEFT
				})
			],
			width: { size: 70, type: WidthType.PERCENTAGE }
		})
	];

	if (data.logo) {
		titleCells.push(
			new TableCell({
				children: [
					new Paragraph({
						children: [
							new ImageRun({
								data: Buffer.from(data.logo.split(',').pop() ?? '', 'base64'),
								transformation: { width: 200, height: 60 },
								type: 'png'
							})
						],
						alignment: AlignmentType.RIGHT
					})
				],
				width: { size: 30, type: WidthType.PERCENTAGE }
			})
		);
	} else {
		titleCells.push(
			new TableCell({
				children: [new Paragraph({})],
				width: { size: 30, type: WidthType.PERCENTAGE }
			})
		);
	}

	const dataRow1Widths = [25, 28, 20, 27];
	const dataRow1Fields = [
		{ label: 'Firma', value: data.firma },
		{ label: 'Standard', value: data.standard },
		{ label: 'Zertifikat', value: data.zertifikat },
		{ label: 'Auditart', value: data.auditart }
	];

	const dataRow2Fields = [
		{ label: 'Datum', value: data.datum },
		{ label: 'Standort', value: data.standort },
		{ label: 'Auditor', value: data.auditor }
	];

	return new Table({
		rows: [
			new TableRow({ children: titleCells }),
			new TableRow({
				children: dataRow1Fields.map(
					(field, i) =>
						new TableCell({
							children: [createLabelValueParagraph(field.label, field.value)],
							width: { size: dataRow1Widths[i], type: WidthType.PERCENTAGE },
							shading: { type: ShadingType.CLEAR, fill: COLORS.gray }
						})
				)
			}),
			new TableRow({
				children: [
					...dataRow2Fields.map(
						(field, i) =>
							new TableCell({
								children: [createLabelValueParagraph(field.label, field.value)],
								width: { size: dataRow1Widths[i], type: WidthType.PERCENTAGE }
							})
					),
					new TableCell({
						children: [
							new Paragraph({
								children: [
									createBoldText('Seite: ', 18),
									new TextRun({
										children: [PageNumber.CURRENT],
										size: 18
									})
								]
							})
						],
						width: { size: dataRow1Widths[3], type: WidthType.PERCENTAGE }
					})
				]
			})
		],
		width: { size: 100, type: WidthType.PERCENTAGE }
	});
}

export function downloadBlob(blob: Blob, filename: string): void {
	import('file-saver').then(({ saveAs }) => {
		saveAs(blob, filename);
	});
}
