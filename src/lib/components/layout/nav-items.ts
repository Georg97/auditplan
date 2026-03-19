export interface NavItem {
	id: string;
	labelKey: string;
	icon: string;
	href: string;
}

export const NAV_ITEMS: NavItem[] = [
	{ id: 'overview', labelKey: 'nav.uebersicht', icon: '📋', href: '/overview' },
	{ id: 'dashboard', labelKey: 'nav.dashboard', icon: '📊', href: '/dashboard' },
	{ id: 'auditor-management', labelKey: 'nav.auditoren', icon: '👥', href: '/auditor-management' },
	{ id: 'add-auditor', labelKey: 'nav.auditor_neu', icon: '➕', href: '/add-auditor' },
	{ id: 'search-manage', labelKey: 'nav.suchen', icon: '🔍', href: '/search-manage' },
	{ id: 'calendar', labelKey: 'nav.kalender', icon: '📅', href: '/calendar' },
	{ id: 'import-export', labelKey: 'nav.import_export', icon: '📁', href: '/import-export' },
	{ id: 'plan-generator', labelKey: 'nav.auditplan', icon: '📝', href: '/plan-generator' },
	{ id: 'report-generator', labelKey: 'nav.auditbericht', icon: '📄', href: '/report-generator' },
	{ id: 'notes-generator', labelKey: 'nav.auditnotizen', icon: '🗒️', href: '/notes-generator' },
	{ id: 'audit-questions', labelKey: 'nav.fragen_dokumente', icon: '❓', href: '/audit-questions' },
	{ id: 'action-plan', labelKey: 'nav.massnahmenplan', icon: '⚡', href: '/action-plan' }
];
