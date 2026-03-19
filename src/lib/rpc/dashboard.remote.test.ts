import { describe, it, expect } from 'vitest';
import { statusDistributionSchema, statCardSchema, auditListItemSchema, criticalActionSchema, dashboardStatsSchema, dashboardDataSchema } from '$lib/types';
import { getDashboardData, getFilteredAudits } from './dashboard.remote';

// --- StatusDistribution schema ---

describe('statusDistributionSchema validation', () => {
	it('accepts valid status distribution', () => {
		const result = statusDistributionSchema.safeParse({
			label: 'Aktuell',
			percentage: 45,
			color: '#38a169',
			count: 18
		});
		expect(result.success).toBe(true);
	});

	it('rejects percentage below 0', () => {
		const result = statusDistributionSchema.safeParse({
			label: 'Aktuell',
			percentage: -5,
			color: '#38a169',
			count: 0
		});
		expect(result.success).toBe(false);
	});

	it('rejects percentage above 100', () => {
		const result = statusDistributionSchema.safeParse({
			label: 'Aktuell',
			percentage: 150,
			color: '#38a169',
			count: 0
		});
		expect(result.success).toBe(false);
	});

	it('rejects negative count', () => {
		const result = statusDistributionSchema.safeParse({
			label: 'Test',
			percentage: 50,
			color: '#000',
			count: -1
		});
		expect(result.success).toBe(false);
	});
});

// --- StatCard schema ---

describe('statCardSchema validation', () => {
	it('accepts valid stat card', () => {
		const result = statCardSchema.safeParse({
			id: 'total-audits',
			icon: '📊',
			value: 42,
			label: 'dashboard.totalAudits',
			href: '/search-manage',
			color: '#667eea'
		});
		expect(result.success).toBe(true);
	});

	it('rejects missing required fields', () => {
		const result = statCardSchema.safeParse({ id: 'test' });
		expect(result.success).toBe(false);
	});

	it('rejects negative value', () => {
		const result = statCardSchema.safeParse({
			id: 'test',
			icon: '📊',
			value: -1,
			label: 'test',
			href: '/test',
			color: '#000'
		});
		expect(result.success).toBe(false);
	});
});

// --- AuditListItem schema ---

describe('auditListItemSchema validation', () => {
	const validItem = {
		id: 'audit-1',
		title: 'ISO 9001 Audit Q1',
		isoStandard: 'ISO 9001',
		auditor: 'Max Mustermann',
		date: '2026-04-01',
		status: 'planned' as const,
		department: 'Produktion'
	};

	it('accepts valid audit list item', () => {
		const result = auditListItemSchema.safeParse(validItem);
		expect(result.success).toBe(true);
	});

	it('accepts all valid statuses', () => {
		for (const status of ['planned', 'in_progress', 'completed', 'cancelled']) {
			const result = auditListItemSchema.safeParse({ ...validItem, status });
			expect(result.success).toBe(true);
		}
	});

	it('rejects invalid status', () => {
		const result = auditListItemSchema.safeParse({ ...validItem, status: 'unknown' });
		expect(result.success).toBe(false);
	});

	it('rejects missing department', () => {
		const { department: _, ...noDepItem } = validItem;
		const result = auditListItemSchema.safeParse(noDepItem);
		expect(result.success).toBe(false);
	});
});

// --- CriticalAction schema ---

describe('criticalActionSchema validation', () => {
	const validAction = {
		id: 'action-1',
		title: 'Korrektur Dokumentation',
		auditTitle: 'ISO 9001 Audit Q1',
		dueDate: '2026-03-15',
		priority: 'high' as const,
		responsible: 'Erika Muster',
		daysOverdue: 5
	};

	it('accepts valid critical action', () => {
		const result = criticalActionSchema.safeParse(validAction);
		expect(result.success).toBe(true);
	});

	it('accepts all priority levels', () => {
		for (const priority of ['high', 'medium', 'low']) {
			const result = criticalActionSchema.safeParse({ ...validAction, priority });
			expect(result.success).toBe(true);
		}
	});

	it('rejects invalid priority', () => {
		const result = criticalActionSchema.safeParse({ ...validAction, priority: 'critical' });
		expect(result.success).toBe(false);
	});

	it('accepts zero daysOverdue (not yet overdue)', () => {
		const result = criticalActionSchema.safeParse({ ...validAction, daysOverdue: 0 });
		expect(result.success).toBe(true);
	});
});

// --- DashboardStats schema ---

describe('dashboardStatsSchema validation', () => {
	const validStats = {
		totalAudits: 40,
		totalAuditors: 12,
		planned: 10,
		completed: 18,
		inProgress: 8,
		openActions: 15,
		overdueActions: 3,
		upcomingAudits: 5
	};

	it('accepts valid stats', () => {
		const result = dashboardStatsSchema.safeParse(validStats);
		expect(result.success).toBe(true);
	});

	it('accepts all zeros', () => {
		const zeros = Object.fromEntries(Object.keys(validStats).map((k) => [k, 0]));
		const result = dashboardStatsSchema.safeParse(zeros);
		expect(result.success).toBe(true);
	});

	it('rejects negative values', () => {
		const result = dashboardStatsSchema.safeParse({ ...validStats, totalAudits: -1 });
		expect(result.success).toBe(false);
	});

	it('rejects missing fields', () => {
		const { totalAudits: _, ...partial } = validStats;
		const result = dashboardStatsSchema.safeParse(partial);
		expect(result.success).toBe(false);
	});
});

// --- DashboardData schema (full payload) ---

describe('dashboardDataSchema validation', () => {
	const validData = {
		statusDistribution: [
			{ label: 'Aktuell', percentage: 45, color: '#38a169', count: 18 },
			{ label: 'Fällig', percentage: 20, color: '#dd6b20', count: 8 },
			{ label: 'In Prüfung', percentage: 25, color: '#3182ce', count: 10 },
			{ label: 'Überfällig', percentage: 10, color: '#e53e3e', count: 4 }
		],
		stats: {
			totalAudits: 40,
			totalAuditors: 12,
			planned: 10,
			completed: 18,
			inProgress: 8,
			openActions: 15,
			overdueActions: 3,
			upcomingAudits: 5
		},
		recentAudits: [
			{
				id: 'a1',
				title: 'Test Audit',
				isoStandard: 'ISO 9001',
				auditor: 'Max M.',
				date: '2026-03-01',
				status: 'completed' as const,
				department: 'QM'
			}
		],
		upcomingAudits: [],
		criticalActions: []
	};

	it('accepts valid full dashboard data', () => {
		const result = dashboardDataSchema.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it('accepts empty arrays for all list fields', () => {
		const result = dashboardDataSchema.safeParse({
			...validData,
			statusDistribution: [],
			recentAudits: [],
			upcomingAudits: [],
			criticalActions: []
		});
		expect(result.success).toBe(true);
	});

	it('rejects missing stats field', () => {
		const { stats: _, ...noStats } = validData;
		const result = dashboardDataSchema.safeParse(noStats);
		expect(result.success).toBe(false);
	});

	it('rejects invalid nested audit item', () => {
		const result = dashboardDataSchema.safeParse({
			...validData,
			recentAudits: [{ id: 'bad' }]
		});
		expect(result.success).toBe(false);
	});
});

// --- Remote function exports ---

describe('dashboard remote function exports', () => {
	it('exports getDashboardData as a function', () => {
		expect(typeof getDashboardData).toBe('function');
	});

	it('exports getFilteredAudits as a function', () => {
		expect(typeof getFilteredAudits).toBe('function');
	});
});
