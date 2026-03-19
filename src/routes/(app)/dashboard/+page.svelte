<script lang="ts">
	import { getContext } from 'svelte';
	import type { I18nRune } from '$lib/i18n/i18n.svelte';
	import type { DashboardData, AuditListItem, AuditStatus } from '$lib/types';
	import { getDashboardData, getFilteredAudits } from '$lib/rpc/dashboard.remote';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import BarChart3 from '@lucide/svelte/icons/bar-chart-3';
	import Users from '@lucide/svelte/icons/users';
	import CalendarClock from '@lucide/svelte/icons/calendar-clock';
	import CheckCircle2 from '@lucide/svelte/icons/check-circle-2';
	import RotateCw from '@lucide/svelte/icons/rotate-cw';
	import ClipboardList from '@lucide/svelte/icons/clipboard-list';
	import AlertTriangle from '@lucide/svelte/icons/alert-triangle';
	import Bell from '@lucide/svelte/icons/bell';
	import CalendarDays from '@lucide/svelte/icons/calendar-days';
	import Clock from '@lucide/svelte/icons/clock';
	import Building2 from '@lucide/svelte/icons/building-2';
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';

	const i18n = getContext<I18nRune>('i18n');

	let loading = $state(true);
	let dashboardData = $state<DashboardData | null>(null);
	let filteredAudits = $state<AuditListItem[]>([]);
	let activeFilter = $state<AuditStatus | 'all'>('all');
	let filterLoading = $state(false);

	$effect(() => {
		loadDashboard();
	});

	async function loadDashboard() {
		loading = true;
		try {
			dashboardData = await getDashboardData();
			filteredAudits = dashboardData.recentAudits;
		} catch {
			dashboardData = null;
			filteredAudits = [];
		} finally {
			loading = false;
		}
	}

	async function setFilter(status: AuditStatus | 'all') {
		activeFilter = status;
		filterLoading = true;
		try {
			filteredAudits = await getFilteredAudits(status);
		} catch {
			filteredAudits = [];
		} finally {
			filterLoading = false;
		}
	}

	const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
		planned: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300' },
		in_progress: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300' },
		completed: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300' },
		cancelled: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300' }
	};

	function statusColor(status: string) {
		return STATUS_COLORS[status] ?? STATUS_COLORS.planned;
	}

	let statCards = $derived.by(() => {
		if (!dashboardData) return [];
		const s = dashboardData.stats;
		return [
			{ id: 'total', icon: 0, value: s.totalAudits, label: 'dashboard.totalAudits', href: '/search-manage', color: 'from-brand to-accent-mid' },
			{
				id: 'auditors',
				icon: 1,
				value: s.totalAuditors,
				label: 'dashboard.totalAuditors',
				href: '/auditor-management',
				color: 'from-violet-500 to-purple-600 dark:from-violet-400 dark:to-purple-500'
			},
			{
				id: 'planned',
				icon: 2,
				value: s.planned,
				label: 'dashboard.planned',
				href: '/search-manage?status=planned',
				color: 'from-blue-500 to-cyan-500 dark:from-blue-400 dark:to-cyan-400'
			},
			{
				id: 'completed',
				icon: 3,
				value: s.completed,
				label: 'dashboard.completed',
				href: '/search-manage?status=completed',
				color: 'from-emerald-500 to-teal-500 dark:from-emerald-400 dark:to-teal-400'
			},
			{
				id: 'inProgress',
				icon: 4,
				value: s.inProgress,
				label: 'dashboard.inProgress',
				href: '/search-manage?status=in_progress',
				color: 'from-amber-500 to-orange-500 dark:from-amber-400 dark:to-orange-400'
			},
			{
				id: 'openActions',
				icon: 5,
				value: s.openActions,
				label: 'dashboard.openActions',
				href: '/action-plan?filter=offen',
				color: 'from-rose-500 to-red-500 dark:from-rose-400 dark:to-red-400'
			},
			{
				id: 'overdueActions',
				icon: 6,
				value: s.overdueActions,
				label: 'dashboard.overdueActions',
				href: '/action-plan?filter=ueberfaellig',
				color: 'from-red-600 to-rose-700 dark:from-red-400 dark:to-rose-500'
			},
			{
				id: 'upcoming',
				icon: 7,
				value: s.upcomingAudits,
				label: 'dashboard.upcomingAudits',
				href: '/calendar',
				color: 'from-sky-500 to-blue-600 dark:from-sky-400 dark:to-blue-500'
			}
		];
	});

	const FILTER_OPTIONS: { label: string; value: AuditStatus | 'all' }[] = [
		{ label: 'dashboard.filterAll', value: 'all' },
		{ label: 'dashboard.filterPlanned', value: 'planned' },
		{ label: 'dashboard.filterInProgress', value: 'in_progress' },
		{ label: 'dashboard.filterCompleted', value: 'completed' }
	];

	const PRIORITY_STYLES: Record<string, string> = {
		high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
		medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
		low: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
	};
</script>

