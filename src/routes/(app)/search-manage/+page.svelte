<script lang="ts">
	import { getContext } from 'svelte';
	import type { I18nRune } from '$lib/i18n/i18n.svelte';
	import { getAudits, deleteAudit } from '$lib/rpc/audits.remote';
	import * as Card from '$lib/components/ui/card';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import type { Audit, AuditStatus } from '$lib/types/audit';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Plus from '@lucide/svelte/icons/plus';
	import Search from '@lucide/svelte/icons/search';
	import ClipboardList from '@lucide/svelte/icons/clipboard-list';
	import Building2 from '@lucide/svelte/icons/building-2';
	import Users from '@lucide/svelte/icons/users';
	import CalendarDays from '@lucide/svelte/icons/calendar-days';
	import Tag from '@lucide/svelte/icons/tag';

	const i18n = getContext<I18nRune>('i18n');

	type StatusFilter = 'all' | AuditStatus;

	const STATUS_TABS: { key: StatusFilter; label: string }[] = [
		{ key: 'all', label: 'common.all' },
		{ key: 'planned', label: 'status.planned' },
		{ key: 'in_progress', label: 'status.in_progress' },
		{ key: 'completed', label: 'status.completed' }
	];

	const STATUS_BADGE: Record<AuditStatus, { bg: string; text: string }> = {
		planned: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300' },
		in_progress: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300' },
		completed: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300' },
		cancelled: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300' }
	};

	let searchQuery = $state('');
	let activeStatus = $state<StatusFilter>('all');
	let auditToDelete = $state<Audit | null>(null);
	let deleteDialogOpen = $state(false);
	let isDeleting = $state(false);

	const auditsPromise = getAudits();

	function getFilteredAudits(audits: Audit[]): Audit[] {
		const q = searchQuery.trim().toLowerCase();
		return audits.filter((a) => {
			const matchesSearch = !q || a.auditName.toLowerCase().includes(q) || a.unternehmen.toLowerCase().includes(q) || a.abteilung.toLowerCase().includes(q);
			const matchesStatus = activeStatus === 'all' || a.status === activeStatus;
			return matchesSearch && matchesStatus;
		});
	}

	function openDeleteDialog(audit: Audit) {
		auditToDelete = audit;
		deleteDialogOpen = true;
	}

	async function confirmDelete() {
		if (!auditToDelete) return;
		isDeleting = true;
		try {
			await deleteAudit(auditToDelete.id);
			toast.success(i18n.t('audit.delete_success'));
			deleteDialogOpen = false;
			auditToDelete = null;
			window.location.reload();
		} catch {
			toast.error(i18n.t('common.no_data'));
		} finally {
			isDeleting = false;
		}
	}

	function formatDate(dateStr: string | null | undefined): string {
		if (!dateStr) return '—';
		// dateStr is stored as ISO string (YYYY-MM-DD)
		const [year, month, day] = dateStr.split('-');
		if (!year || !month || !day) return dateStr;
		return `${day}.${month}.${year}`;
	}

	function getAuditTypeLabel(typ: string): string {
		const key = `audit.type_${typ}` as const;
		return i18n.t(key);
	}
</script>

