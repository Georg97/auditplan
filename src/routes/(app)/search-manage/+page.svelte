<script lang="ts">
	import { getContext } from 'svelte';
	import type { I18nRune } from '$lib/i18n/i18n.svelte';
	import type { Audit } from '$lib/types';
	import { getAudits, deleteAudit } from '$lib/rpc/audits.remote';
	import * as Card from '$lib/components/ui/card';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { toast } from 'svelte-sonner';
	import Search from '@lucide/svelte/icons/search';
	import Plus from '@lucide/svelte/icons/plus';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Paperclip from '@lucide/svelte/icons/paperclip';
	import Building2 from '@lucide/svelte/icons/building-2';
	import CalendarDays from '@lucide/svelte/icons/calendar-days';
	import ClipboardList from '@lucide/svelte/icons/clipboard-list';

	const i18n = getContext<I18nRune>('i18n');

	let audits = $state<Audit[]>([]);
	let searchQuery = $state('');
	let loading = $state(true);
	let deleteTarget = $state<Audit | null>(null);
	let deleteDialogOpen = $state(false);

	let debounceTimer: ReturnType<typeof setTimeout>;
	let debouncedQuery = $state('');

	function handleSearchInput(e: Event) {
		const value = (e.target as HTMLInputElement).value;
		searchQuery = value;
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			debouncedQuery = value;
		}, 300);
	}

	let filteredAudits = $derived.by(() => {
		if (!debouncedQuery) return audits;
		const q = debouncedQuery.toLowerCase();
		return audits.filter(
			(a) => a.auditName.toLowerCase().includes(q) || a.company.toLowerCase().includes(q) || a.department.toLowerCase().includes(q) || a.status.toLowerCase().includes(q)
		);
	});

	$effect(() => {
		loadAudits();
	});

	async function loadAudits() {
		loading = true;
		try {
			audits = await getAudits();
		} catch {
			audits = [];
		} finally {
			loading = false;
		}
	}

	function confirmDelete(audit: Audit) {
		deleteTarget = audit;
		deleteDialogOpen = true;
	}

	async function handleDelete() {
		if (!deleteTarget) return;
		try {
			await deleteAudit(deleteTarget.id);
			audits = audits.filter((a) => a.id !== deleteTarget!.id);
			toast.success(i18n.t('audit.deleteSuccess'));
		} catch {
			toast.error('Fehler beim Löschen');
		} finally {
			deleteDialogOpen = false;
			deleteTarget = null;
		}
	}

	const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
		planned: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-300' },
		in_progress: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-300' },
		completed: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-300' },
		cancelled: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-300' }
	};

	function statusStyle(status: string) {
		return STATUS_STYLES[status] ?? STATUS_STYLES.planned;
	}
</script>

