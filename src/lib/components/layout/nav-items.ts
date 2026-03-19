import type { Component } from 'svelte';
import LayoutDashboard from '@lucide/svelte/icons/layout-dashboard';
import BarChart3 from '@lucide/svelte/icons/bar-chart-3';
import Users from '@lucide/svelte/icons/users';
import UserPlus from '@lucide/svelte/icons/user-plus';
import Search from '@lucide/svelte/icons/search';
import Calendar from '@lucide/svelte/icons/calendar';
import ArrowLeftRight from '@lucide/svelte/icons/arrow-left-right';
import FileText from '@lucide/svelte/icons/file-text';
import FileBarChart from '@lucide/svelte/icons/file-bar-chart';
import StickyNote from '@lucide/svelte/icons/sticky-note';
import HelpCircle from '@lucide/svelte/icons/help-circle';
import ClipboardCheck from '@lucide/svelte/icons/clipboard-check';

export interface NavItem {
	label: string;
	icon: Component;
	href: string;
	group: 'overview' | 'management' | 'generators' | 'tools';
}

export interface NavGroup {
	key: string;
	label: string;
	items: NavItem[];
}

export const NAV_ITEMS: NavItem[] = [
	{ label: 'nav.overview', icon: LayoutDashboard, href: '/overview', group: 'overview' },
	{ label: 'nav.dashboard', icon: BarChart3, href: '/dashboard', group: 'overview' },
	{ label: 'nav.auditorManagement', icon: Users, href: '/auditor-management', group: 'management' },
	{ label: 'nav.addAuditor', icon: UserPlus, href: '/add-auditor', group: 'management' },
	{ label: 'nav.searchManage', icon: Search, href: '/search-manage', group: 'management' },
	{ label: 'nav.calendar', icon: Calendar, href: '/calendar', group: 'management' },
	{ label: 'nav.importExport', icon: ArrowLeftRight, href: '/import-export', group: 'tools' },
	{ label: 'nav.planGenerator', icon: FileText, href: '/plan-generator', group: 'generators' },
	{ label: 'nav.reportGenerator', icon: FileBarChart, href: '/report-generator', group: 'generators' },
	{ label: 'nav.notesGenerator', icon: StickyNote, href: '/notes-generator', group: 'generators' },
	{ label: 'nav.auditQuestions', icon: HelpCircle, href: '/audit-questions', group: 'generators' },
	{ label: 'nav.actionPlan', icon: ClipboardCheck, href: '/action-plan', group: 'tools' }
];

export function groupNavItems(items: NavItem[]): NavGroup[] {
	const groups: Record<string, NavGroup> = {
		overview: { key: 'overview', label: 'nav.group.overview', items: [] },
		management: { key: 'management', label: 'nav.group.management', items: [] },
		generators: { key: 'generators', label: 'nav.group.generators', items: [] },
		tools: { key: 'tools', label: 'nav.group.tools', items: [] }
	};

	for (const item of items) {
		groups[item.group].items.push(item);
	}

	return Object.values(groups).filter((g) => g.items.length > 0);
}

export function isActiveRoute(pathname: string, href: string): boolean {
	if (href === '/overview') return pathname === '/overview' || pathname === '/';
	return pathname === href || pathname.startsWith(href + '/');
}