<div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
	<!-- Page header -->
	<div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h1 class="text-2xl font-bold" style="font-family: var(--font-display)">
				{i18n.t('audit.title_page')}
			</h1>
			<p class="text-muted-foreground mt-1 text-sm">
				{i18n.t('nav.search_manage')}
			</p>
		</div>
		<Button onclick={() => goto('/plan-generator')} class="shrink-0">
			<Plus class="mr-2 h-4 w-4" />
			{i18n.t('audit.add_title')}
		</Button>
	</div>

	<!-- Search bar -->
	<div class="relative mb-4">
		<Search class="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
		<Input type="search" placeholder={i18n.t('audit.search_placeholder')} bind:value={searchQuery} class="rounded-full pl-10" />
	</div>

	<!-- Status filter tabs -->
	<div class="mb-6 flex flex-wrap gap-2">
		{#each STATUS_TABS as tab (tab.key)}
			<button
				type="button"
				onclick={() => (activeStatus = tab.key)}
				class="rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none
					{activeStatus === tab.key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}"
			>
				{i18n.t(tab.label)}
			</button>
		{/each}
	</div>

	<!-- Audit grid -->
	{#await auditsPromise}
		<div class="text-muted-foreground flex items-center justify-center py-20">
			<span class="text-sm">{i18n.t('common.loading')}</span>
		</div>
	{:then audits}
		{@const filtered = getFilteredAudits(audits as Audit[])}

		{#if filtered.length === 0}
			<div class="flex flex-col items-center justify-center py-20 text-center">
				<ClipboardList class="text-muted-foreground mb-4 h-12 w-12 opacity-40" />
				<p class="text-muted-foreground text-sm font-medium">
					{searchQuery || activeStatus !== 'all' ? i18n.t('common.no_data') : i18n.t('audit.no_audits')}
				</p>
				{#if !searchQuery && activeStatus === 'all'}
					<Button variant="outline" class="mt-4" onclick={() => goto('/plan-generator')}>
						<Plus class="mr-2 h-4 w-4" />
						{i18n.t('audit.add_title')}
					</Button>
				{/if}
			</div>
		{:else}
			<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{#each filtered as audit (audit.id)}
					{@const badge = STATUS_BADGE[audit.status as AuditStatus] ?? STATUS_BADGE.planned}
					<Card.Root class="flex flex-col overflow-hidden transition-shadow hover:shadow-md">
						<Card.Header class="pb-3">
							<div class="flex items-start justify-between gap-2">
								<div class="min-w-0 flex-1">
									<Card.Title class="truncate text-base font-semibold">
										{audit.auditName}
									</Card.Title>
									<div class="mt-1 flex items-center gap-1.5">
										<Tag class="text-muted-foreground h-3 w-3 shrink-0" />
										<span class="text-muted-foreground truncate text-xs">
											{getAuditTypeLabel(audit.auditTyp)}
										</span>
									</div>
								</div>
								<!-- Status badge -->
								<span class="inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-semibold {badge.bg} {badge.text}">
									{i18n.t(`status.${audit.status}`)}
								</span>
							</div>
						</Card.Header>

						<Card.Content class="flex flex-1 flex-col gap-2 pt-0">
							<!-- Company -->
							<div class="flex items-center gap-2 text-sm">
								<Building2 class="text-muted-foreground h-3.5 w-3.5 shrink-0" />
								<span class="text-muted-foreground truncate">{audit.unternehmen}</span>
							</div>

							<!-- Department -->
							<div class="flex items-center gap-2 text-sm">
								<Users class="text-muted-foreground h-3.5 w-3.5 shrink-0" />
								<span class="text-muted-foreground truncate">{audit.abteilung}</span>
							</div>

							<!-- Date range -->
							<div class="flex items-center gap-2 text-sm">
								<CalendarDays class="text-muted-foreground h-3.5 w-3.5 shrink-0" />
								<span class="text-muted-foreground truncate">
									{formatDate(audit.startDatum)}
									{#if audit.endDatum && audit.endDatum !== audit.startDatum}
										– {formatDate(audit.endDatum)}
									{/if}
								</span>
							</div>
						</Card.Content>

						<Card.Footer class="flex gap-2 pt-3">
							<Button
								variant="outline"
								size="sm"
								class="flex-1"
								onclick={() => {
									console.log('Edit audit:', audit.id);
									goto(`/plan-generator?edit=${audit.id}`);
								}}
							>
								<Pencil class="mr-1.5 h-3.5 w-3.5" />
								{i18n.t('common.edit')}
							</Button>
							<Button variant="outline" size="sm" class="text-destructive hover:text-destructive flex-1" onclick={() => openDeleteDialog(audit as Audit)}>
								<Trash2 class="mr-1.5 h-3.5 w-3.5" />
								{i18n.t('common.delete')}
							</Button>
						</Card.Footer>
					</Card.Root>
				{/each}
			</div>
		{/if}
	{:catch error}
		<div class="text-muted-foreground flex flex-col items-center justify-center py-20 text-center">
			<p class="text-sm">{error?.message ?? i18n.t('common.no_data')}</p>
		</div>
	{/await}
</div>

<!-- Delete confirmation dialog -->
<AlertDialog.Root bind:open={deleteDialogOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>{i18n.t('common.delete')} – {auditToDelete?.auditName}</AlertDialog.Title>
			<AlertDialog.Description>
				{i18n.t('audit.delete_confirm', { name: auditToDelete?.auditName ?? '' })}
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel
				onclick={() => {
					deleteDialogOpen = false;
					auditToDelete = null;
				}}
			>
				{i18n.t('common.cancel')}
			</AlertDialog.Cancel>
			<AlertDialog.Action onclick={confirmDelete} disabled={isDeleting}>
				{isDeleting ? i18n.t('common.loading') : i18n.t('common.delete')}
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
