export interface NavItem {
	id: string;
	labelKey: string;
	icon: string;
	href: string;
}

export const NAV_ITEMS: NavItem[] = [
	{ id: 'overview', labelKey: 'nav.overview', icon: '📋', href: '/overview' },
	{ id: 'dashboard', labelKey: 'nav.dashboard', icon: '📊', href: '/dashboard' },
	{ id: 'auditor-management', labelKey: 'nav.auditorManagement', icon: '👥', href: '/auditor-management' },
	{ id: 'add-auditor', labelKey: 'nav.addAuditor', icon: '➕', href: '/add-auditor' },
	{ id: 'search-manage', labelKey: 'nav.searchManage', icon: '🔍', href: '/search-manage' },
	{ id: 'calendar', labelKey: 'nav.calendar', icon: '📅', href: '/calendar' },
	{ id: 'import-export', labelKey: 'nav.importExport', icon: '📁', href: '/import-export' },
	{ id: 'plan-generator', labelKey: 'nav.planGenerator', icon: '📝', href: '/plan-generator' },
	{ id: 'report-generator', labelKey: 'nav.reportGenerator', icon: '📄', href: '/report-generator' },
	{ id: 'notes-generator', labelKey: 'nav.notesGenerator', icon: '🗒️', href: '/notes-generator' },
	{ id: 'audit-questions', labelKey: 'nav.auditQuestions', icon: '❓', href: '/audit-questions' },
	{ id: 'action-plan', labelKey: 'nav.actionPlan', icon: '⚡', href: '/action-plan' }
];
