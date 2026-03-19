<script lang="ts">
	import { getContext } from 'svelte';
	import type { I18nRune } from '$lib/i18n/i18n.svelte';
	import { getAudits } from '$lib/rpc/audits.remote';
	import { getAuditors } from '$lib/rpc/auditoren.remote';
	import { getActions } from '$lib/rpc/massnahmen.remote';
	import { getCalendarEntries } from '$lib/rpc/kalender.remote';
	import * as Card from '$lib/components/ui/card';
	import { goto } from '$app/navigation';
	import BarChart2 from '@lucide/svelte/icons/bar-chart-2';
	import Users from '@lucide/svelte/icons/users';
	import CalendarDays from '@lucide/svelte/icons/calendar-days';
	import CheckCircle from '@lucide/svelte/icons/check-circle';
	import RefreshCw from '@lucide/svelte/icons/refresh-cw';
	import ClipboardList from '@lucide/svelte/icons/clipboard-list';
	import AlertTriangle from '@lucide/svelte/icons/alert-triangle';
	import Bell from '@lucide/svelte/icons/bell';
	import type { AuditStatus } from '$lib/types/audit';
	// Use Awaited<ReturnType<...>> to match the actual DB row shape (wider string types)
	type AuditRow = Awaited<ReturnType<typeof getAudits>>[number];
	type AuditorRow = Awaited<ReturnType<typeof getAuditors>>[number];
	type ActionRow = Awaited<ReturnType<typeof getActions>>[number];
	type CalendarRow = Awaited<ReturnType<typeof getCalendarEntries>>[number];

	const i18n = getContext<I18nRune>('i18n');

	type FilterValue = 'all' | AuditStatus;

	let activeFilter = $state<FilterValue>('all');

	// Load all data once — calendar needs a range, use current year
	const now = new Date();
	const yearStart = `${now.getFullYear()}-01-01`;
	const yearEnd = `${now.getFullYear()}-12-31`;
	const dataPromise = Promise.all([getAudits(), getAuditors(), getActions(), getCalendarEntries({ startDatum: yearStart, endDatum: yearEnd })]);

	function getStatusColor(status: string): string {
		switch (status) {
			case 'planned':
				return 'bg-blue-500';
			case 'in_progress':
				return 'bg-yellow-500';
			case 'completed':
				return 'bg-green-500';
			case 'cancelled':
				return 'bg-red-500';
			default:
				return 'bg-gray-400';
		}
	}

	function getStatusLabel(status: string): string {
		return i18n.t(`status.${status}`);
	}

	function formatDate(dateStr: string): string {
		if (!dateStr) return '—';
		const d = new Date(dateStr);
		if (isNaN(d.getTime())) return dateStr;
		return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
	}

	function computeStats(audits: AuditRow[], auditors: AuditorRow[], actionsData: ActionRow[], calendarData: CalendarRow[]) {
		const now = new Date();
		const today = now.toISOString().slice(0, 10);
		const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
		const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);

		const total = audits.length;
		const planned = audits.filter((a) => a.status === 'planned').length;
		const inProgress = audits.filter((a) => a.status === 'in_progress').length;
		const completed = audits.filter((a) => a.status === 'completed').length;
		const cancelled = audits.filter((a) => a.status === 'cancelled').length;

		const upcomingAudits = audits.filter((a) => a.startDatum >= today && a.startDatum <= in30Days && a.status === 'planned').length;

		const completedThisMonth = audits.filter((a) => a.status === 'completed' && a.updatedAt && new Date(a.updatedAt).toISOString().slice(0, 10) >= startOfMonth).length;

		const openActions = actionsData.filter((a) => a.status !== 'completed' && a.status !== 'verified').length;
		const overdueActions = actionsData.filter((a) => a.status !== 'completed' && a.status !== 'verified' && a.frist && a.frist < today).length;

		const upcomingCalendarEntries = calendarData.filter((e) => e.datum >= today && e.datum <= in30Days).length;

		return {
			total,
			planned,
			inProgress,
			completed,
			cancelled,
			totalAuditors: auditors.length,
			upcomingAudits,
			completedThisMonth,
			openActions,
			overdueActions,
			upcomingCalendarEntries
		};
	}

	function computeDistribution(audits: AuditRow[]) {
		const total = audits.length || 1;
		const planned = audits.filter((a) => a.status === 'planned').length;
		const inProgress = audits.filter((a) => a.status === 'in_progress').length;
		const completed = audits.filter((a) => a.status === 'completed').length;
		const cancelled = audits.filter((a) => a.status === 'cancelled').length;

		return [
			{
				status: 'planned' as AuditStatus,
				label: i18n.t('status.planned'),
				count: planned,
				percentage: Math.round((planned / total) * 100),
				bgClass: 'bg-blue-500'
			},
			{
				status: 'in_progress' as AuditStatus,
				label: i18n.t('status.in_progress'),
				count: inProgress,
				percentage: Math.round((inProgress / total) * 100),
				bgClass: 'bg-yellow-500'
			},
			{
				status: 'completed' as AuditStatus,
				label: i18n.t('status.completed'),
				count: completed,
				percentage: Math.round((completed / total) * 100),
				bgClass: 'bg-green-500'
			},
			{
				status: 'cancelled' as AuditStatus,
				label: i18n.t('status.cancelled'),
				count: cancelled,
				percentage: Math.round((cancelled / total) * 100),
				bgClass: 'bg-red-500'
			}
		];
	}

	function getRecentAudits(audits: AuditRow[]): AuditRow[] {
		return [...audits].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
	}

	function getOverdueActions(actionsData: ActionRow[]): ActionRow[] {
		const today = new Date().toISOString().slice(0, 10);
		return actionsData
			.filter((a) => a.status !== 'completed' && a.status !== 'verified' && a.frist && a.frist < today)
			.sort((a, b) => (a.frist ?? '').localeCompare(b.frist ?? ''))
			.slice(0, 5);
	}

	function actionDaysOverdue(frist: string | null): number {
		if (!frist) return 0;
		const diff = new Date().getTime() - new Date(frist).getTime();
		return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
	}

	function getFilteredAudits(audits: AuditRow[], filter: FilterValue): AuditRow[] {
		if (filter === 'all') return audits;
		return audits.filter((a) => a.status === filter);
	}

	const statCards = [
		{
			key: 'total',
			labelKey: 'dashboard.total_audits',
			Icon: BarChart2,
			color: '#667eea',
			href: '/search-manage'
		},
		{
			key: 'totalAuditors',
			labelKey: 'dashboard.total_auditors',
			Icon: Users,
			color: '#764ba2',
			href: '/auditor-management'
		},
		{
			key: 'planned',
			labelKey: 'dashboard.planned_audits',
			Icon: CalendarDays,
			color: '#3182ce',
			href: '/search-manage?status=planned'
		},
		{
			key: 'completedThisMonth',
			labelKey: 'dashboard.completed_this_month',
			Icon: CheckCircle,
			color: '#38a169',
			href: '/search-manage?status=completed'
		},
		{
			key: 'inProgress',
			labelKey: 'dashboard.active_auditors',
			Icon: RefreshCw,
			color: '#dd6b20',
			href: '/search-manage?status=in_progress'
		},
		{
			key: 'openActions',
			labelKey: 'dashboard.open_actions',
			Icon: ClipboardList,
			color: '#e53e3e',
			href: '/action-plan?filter=offen'
		},
		{
			key: 'overdueActions',
			labelKey: 'dashboard.overdue_actions',
			Icon: AlertTriangle,
			color: '#c53030',
			href: '/action-plan?filter=ueberfaellig'
		},
		{
			key: 'upcomingAudits',
			labelKey: 'dashboard.upcoming_audits',
			Icon: Bell,
			color: '#2b6cb0',
			href: '/calendar'
		}
	] as const;

	const filters: { value: FilterValue; labelKey: string }[] = [
		{ value: 'all', labelKey: 'dashboard.filter_all' },
		{ value: 'planned', labelKey: 'dashboard.filter_planned' },
		{ value: 'in_progress', labelKey: 'dashboard.filter_in_progress' },
		{ value: 'completed', labelKey: 'dashboard.filter_completed' }
	];
