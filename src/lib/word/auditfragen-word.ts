/**
 * Audit Questions Word Export (§20)
 * Uses HTML-Blob approach for .doc format (NOT docx).
 */

export interface AuditfragenWordData {
	abteilung: string;
	datum: string;
	questions: { nummer: number; frage: string; normRef: string }[];
	documents: { name: string; beschreibung?: string }[];
}

/**
 * Generate a .doc file using the HTML-Blob approach.
 * Returns a Blob with MIME type application/msword.
 */
export function generateAuditfragenWord(data: AuditfragenWordData): Blob {
	const questionsHtml = data.questions
		.map(
			(q) =>
				`<tr>
					<td style="padding:4px;border:1px solid #ccc;text-align:center;width:40px">${q.nummer}</td>
					<td style="padding:4px;border:1px solid #ccc">${escapeHtml(q.frage)}</td>
					<td style="padding:4px;border:1px solid #ccc;width:80px">${escapeHtml(q.normRef)}</td>
				</tr>`
		)
		.join('\n');

	const documentsHtml = data.documents.map((d) => `<li>${escapeHtml(d.name)}${d.beschreibung ? ` — ${escapeHtml(d.beschreibung)}` : ''}</li>`).join('\n');

	const html = `
		<html xmlns:o="urn:schemas-microsoft-com:office:office"
			  xmlns:w="urn:schemas-microsoft-com:office:word"
			  xmlns="http://www.w3.org/TR/REC-html40">
		<head>
			<meta charset="utf-8">
			<style>
				body { font-family: Arial, sans-serif; font-size: 11pt; }
				h1 { font-size: 16pt; color: #333; }
				h2 { font-size: 13pt; color: #333; margin-top: 20px; }
				table { border-collapse: collapse; width: 100%; margin-top: 10px; }
				th { background-color: #D3D3D3; padding: 6px; border: 1px solid #999; text-align: left; }
			</style>
		</head>
		<body>
			<h1>Auditfragen — ${escapeHtml(data.abteilung)}</h1>
			<p><strong>Datum:</strong> ${escapeHtml(data.datum)}</p>

			<h2>Auditfragen</h2>
			<table>
				<thead>
					<tr>
						<th style="width:40px">Nr.</th>
						<th>Frage</th>
						<th style="width:80px">Norm</th>
					</tr>
				</thead>
				<tbody>
					${questionsHtml}
				</tbody>
			</table>

			${
				data.documents.length > 0
					? `<h2>Zugehörige Dokumente</h2>
					   <ul>${documentsHtml}</ul>`
					: ''
			}
		</body>
		</html>
	`;

	return new Blob([html], { type: 'application/msword' });
}

/**
 * Generate the filename for the audit questions export.
 */
export function auditfragenFilename(abteilung: string, datum: string): string {
	const safe = abteilung.replace(/[^a-zA-Z0-9äöüÄÖÜß]/g, '_');
	return `Auditfragen_${safe}_${datum}.doc`;
}

function escapeHtml(text: string): string {
	return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
