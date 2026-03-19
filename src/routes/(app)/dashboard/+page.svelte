<script lang="ts">
	import { getContext } from 'svelte';
	import type { I18nRune } from '$lib/i18n/i18n.svelte';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import BarChart3 from '@lucide/svelte/icons/bar-chart-3';
	import Users from '@lucide/svelte/icons/users';
	import Calendar from '@lucide/svelte/icons/calendar';
	import AlertTriangle from '@lucide/svelte/icons/alert-triangle';
	import CheckCircle from '@lucide/svelte/icons/check-circle';
	import FileText from '@lucide/svelte/icons/file-text';
	import StickyNote from '@lucide/svelte/icons/sticky-note';
	import ClipboardCheck from '@lucide/svelte/icons/clipboard-check';

	const i18n = getContext<I18nRune>('i18n');

	let statusDistribution = $state({
		planned: 0,
		in_progress: 0,
		completed: 0,
		overdue: 0
	});

	let stats = $state({
		totalAudits: 0,
		totalAuditors: 0,
		upcomingAudits: 0,
		overdueActions: 0,
		openActions: 0,
		completedAudits: 0,
		savedPlans: 0,
		savedNotes: 0
	});

	let upcomingAudits: { id: string; name: string; date: string; status: string }[] = $state([]);
	let criticalActions: { id: string; title: string; dueDate: string; priority: string }[] = $state([]);

	const statusCards = $derived([
		{
			key: 'planned' as const,
			borderColor: 'border-l-blue-500',
			bgColor: 'bg-blue-50 dark:bg-blue-950/30',
			textColor: 'text-blue-700 dark:text-blue-300'
		},
		{
			key: 'in_progress' as const,
			borderColor: 'border-l-amber-500',
			bgColor: 'bg-amber-50 dark:bg-amber-950/30',
			textColor: 'text-amber-700 dark:text-amber-300'
		},
		{
			key: 'completed' as const,
			borderColor: 'border-l-emerald-500',
			bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
			textColor: 'text-emerald-700 dark:text-emerald-300'
		},
		{
			key: 'overdue' as const,
			borderColor: 'border-l-red-500',
			bgColor: 'bg-red-50 dark:bg-red-950/30',
			textColor: 'text-red-700 dark:text-red-300'
		}
	]);

	const statCards = $derived([
		{
			label: i18n.t('dashboard.totalAudits'),
			value: stats.totalAudits,
			icon: BarChart3,
			href: '/audits'
		},
		{
			label: i18n.t('dashboard.totalAuditors'),
			value: stats.totalAuditors,
			icon: Users,
			href: '/auditors'
		},
		{
			label: i18n.t('dashboard.upcomingAudits'),
			value: stats.upcomingAudits,
			icon: Calendar,
			href: '/audits'
		},
		{
			label: i18n.t('dashboard.overdueActions'),
			value: stats.overdueActions,
			icon: AlertTriangle,
			href: '/actions'
		},
		{
			label: i18n.t('dashboard.openActions'),
			value: stats.openActions,
			icon: ClipboardCheck,
			href: '/actions'
		},
		{
			label: i18n.t('dashboard.completedAudits'),
			value: stats.completedAudits,
			icon: CheckCircle,
			href: '/audits'
		},
		{
			label: i18n.t('dashboard.savedPlans'),
			value: stats.savedPlans,
			icon: FileText,
			href: '/overview'
		},
		{
			label: i18n.t('dashboard.savedNotes'),
			value: stats.savedNotes,
			icon: StickyNote,
			href: '/overview'
		}
	]);
</script>

<div class="space-y-8">
	<h1 class="text-2xl font-bold" style="font-family: var(--font-display)">
		{i18n.t('dashboard.title')}
	</h1>

	<!-- Status Distribution Cards -->
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
		{#each statusCards as card}
			<Card.Root class="border-l-4 {card.borderColor}">
				<Card.Header class="pb-2">
					<Card.Title class="text-muted-foreground text-sm font-medium">
						{i18n.t(`status.${card.key}`)}
					</Card.Title>
				</Card.Header>
				<Card.Content>
					<div class="flex items-center gap-2">
						<span class="text-3xl font-bold {card.textColor}">
							{statusDistribution[card.key]}
						</span>
						<Badge variant="secondary" class={card.bgColor}>
							{i18n.t(`status.${card.key}`)}
						</Badge>
					</div>
				</Card.Content>
			</Card.Root>
		{/each}
	</div>

	<!-- Statistic Cards -->
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
		{#each statCards as card}
			<a href={card.href} class="group block">
				<Card.Root class="group-hover:ring-border transition-shadow duration-200 group-hover:shadow-md group-hover:ring-1">
					<Card.Header class="flex flex-row items-center justify-between pb-2">
						<Card.Title class="text-muted-foreground text-sm font-medium">
							{card.label}
						</Card.Title>
						<card.icon class="text-muted-foreground h-5 w-5" />
					</Card.Header>
					<Card.Content>
						<span class="text-3xl font-bold">{card.value}</span>
					</Card.Content>
				</Card.Root>
			</a>
		{/each}
	</div>

	<!-- Bottom sections -->
	<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
		<!-- Upcoming Audits -->
		<Card.Root>
			<Card.Header>
				<Card.Title class="flex items-center gap-2">
					<Calendar class="text-muted-foreground h-5 w-5" />
					{i18n.t('dashboard.upcomingAuditsSection')}
				</Card.Title>
			</Card.Header>
			<Card.Content>
				{#if upcomingAudits.length === 0}
					<p class="text-muted-foreground text-sm">
						{i18n.t('dashboard.noUpcomingAudits')}
					</p>
				{:else}
					<div class="space-y-3">
						{#each upcomingAudits as audit}
							<div class="flex items-center justify-between rounded-md border p-3">
								<div>
									<p class="font-medium">{audit.name}</p>
									<p class="text-muted-foreground text-sm">{audit.date}</p>
								</div>
								<Badge variant="outline">{i18n.t(`status.${audit.status}`)}</Badge>
							</div>
						{/each}
					</div>
				{/if}
			</Card.Content>
		</Card.Root>

		<!-- Critical Actions -->
		<Card.Root>
			<Card.Header>
				<Card.Title class="flex items-center gap-2">
					<AlertTriangle class="text-destructive h-5 w-5" />
					{i18n.t('dashboard.criticalActions')}
				</Card.Title>
			</Card.Header>
			<Card.Content>
				{#if criticalActions.length === 0}
					<p class="text-muted-foreground text-sm">
						{i18n.t('dashboard.noCriticalActions')}
					</p>
				{:else}
					<div class="space-y-3">
						{#each criticalActions as action}
							<div class="border-destructive/20 bg-destructive/5 flex items-center justify-between rounded-md border p-3">
								<div>
									<p class="font-medium">{action.title}</p>
									<p class="text-muted-foreground text-sm">
										{action.dueDate}
									</p>
								</div>
								<Badge variant="destructive">{action.priority}</Badge>
							</div>
						{/each}
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
	</div>
</div>
