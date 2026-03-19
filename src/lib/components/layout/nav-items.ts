export interface NavItem {
	id: string;
	label: string;
	icon: string;
	href: string;
}

export const NAV_ITEMS: NavItem[] = [
	{ id: 'overview', label: 'nav.overview', icon: 'clipboard-list', href: '/overview' },
	{ id: 'dashboard', label: 'nav.dashboard', icon: 'bar-chart-3', href: '/dashboard' },
	{
		id: 'auditor-management',
		label: 'nav.auditor_management',
		icon: 'users',
		href: '/auditor-management'
	},
	{ id: 'add-auditor', label: 'nav.add_auditor', icon: 'user-plus', href: '/add-auditor' },
	{ id: 'search-manage', label: 'nav.search_manage', icon: 'search', href: '/search-manage' },
	{ id: 'calendar', label: 'nav.calendar', icon: 'calendar', href: '/calendar' },
	{
		id: 'import-export',
		label: 'nav.import_export',
		icon: 'folder-input',
		href: '/import-export'
	},
	{
		id: 'plan-generator',
		label: 'nav.plan_generator',
		icon: 'file-text',
		href: '/plan-generator'
	},
	{
		id: 'report-generator',
		label: 'nav.report_generator',
		icon: 'file-check',
		href: '/report-generator'
	},
	{
		id: 'notes-generator',
		label: 'nav.notes_generator',
		icon: 'notebook-pen',
		href: '/notes-generator'
	},
	{
		id: 'audit-questions',
		label: 'nav.audit_questions',
		icon: 'help-circle',
		href: '/audit-questions'
	},
	{ id: 'action-plan', label: 'nav.action_plan', icon: 'zap', href: '/action-plan' }
];
