import type { AuditStatus } from './audit';

export interface StatCard {
	id: string;
	value: number;
	label: string;
	href: string;
}

export interface StatusDistribution {
	label: string;
	percentage: number;
	count: number;
	status: AuditStatus | 'overdue';
}

export interface DashboardData {
	stats: StatCard[];
	statusDistribution: StatusDistribution[];
}
