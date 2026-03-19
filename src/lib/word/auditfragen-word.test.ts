import { describe, it, expect } from 'vitest';
import { generateAuditfragenWord, auditfragenFilename } from './auditfragen-word';

describe('generateAuditfragenWord', () => {
	it('generates a Blob with msword MIME type', () => {
		const blob = generateAuditfragenWord({
			abteilung: 'Management',
			datum: '2026-03-19',
			questions: [{ nummer: 1, frage: 'Wie wird der Kontext ermittelt?', normRef: '4.1' }],
			documents: [{ name: 'Managementbewertung', beschreibung: 'Letzte Bewertung' }]
		});
		expect(blob).toBeInstanceOf(Blob);
		expect(blob.type).toBe('application/msword');
	});

	it('includes questions and documents in HTML content', async () => {
		const blob = generateAuditfragenWord({
			abteilung: 'IT',
			datum: '2026-01-15',
			questions: [
				{ nummer: 1, frage: 'Wie ist das ISMS aufgebaut?', normRef: '4.4' },
				{ nummer: 2, frage: 'Risikomanagement?', normRef: '6.1.2' }
			],
			documents: [{ name: 'ISMS-Handbuch' }]
		});
		const text = await blob.text();
		expect(text).toContain('IT');
		expect(text).toContain('2026-01-15');
		expect(text).toContain('ISMS aufgebaut');
		expect(text).toContain('4.4');
		expect(text).toContain('Risikomanagement');
		expect(text).toContain('ISMS-Handbuch');
	});

	it('escapes HTML in content', async () => {
		const blob = generateAuditfragenWord({
			abteilung: 'Test<script>',
			datum: '2026-01-01',
			questions: [{ nummer: 1, frage: 'Q & A <test>', normRef: '1.0' }],
			documents: []
		});
		const text = await blob.text();
		expect(text).toContain('Test&lt;script&gt;');
		expect(text).toContain('Q &amp; A &lt;test&gt;');
		expect(text).not.toContain('<script>');
	});

	it('handles empty questions and documents', () => {
		const blob = generateAuditfragenWord({
			abteilung: 'Empty',
			datum: '2026-01-01',
			questions: [],
			documents: []
		});
		expect(blob).toBeInstanceOf(Blob);
	});
});

describe('auditfragenFilename', () => {
	it('generates correct filename', () => {
		expect(auditfragenFilename('Management', '2026-03-19')).toBe('Auditfragen_Management_2026-03-19.doc');
	});

	it('sanitizes special characters', () => {
		expect(auditfragenFilename('IT & Sicherheit', '2026-01-01')).toBe('Auditfragen_IT___Sicherheit_2026-01-01.doc');
	});

	it('preserves German umlauts', () => {
		const name = auditfragenFilename('Qualität', '2026-01-01');
		expect(name).toContain('Qualität');
	});
});