<div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
	<!-- Header -->
	<h1 class="text-foreground animate-fade-up mb-8 text-2xl font-bold tracking-tight" style="font-family: var(--font-display)">
		{i18n.t('dashboard.title')}
	</h1>

	{#if loading}
		<!-- Skeleton: Status Distribution -->
		<div class="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
			{#each Array(4) as _, i (i)}
				<Skeleton class="h-28 rounded-xl" />
			{/each}
		</div>
		<!-- Skeleton: Stat Cards -->
		<div class="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
			{#each Array(8) as _, i (i)}
				<Skeleton class="h-24 rounded-xl" />
			{/each}
		</div>
		<!-- Skeleton: Lists -->
		<Skeleton class="mb-6 h-10 w-72 rounded-full" />
		<div class="space-y-3">
			{#each Array(4) as _, i (i)}
				<Skeleton class="h-16 rounded-xl" />
			{/each}
		</div>
	{:else if dashboardData}
		<!-- Status Distribution -->
		<section class="mb-8">
			<div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
				{#each dashboardData.statusDistribution as dist, idx (dist.label)}
					<div class="animate-fade-up relative overflow-hidden rounded-xl p-5 text-white shadow-lg" style="background: {dist.color}; animation-delay: {idx * 80}ms">
						<div class="relative z-10">
							<p class="text-3xl font-extrabold tracking-tight" style="font-family: var(--font-display)">{dist.percentage}%</p>
							<p class="mt-1 text-sm font-medium opacity-90">{dist.label}</p>
							<p class="mt-0.5 text-xs opacity-70">{dist.count} Audits</p>
						</div>
						<!-- Decorative circle -->
						<div class="absolute -right-4 -bottom-4 h-24 w-24 rounded-full opacity-15" style="background: white"></div>
					</div>
				{/each}
			</div>
		</section>

		<!-- Stat Cards Grid -->
		<section class="mb-8">
			<div class="grid grid-cols-2 gap-4 md:grid-cols-4">
				{#each statCards as card, idx (card.id)}
					<a href={card.href} class="animate-fade-up group" style="animation-delay: {320 + idx * 60}ms">
						<Card.Root class="h-full overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
							<Card.Content class="relative flex items-center gap-4 p-4">
								<div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br {card.color} text-white shadow-sm">
									{#if idx === 0}<BarChart3 class="h-5 w-5" />
									{:else if idx === 1}<Users class="h-5 w-5" />
									{:else if idx === 2}<CalendarClock class="h-5 w-5" />
									{:else if idx === 3}<CheckCircle2 class="h-5 w-5" />
									{:else if idx === 4}<RotateCw class="h-5 w-5" />
									{:else if idx === 5}<ClipboardList class="h-5 w-5" />
									{:else if idx === 6}<AlertTriangle class="h-5 w-5" />
									{:else}<Bell class="h-5 w-5" />
									{/if}
								</div>
								<div class="min-w-0">
									<p class="text-foreground text-2xl leading-none font-bold" style="font-family: var(--font-display)">{card.value}</p>
									<p class="text-muted-foreground mt-1 truncate text-xs">{i18n.t(card.label)}</p>
								</div>
								<ArrowUpRight class="text-muted-foreground/0 group-hover:text-muted-foreground absolute top-3 right-3 h-4 w-4 transition-all duration-200" />
							</Card.Content>
						</Card.Root>
					</a>
				{/each}
			</div>
		</section>

		<!-- Audit List with Filters -->
		<section class="animate-fade-up mb-8" style="animation-delay: 800ms">
			<h2 class="text-foreground mb-4 text-lg font-semibold" style="font-family: var(--font-display)">
				{i18n.t('dashboard.auditList')}
			</h2>

			<!-- Filter Buttons -->
			<div class="mb-4 flex flex-wrap gap-2">
				{#each FILTER_OPTIONS as opt (opt.value)}
					<button
						onclick={() => setFilter(opt.value)}
						class="rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200
							{activeFilter === opt.value ? 'bg-brand text-white shadow-sm' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}"
					>
						{i18n.t(opt.label)}
					</button>
				{/each}
			</div>

			<!-- Audit entries -->
			{#if filterLoading}
				<div class="space-y-3">
					{#each Array(3) as _, i (i)}
						<Skeleton class="h-14 rounded-lg" />
					{/each}
				</div>
			{:else if filteredAudits.length === 0}
				<Card.Root>
					<Card.Content class="flex flex-col items-center py-10">
						<BarChart3 class="text-muted-foreground mb-3 h-8 w-8" />
						<p class="text-muted-foreground text-sm">{i18n.t('dashboard.noAudits')}</p>
					</Card.Content>
				</Card.Root>
			{:else}
				<div class="space-y-2">
					{#each filteredAudits as audit (audit.id)}
						{@const sc = statusColor(audit.status)}
						<a href="/search-manage/edit?id={audit.id}" class="block">
							<Card.Root class="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
								<Card.Content class="flex items-center gap-4 p-4">
									<div class="min-w-0 flex-1">
										<div class="flex items-center gap-2">
											<p class="text-foreground truncate text-sm font-semibold" style="font-family: var(--font-display)">{audit.title}</p>
											<Badge class="{sc.bg} {sc.text} shrink-0 border-0 text-[0.65rem]">
												{i18n.t(`audit.status.${audit.status}`)}
											</Badge>
										</div>
										<div class="text-muted-foreground mt-1 flex items-center gap-3 text-xs">
											<span class="flex items-center gap-1">
												<Building2 class="h-3 w-3" />
												{audit.department}
											</span>
											<span class="flex items-center gap-1">
												<CalendarDays class="h-3 w-3" />
												{audit.date}
											</span>
											{#if audit.isoStandard}
												<Badge variant="outline" class="text-[0.6rem]">{audit.isoStandard}</Badge>
											{/if}
										</div>
									</div>
									<p class="text-muted-foreground hidden shrink-0 text-xs sm:block">{audit.auditor}</p>
								</Card.Content>
							</Card.Root>
						</a>
					{/each}
				</div>
			{/if}
		</section>

		<!-- Bottom: Upcoming Audits + Critical Actions -->
		<section class="animate-fade-up grid grid-cols-1 gap-6 md:grid-cols-2" style="animation-delay: 900ms">
			<!-- Upcoming Audits -->
			<div>
				<h2 class="text-foreground mb-4 text-lg font-semibold" style="font-family: var(--font-display)">
					{i18n.t('dashboard.nextAudits')}
				</h2>
				{#if dashboardData.upcomingAudits.length === 0}
					<Card.Root>
						<Card.Content class="flex flex-col items-center py-8">
							<CalendarDays class="text-muted-foreground mb-2 h-7 w-7" />
							<p class="text-muted-foreground text-sm">{i18n.t('dashboard.noAudits')}</p>
						</Card.Content>
					</Card.Root>
				{:else}
					<div class="space-y-2">
						{#each dashboardData.upcomingAudits.slice(0, 5) as audit (audit.id)}
							<Card.Root class="transition-all duration-200 hover:shadow-md">
								<Card.Content class="flex items-center gap-3 p-3">
									<div class="bg-brand/10 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
										<CalendarClock class="text-brand h-4 w-4" />
									</div>
									<div class="min-w-0 flex-1">
										<p class="text-foreground truncate text-sm font-medium">{audit.title}</p>
										<div class="text-muted-foreground flex items-center gap-2 text-xs">
											<span class="flex items-center gap-1">
												<Clock class="h-3 w-3" />
												{audit.date}
											</span>
											<span>{audit.auditor}</span>
										</div>
									</div>
									{#if audit.isoStandard}
										<Badge variant="outline" class="shrink-0 text-[0.6rem]">{audit.isoStandard}</Badge>
									{/if}
								</Card.Content>
							</Card.Root>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Critical Actions -->
			<div>
				<h2 class="text-foreground mb-4 text-lg font-semibold" style="font-family: var(--font-display)">
					{i18n.t('dashboard.criticalActions')}
				</h2>
				{#if dashboardData.criticalActions.length === 0}
					<Card.Root>
						<Card.Content class="flex flex-col items-center py-8">
							<AlertTriangle class="text-muted-foreground mb-2 h-7 w-7" />
							<p class="text-muted-foreground text-sm">{i18n.t('dashboard.noActions')}</p>
						</Card.Content>
					</Card.Root>
				{:else}
					<div class="space-y-2">
						{#each dashboardData.criticalActions.slice(0, 5) as action (action.id)}
							<Card.Root class="transition-all duration-200 hover:shadow-md {action.daysOverdue > 0 ? 'border-red-200 dark:border-red-900/40' : ''}">
								<Card.Content class="flex items-center gap-3 p-3">
									<div
										class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg {action.daysOverdue > 0
											? 'bg-red-100 dark:bg-red-900/30'
											: 'bg-amber-100 dark:bg-amber-900/30'}"
									>
										<AlertTriangle class="h-4 w-4 {action.daysOverdue > 0 ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}" />
									</div>
									<div class="min-w-0 flex-1">
										<p class="text-foreground truncate text-sm font-medium">{action.title}</p>
										<div class="text-muted-foreground flex items-center gap-2 text-xs">
											<span>{action.auditTitle}</span>
											<span>{action.dueDate}</span>
										</div>
									</div>
									<div class="flex shrink-0 flex-col items-end gap-1">
										<Badge class="{PRIORITY_STYLES[action.priority] ?? ''} border-0 text-[0.6rem]">
											{i18n.t(`actions.priority.${action.priority}`)}
										</Badge>
										{#if action.daysOverdue > 0}
											<span class="text-[0.6rem] font-medium text-red-600 dark:text-red-400">
												{i18n.t('dashboard.daysOverdue', { count: action.daysOverdue })}
											</span>
										{/if}
									</div>
								</Card.Content>
							</Card.Root>
						{/each}
					</div>
				{/if}
			</div>
		</section>
	{:else}
		<!-- Error / No Data -->
		<div class="flex flex-col items-center justify-center py-20">
			<BarChart3 class="text-muted-foreground mb-4 h-12 w-12" />
			<p class="text-muted-foreground text-sm">{i18n.t('dashboard.noAudits')}</p>
		</div>
	{/if}
</div>
