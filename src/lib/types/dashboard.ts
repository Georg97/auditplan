import { z } from 'zod';
import { auditStatusSchema, prioritySchema } from './common';

// --- Status Distribution Card ---

export const statusDistributionSchema = z.object({
	label: z.string(),
	percentage: z.number().min(0).max(100),
	color: z.string(),
	count: z.number().int().min(0)
});

export type StatusDistribution = z.infer<typeof statusDistributionSchema>;

// --- Stat Card ---

export const statCardSchema = z.object({
	id: z.string(),
	icon: z.string(),
	value: z.number().int().min(0),
	label: z.string(),
	href: z.string(),
	color: z.string()
});

export type StatCard = z.infer<typeof statCardSchema>;

// --- Audit List Item (lightweight for dashboard) ---

export const auditListItemSchema = z.object({
	id: z.string(),
	title: z.string(),
	isoStandard: z.string(),
	auditor: z.string(),
	date: z.string(),
	status: auditStatusSchema,
	department: z.string()
});

export type AuditListItem = z.infer<typeof auditListItemSchema>;

// --- Critical Action ---

export const criticalActionSchema = z.object({
	id: z.string(),
	title: z.string(),
	auditTitle: z.string(),
	dueDate: z.string(),
	priority: prioritySchema,
	responsible: z.string(),
	daysOverdue: z.number().int()
});

export type CriticalAction = z.infer<typeof criticalActionSchema>;

// --- Dashboard Stats ---

export const dashboardStatsSchema = z.object({
	totalAudits: z.number().int().min(0),
	totalAuditors: z.number().int().min(0),
	planned: z.number().int().min(0),
	completed: z.number().int().min(0),
	inProgress: z.number().int().min(0),
	openActions: z.number().int().min(0),
	overdueActions: z.number().int().min(0),
	upcomingAudits: z.number().int().min(0)
});

export type DashboardStats = z.infer<typeof dashboardStatsSchema>;

// --- Dashboard Data (full payload) ---

export const dashboardDataSchema = z.object({
	statusDistribution: z.array(statusDistributionSchema),
	stats: dashboardStatsSchema,
	recentAudits: z.array(auditListItemSchema),
	upcomingAudits: z.array(auditListItemSchema),
	criticalActions: z.array(criticalActionSchema)
});

export type DashboardData = z.infer<typeof dashboardDataSchema>;
