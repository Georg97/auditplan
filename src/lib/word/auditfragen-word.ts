import { downloadBlob } from './common';

export function generateAuditQuestionsWord(data: {
	abteilung: string;
	datum: string;
	questions: { frage: string; normRef: string }[];
	documents: { name: string; beschreibung?: string }[];
}): void {
	const html = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
        <head><meta charset="utf-8"><style>body { font-family: Calibri, sans-serif; font-size: 11pt; } h1 { font-size: 16pt; } h2 { font-size: 14pt; } table { border-collapse: collapse; width: 100%; } td, th { border: 1px solid #000; padding: 4px 8px; } ol { margin-top: 0; }</style></head>
        <body>
            <h1>Auditfragen</h1>
            <p><strong>Abteilung:</strong> ${data.abteilung}</p>
            <p><strong>Datum:</strong> ${data.datum}</p>
            <h2>Fragen</h2>
            <ol>${data.questions.map((q) => `<li><strong>[${q.normRef}]</strong> ${q.frage}</li>`).join('')}</ol>
            ${data.documents.length > 0 ? `<h2>Dokumente</h2><ul>${data.documents.map((d) => `<li>${d.name}${d.beschreibung ? ` — ${d.beschreibung}` : ''}</li>`).join('')}</ul>` : ''}
        </body></html>`;

	const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
	const filename = `Auditfragen_${data.abteilung.replace(/\s+/g, '_')}_${data.datum || 'undatiert'}.doc`;
	downloadBlob(blob, filename);
}