<div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
	<!-- Header -->
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-foreground text-2xl font-bold" style="font-family: var(--font-display)">
			{i18n.t('audit.title')}
		</h1>
		<Button href="/search-manage/new" class="gap-2">
			<Plus class="h-4 w-4" />
			{i18n.t('audit.newAudit')}
		</Button>
	</div>

	<!-- Search Bar -->
	<div class="relative mb-8 max-w-xl">
		<Search class="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
		<input
			type="text"
			value={searchQuery}
			oninput={handleSearchInput}
			placeholder={i18n.t('audit.searchPlaceholder')}
			class="border-input bg-background focus:border-brand focus:ring-brand/20 h-11 w-full rounded-full border-2 py-2 pr-4 pl-10 text-sm transition-colors outline-none focus:ring-3"
		/>
	</div>

	<!-- Loading Skeletons -->
	{#if loading}
		<div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
			{#each Array(6) as _, idx (idx)}
				<Card.Root class="overflow-hidden">
					<Card.Header>
						<div class="flex items-center justify-between">
							<Skeleton class="h-5 w-3/5" />
							<Skeleton class="h-5 w-16 rounded-full" />
						</div>
					</Card.Header>
					<Card.Content class="space-y-2">
						<Skeleton class="h-4 w-full" />
						<Skeleton class="h-4 w-2/3" />
						<Skeleton class="h-4 w-3/4" />
					</Card.Content>
				</Card.Root>
			{/each}
		</div>

		<!-- Empty State -->
	{:else if filteredAudits.length === 0 && !debouncedQuery}
		<div class="flex flex-col items-center justify-center py-20">
			<div class="bg-muted mb-6 flex h-20 w-20 items-center justify-center rounded-full">
				<ClipboardList class="text-muted-foreground h-10 w-10" />
			</div>
			<p class="text-foreground mb-1 text-lg font-semibold" style="font-family: var(--font-display)">
				{i18n.t('audit.emptyState')}
			</p>
			<p class="text-muted-foreground mb-6 text-sm">{i18n.t('audit.emptyStateAction')}</p>
			<Button href="/search-manage/new" class="gap-2">
				<Plus class="h-4 w-4" />
				{i18n.t('audit.newAudit')}
			</Button>
		</div>

		<!-- No Search Results -->
	{:else if filteredAudits.length === 0}
		<div class="flex flex-col items-center justify-center py-20">
			<Search class="text-muted-foreground mb-4 h-10 w-10" />
			<p class="text-muted-foreground text-sm">{i18n.t('common.noResults')}</p>
		</div>

		<!-- Audit Grid -->
	{:else}
		<div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
			{#each filteredAudits as audit (audit.id)}
				{@const style = statusStyle(audit.status)}
				<Card.Root class="group overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
					<Card.Header class="pb-3">
						<div class="flex items-start justify-between gap-2">
							<Card.Title class="text-foreground text-base leading-snug" style="font-family: var(--font-display)">
								{audit.auditName}
							</Card.Title>
							<Badge class="{style.bg} {style.text} shrink-0 border-0 text-[0.65rem] font-semibold">
								{i18n.t(`audit.status.${audit.status}`)}
							</Badge>
						</div>
						<Card.Description class="mt-0.5 text-xs">
							{i18n.t(`audit.type.${audit.auditType}`)}
						</Card.Description>
					</Card.Header>

					<Card.Content class="space-y-2 pb-3">
						<div class="text-muted-foreground space-y-1.5 text-sm">
							<div class="flex items-center gap-2">
								<Building2 class="h-3.5 w-3.5 flex-shrink-0" />
								<span class="truncate">{audit.company} · {audit.department}</span>
							</div>
							<div class="flex items-center gap-2">
								<CalendarDays class="h-3.5 w-3.5 flex-shrink-0" />
								<span>
									{audit.startDate}
									{#if audit.endDate}– {audit.endDate}{/if}
								</span>
							</div>
						</div>
					</Card.Content>

					<Card.Footer class="gap-2 border-t pt-3">
						<Button variant="outline" size="sm" href="/search-manage/edit?id={audit.id}" class="gap-1.5">
							<Pencil class="h-3.5 w-3.5" />
							{i18n.t('common.edit')}
						</Button>
						<Button variant="outline" size="sm" class="gap-1.5" disabled>
							<Paperclip class="h-3.5 w-3.5" />
							{i18n.t('audit.files')}
						</Button>
						<Button variant="outline" size="sm" class="text-destructive hover:bg-destructive hover:text-destructive-foreground gap-1.5" onclick={() => confirmDelete(audit)}>
							<Trash2 class="h-3.5 w-3.5" />
						</Button>
					</Card.Footer>
				</Card.Root>
			{/each}
		</div>
	{/if}
</div>

<!-- Delete Confirmation Dialog -->
<AlertDialog.Root bind:open={deleteDialogOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>{i18n.t('audit.deleteConfirmTitle')}</AlertDialog.Title>
			<AlertDialog.Description>
				{#if deleteTarget}
					{i18n.t('audit.deleteConfirmDescription', { name: deleteTarget.auditName })}
				{/if}
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>{i18n.t('common.cancel')}</AlertDialog.Cancel>
			<AlertDialog.Action class="bg-destructive text-destructive-foreground hover:bg-destructive/90" onclick={handleDelete}>
				{i18n.t('common.delete')}
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