</script>

<div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
	<h1 class="mb-6 text-2xl font-bold" style="font-family: var(--font-display)">
		{i18n.t('dashboard.title')}
	</h1>

	{#await dataPromise}
		<!-- Loading skeletons -->
		<div class="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
			{#each [1, 2, 3, 4] as n (n)}
				<div class="bg-muted h-28 animate-pulse rounded-xl"></div>
			{/each}
		</div>
		<div class="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
			{#each [1, 2, 3, 4, 5, 6, 7, 8] as n (n)}
				<div class="bg-muted h-24 animate-pulse rounded-xl"></div>
			{/each}
		</div>
	{:then [audits, auditors, actionsData, calendarData]}
		{@const stats = computeStats(audits, auditors, actionsData, calendarData)}
		{@const distribution = computeDistribution(audits)}
		{@const recentAudits = getRecentAudits(audits)}
		{@const overdueActionsList = getOverdueActions(actionsData)}
		{@const filteredAudits = getFilteredAudits(audits, activeFilter)}

		<!-- Status Distribution -->
		<section class="mb-6">
			<h2 class="text-muted-foreground mb-3 text-sm font-semibold tracking-wide uppercase">
				{i18n.t('dashboard.status_distribution')}
			</h2>
			<div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
				{#each distribution as dist (dist.status)}
					<div class="rounded-xl p-6 text-white {dist.bgClass}">
						<div class="text-4xl font-bold">{dist.percentage}%</div>
						<div class="mt-1 text-sm opacity-90">{dist.label}</div>
						<div class="mt-1 text-base">{dist.count} {dist.count === 1 ? 'Audit' : 'Audits'}</div>
					</div>
				{/each}
			</div>
		</section>

		<!-- Stat Cards (8) -->
		<section class="mb-6">
			<div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
				{#each statCards as card (card.key)}
					{@const value = (stats as Record<string, number>)[card.key] ?? 0}
					<button
						class="bg-card cursor-pointer rounded-xl border p-5 text-left shadow-sm transition-transform duration-150 hover:-translate-y-1 hover:shadow-md"
						onclick={() => goto(card.href)}
					>
						<card.Icon size={28} style="color: {card.color}" class="mb-2" />
						<div class="text-2xl font-bold" style="color: {card.color}">{value}</div>
						<div class="text-muted-foreground mt-0.5 text-xs">{i18n.t(card.labelKey)}</div>
					</button>
				{/each}
			</div>
		</section>

		<!-- Audit list with filter tabs -->
		<section class="mb-6">
			<Card.Root>
				<Card.Header>
					<div class="flex flex-wrap items-center gap-2">
						{#each filters as f (f.value)}
							<button
								class="rounded-full px-4 py-1.5 text-sm font-medium transition-colors"
								class:text-white={activeFilter === f.value}
								class:bg-primary={activeFilter === f.value}
								class:text-muted-foreground={activeFilter !== f.value}
								class:bg-muted={activeFilter !== f.value}
								onclick={() => (activeFilter = f.value)}
							>
								{i18n.t(f.labelKey)}
							</button>
						{/each}
					</div>
				</Card.Header>
				<Card.Content class="p-0">
					{#if filteredAudits.length === 0}
						<p class="text-muted-foreground px-6 py-4 text-sm">{i18n.t('dashboard.no_recent_audits')}</p>
					{:else}
						<div class="divide-y">
							{#each filteredAudits.slice(0, 10) as audit (audit.id)}
								<div class="flex flex-wrap items-center gap-x-4 gap-y-1 px-6 py-3 text-sm">
									<span class="font-medium">{audit.auditName}</span>
									{#if audit.normen}
										<span class="bg-muted rounded px-1.5 py-0.5 font-mono text-xs">{audit.normen}</span>
									{/if}
									<span class="text-muted-foreground">{audit.abteilung}</span>
									<span class="text-muted-foreground">{formatDate(audit.startDatum)}</span>
									<span class="ml-auto flex items-center gap-1">
										<span class="inline-block h-2 w-2 rounded-full {getStatusColor(audit.status)}"></span>
										<span>{getStatusLabel(audit.status)}</span>
									</span>
								</div>
							{/each}
						</div>
					{/if}
				</Card.Content>
			</Card.Root>
		</section>

		<!-- Bottom two-column: Recent audits + Critical actions -->
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<!-- Recent Audits -->
			<Card.Root>
				<Card.Header>
					<Card.Title>{i18n.t('dashboard.recent_audits')}</Card.Title>
				</Card.Header>
				<Card.Content class="p-0">
					{#if recentAudits.length === 0}
						<p class="text-muted-foreground px-6 py-4 text-sm">{i18n.t('dashboard.no_recent_audits')}</p>
					{:else}
						<div class="divide-y">
							{#each recentAudits as audit (audit.id)}
								<div class="flex items-center justify-between px-6 py-3">
									<div>
										<div class="text-sm font-medium">{audit.auditName}</div>
										<div class="text-muted-foreground text-xs">
											{audit.unternehmen} · {formatDate(audit.startDatum)}
										</div>
									</div>
									<span class="flex items-center gap-1 text-xs">
										<span class="inline-block h-2 w-2 rounded-full {getStatusColor(audit.status)}"></span>
										{getStatusLabel(audit.status)}
									</span>
								</div>
							{/each}
						</div>
					{/if}
				</Card.Content>
			</Card.Root>

			<!-- Critical Actions (overdue Maßnahmen) -->
			<Card.Root>
				<Card.Header>
					<Card.Title>{i18n.t('dashboard.critical_actions')}</Card.Title>
				</Card.Header>
				<Card.Content class="p-0">
					{#if overdueActionsList.length === 0}
						<p class="text-muted-foreground px-6 py-4 text-sm">{i18n.t('dashboard.no_critical_actions')}</p>
					{:else}
						<div class="divide-y">
							{#each overdueActionsList as action (action.id)}
								{@const overdue = actionDaysOverdue(action.frist)}
								<div class="flex items-start justify-between px-6 py-3">
									<div>
										<div class="text-sm font-medium">{action.feststellungsbeschreibung}</div>
										<div class="text-muted-foreground text-xs">
											{action.verantwortlicher ?? '—'} · {formatDate(action.frist ?? '')}
										</div>
									</div>
									{#if overdue > 0}
										<span class="rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
											{i18n.t('dashboard.days_overdue', { count: overdue })}
										</span>
									{/if}
								</div>
							{/each}
						</div>
					{/if}
				</Card.Content>
			</Card.Root>
		</div>
	{:catch error}
		<p class="text-destructive text-sm">Fehler beim Laden der Daten: {error.message}</p>
	{/await}
</div>
