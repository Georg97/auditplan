export interface SavedAuditQuestions {
	id: string;
	organizationId: string;
	name: string;
	formData: string;
	questions: string;
	documents: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface AuditQuestion {
	id: string;
	nummer: number;
	frage: string;
	normkapitel: string;
	kategorie: string;
}

export interface AuditDocument {
	id: string;
	name: string;
	normkapitel: string;
	beschreibung: string;
}

export interface AuditQuestionsForm {
	auditName: string;
	auditDatum: string;
	auditor: string;
	abteilung: string;
	norm: string;
	kapitel: string[];
}
