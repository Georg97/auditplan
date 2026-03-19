export interface SavedAuditQuestions {
	id: string;
	organizationId: string;
	firmenname?: string;
	auditdatum?: string;
	uhrzeitVon?: string;
	uhrzeitBis?: string;
	abteilung?: string;
	norm?: string;
	normkapitel?: string;
	createdAt: Date;
	updatedAt: Date;
	entries: SavedQuestionEntry[];
	documents: SavedQuestionDocument[];
}

export interface SavedQuestionEntry {
	id: string;
	savedAuditQuestionsId: string;
	frage?: string;
	normRef?: string;
	position: number;
}

export interface SavedQuestionDocument {
	id: string;
	savedAuditQuestionsId: string;
	name?: string;
	beschreibung?: string;
	position: number;
}
