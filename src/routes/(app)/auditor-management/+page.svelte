<script lang="ts">
	import { getContext } from 'svelte';
	import type { I18nRune } from '$lib/i18n/i18n.svelte';
	import type { Auditor } from '$lib/types';
	import { getAuditors, deleteAuditor } from '$lib/rpc/auditors.remote';
	import * as Card from '$lib/components/ui/card';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Button } from '$lib/components/ui/button';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { toast } from 'svelte-sonner';
	import Search from '@lucide/svelte/icons/search';
	import UserPlus from '@lucide/svelte/icons/user-plus';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Mail from '@lucide/svelte/icons/mail';
	import Phone from '@lucide/svelte/icons/phone';
	import Building2 from '@lucide/svelte/icons/building-2';
	import UserCircle from '@lucide/svelte/icons/user-circle';

	const i18n = getContext<I18nRune>('i18n');

	let auditors = $state<Auditor[]>([]);
	let searchQuery = $state('');
	let loading = $state(true);
	let deleteTarget = $state<Auditor | null>(null);
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

	let filteredAuditors = $derived.by(() => {
		if (!debouncedQuery) return auditors;
		const q = debouncedQuery.toLowerCase();
		return auditors.filter(
			(a) =>
				`${a.firstName} ${a.lastName}`.toLowerCase().includes(q) ||
				a.company?.toLowerCase().includes(q) ||
				a.role?.toLowerCase().includes(q) ||
				(a.iso9001 && 'iso 9001 qualität'.includes(q)) ||
				(a.iso14001 && 'iso 14001 umwelt'.includes(q)) ||
				(a.iso45001 && 'iso 45001 arbeitsschutz'.includes(q)) ||
				(a.iso27001 && 'iso 27001 informationssicherheit'.includes(q)) ||
				(a.iso50001 && 'iso 50001 energie'.includes(q))
		);
	});

	$effect(() => {
		loadAuditors();
	});

	async function loadAuditors() {
		loading = true;
		try {
			auditors = await getAuditors();
		} catch {
			auditors = [];
		} finally {
			loading = false;
		}
	}

	function confirmDelete(auditor: Auditor) {
		deleteTarget = auditor;
		deleteDialogOpen = true;
	}

	async function handleDelete() {
		if (!deleteTarget) return;
		try {
			await deleteAuditor(deleteTarget.id);
			auditors = auditors.filter((a) => a.id !== deleteTarget!.id);
			toast.success(i18n.t('auditor.deleteSuccess'));
		} catch {
			toast.error('Fehler beim Löschen');
		} finally {
			deleteDialogOpen = false;
			deleteTarget = null;
		}
	}

	const ISO_BADGES = [
		{ key: 'iso9001' as const, label: '9001', color: 'bg-[#667eea]' },
		{ key: 'iso14001' as const, label: '14001', color: 'bg-[#38a169]' },
		{ key: 'iso45001' as const, label: '45001', color: 'bg-[#dd6b20]' },
		{ key: 'iso50001' as const, label: '50001', color: 'bg-[#3182ce]' },
		{ key: 'iso27001' as const, label: '27001', color: 'bg-[#e53e3e]' }
	] as const;
</script>

<div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
	<!-- Page Title + Add Button -->
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-foreground text-2xl font-bold" style="font-family: var(--font-display)">
			{i18n.t('auditor.title')}
		</h1>
		<Button href="/add-auditor" class="gap-2">
			<UserPlus class="h-4 w-4" />
			{i18n.t('auditor.addFirstAuditor')}
		</Button>
	</div>

	<!-- Search Bar -->
	<div class="relative mb-8 max-w-lg">
		<Search class="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
		<input
			type="text"
			value={searchQuery}
			oninput={handleSearchInput}
			placeholder={i18n.t('auditor.searchPlaceholder')}
			class="border-input bg-background focus:border-brand focus:ring-brand/20 h-11 w-full rounded-full border-2 py-2 pr-4 pl-10 text-sm transition-colors outline-none focus:ring-3"
		/>
	</div>

	<!-- Loading Skeletons -->
	{#if loading}
		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{#each Array(6) as _, idx (idx)}
				<Card.Root class="overflow-hidden">
					<Card.Header>
						<Skeleton class="h-6 w-3/4" />
						<Skeleton class="mt-1 h-4 w-1/2" />
					</Card.Header>
					<Card.Content class="space-y-3">
						<Skeleton class="h-4 w-full" />
						<Skeleton class="h-4 w-2/3" />
						<Skeleton class="h-4 w-3/4" />
						<div class="flex gap-2 pt-2">
							<Skeleton class="h-5 w-12 rounded-full" />
							<Skeleton class="h-5 w-12 rounded-full" />
						</div>
					</Card.Content>
				</Card.Root>
			{/each}
		</div>

		<!-- Empty State -->
	{:else if filteredAuditors.length === 0 && !debouncedQuery}
		<div class="flex flex-col items-center justify-center py-20">
			<div class="bg-muted mb-6 flex h-20 w-20 items-center justify-center rounded-full">
				<UserCircle class="text-muted-foreground h-10 w-10" />
			</div>
			<p class="text-foreground mb-1 text-lg font-semibold" style="font-family: var(--font-display)">
				{i18n.t('auditor.emptyState')}
			</p>
			<p class="text-muted-foreground mb-6 text-sm">{i18n.t('auditor.emptyStateAction')}</p>
			<Button href="/add-auditor" class="gap-2">
				<UserPlus class="h-4 w-4" />
				{i18n.t('auditor.addFirstAuditor')}
			</Button>
		</div>

		<!-- No Search Results -->
	{:else if filteredAuditors.length === 0}
		<div class="flex flex-col items-center justify-center py-20">
			<Search class="text-muted-foreground mb-4 h-10 w-10" />
			<p class="text-muted-foreground text-sm">{i18n.t('common.noResults')}</p>
		</div>

		<!-- Auditor Grid -->
	{:else}
		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{#each filteredAuditors as auditor (auditor.id)}
				<Card.Root class="group overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
					<Card.Header class="pb-3">
						<div class="flex items-start justify-between">
							<div>
								<Card.Title class="text-foreground text-lg" style="font-family: var(--font-display)">
									{auditor.firstName}
									{auditor.lastName}
								</Card.Title>
								{#if auditor.role}
									<Card.Description class="mt-0.5">{auditor.role}</Card.Description>
								{/if}
							</div>
							{#if auditor.isExternal}
								<span class="bg-accent-mid/10 text-accent-mid rounded-full px-2 py-0.5 text-[0.7rem] font-medium"> Extern </span>
							{/if}
						</div>
					</Card.Header>

					<Card.Content class="space-y-3 pb-3">
						<!-- Contact Info -->
						<div class="text-muted-foreground space-y-1.5 text-sm">
							<div class="flex items-center gap-2">
								<Mail class="h-3.5 w-3.5 flex-shrink-0" />
								<span class="truncate">{auditor.email}</span>
							</div>
							{#if auditor.phone}
								<div class="flex items-center gap-2">
									<Phone class="h-3.5 w-3.5 flex-shrink-0" />
									<span>{auditor.phone}</span>
								</div>
							{/if}
							{#if auditor.company}
								<div class="flex items-center gap-2">
									<Building2 class="h-3.5 w-3.5 flex-shrink-0" />
									<span>{auditor.company}</span>
								</div>
							{/if}
						</div>

						<!-- ISO Badges -->
						{#if auditor.iso9001 || auditor.iso14001 || auditor.iso45001 || auditor.iso27001 || auditor.iso50001}
							<div class="flex flex-wrap gap-1.5 pt-1">
								{#each ISO_BADGES as badge (badge.key)}
									{#if auditor[badge.key]}
										<span class="{badge.color} rounded-full px-2 py-0.5 text-[0.65rem] font-semibold text-white">
											ISO {badge.label}
										</span>
									{/if}
								{/each}
							</div>
						{/if}

						<!-- Experience -->
						{#if auditor.experienceYears}
							<p class="text-muted-foreground text-xs">
								{i18n.t('auditor.experience', { years: String(auditor.experienceYears) })}
							</p>
						{/if}
					</Card.Content>

					<Card.Footer class="gap-2 border-t pt-3">
						<Button variant="outline" size="sm" href="/add-auditor?edit={auditor.id}" class="gap-1.5">
							<Pencil class="h-3.5 w-3.5" />
							{i18n.t('common.edit')}
						</Button>
						<Button variant="outline" size="sm" class="text-destructive hover:bg-destructive hover:text-destructive-foreground gap-1.5" onclick={() => confirmDelete(auditor)}>
							<Trash2 class="h-3.5 w-3.5" />
							{i18n.t('common.delete')}
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
			<AlertDialog.Title>{i18n.t('auditor.deleteConfirmTitle')}</AlertDialog.Title>
			<AlertDialog.Description>
				{#if deleteTarget}
					{i18n.t('auditor.deleteConfirmDescription', { name: `${deleteTarget.firstName} ${deleteTarget.lastName}` })}
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
