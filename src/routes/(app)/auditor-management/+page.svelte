<script lang="ts">
	import { getContext } from 'svelte';
	import type { I18nRune } from '$lib/i18n/i18n.svelte';
	import { getAuditors, deleteAuditor } from '$lib/rpc/auditoren.remote';
	import * as Card from '$lib/components/ui/card';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import UserPlus from '@lucide/svelte/icons/user-plus';
	import Search from '@lucide/svelte/icons/search';
	import Users from '@lucide/svelte/icons/users';
	import Mail from '@lucide/svelte/icons/mail';
	import Phone from '@lucide/svelte/icons/phone';
	import Building2 from '@lucide/svelte/icons/building-2';
	import Award from '@lucide/svelte/icons/award';
	import type { Auditor } from '$lib/types/auditor';

	const i18n = getContext<I18nRune>('i18n');

	const ISO_BADGES: { key: keyof Auditor; label: string; color: string }[] = [
		{ key: 'iso9001', label: 'ISO 9001', color: '#667eea' },
		{ key: 'iso14001', label: 'ISO 14001', color: '#38a169' },
		{ key: 'iso45001', label: 'ISO 45001', color: '#dd6b20' },
		{ key: 'iso50001', label: 'ISO 50001', color: '#3182ce' },
		{ key: 'iso27001', label: 'ISO 27001', color: '#e53e3e' }
	];

	let searchQuery = $state('');
	let auditorToDelete = $state<Auditor | null>(null);
	let deleteDialogOpen = $state(false);
	let isDeleting = $state(false);

	// Cache the promise so it doesn't re-fire on every reactive update
	const auditorsPromise = getAuditors();

	function getFilteredAuditors(auditors: Auditor[]): Auditor[] {
		const q = searchQuery.trim().toLowerCase();
		if (!q) return auditors;
		return auditors.filter(
			(a) =>
				a.name.toLowerCase().includes(q) ||
				(a.company?.toLowerCase().includes(q) ?? false) ||
				(a.title?.toLowerCase().includes(q) ?? false) ||
				(a.email?.toLowerCase().includes(q) ?? false)
		);
	}

	function openDeleteDialog(auditor: Auditor) {
		auditorToDelete = auditor;
		deleteDialogOpen = true;
	}

	async function confirmDelete() {
		if (!auditorToDelete) return;
		isDeleting = true;
		try {
			await deleteAuditor(auditorToDelete.id);
			toast.success(i18n.t('auditor.delete_success'));
			deleteDialogOpen = false;
			auditorToDelete = null;
			// Reload the page to refresh the list
			window.location.reload();
		} catch {
			toast.error(i18n.t('common.no_data'));
		} finally {
			isDeleting = false;
		}
	}
</script>

<div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
	<!-- Header -->
	<div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h1 class="text-2xl font-bold" style="font-family: var(--font-display)">
				{i18n.t('nav.auditor_management')}
			</h1>
			<p class="text-muted-foreground mt-1 text-sm">
				{i18n.t('auditor.title_page')}
			</p>
		</div>
		<Button onclick={() => goto('/add-auditor')} class="shrink-0">
			<UserPlus class="mr-2 h-4 w-4" />
			{i18n.t('nav.add_auditor')}
		</Button>
	</div>

	<!-- Search bar -->
	<div class="relative mb-6">
		<Search class="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
		<Input type="search" placeholder={i18n.t('auditor.search_placeholder')} bind:value={searchQuery} class="rounded-full pl-10" />
	</div>

	<!-- Auditor grid -->
	{#await auditorsPromise}
		<div class="text-muted-foreground flex items-center justify-center py-20">
			<span class="text-sm">{i18n.t('common.loading')}</span>
		</div>
	{:then auditors}
		{@const filtered = getFilteredAuditors(auditors as Auditor[])}

		{#if filtered.length === 0}
			<!-- Empty state -->
			<div class="flex flex-col items-center justify-center py-20 text-center">
				<Users class="text-muted-foreground mb-4 h-12 w-12 opacity-40" />
				<p class="text-muted-foreground text-sm font-medium">
					{searchQuery ? i18n.t('common.no_data') : i18n.t('auditor.no_auditors')}
				</p>
				{#if !searchQuery}
					<p class="text-muted-foreground mt-1 text-sm">{i18n.t('auditor.add_first')}</p>
					<Button variant="outline" class="mt-4" onclick={() => goto('/add-auditor')}>
						<UserPlus class="mr-2 h-4 w-4" />
						{i18n.t('nav.add_auditor')}
					</Button>
				{/if}
			</div>
		{:else}
			<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{#each filtered as auditor (auditor.id)}
					<Card.Root class="flex flex-col overflow-hidden transition-shadow hover:shadow-md">
						<Card.Header class="pb-3">
							<div class="flex items-start justify-between gap-2">
								<div class="min-w-0">
									<Card.Title class="truncate text-base font-semibold">
										{auditor.name}
									</Card.Title>
									{#if auditor.title}
										<p class="text-muted-foreground mt-0.5 truncate text-xs">{auditor.title}</p>
									{/if}
								</div>
								<!-- ISO badges -->
								<div class="flex shrink-0 flex-wrap justify-end gap-1">
									{#each ISO_BADGES as badge (badge.key)}
										{#if auditor[badge.key]}
											<span class="inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold text-white" style="background-color: {badge.color}">
												{badge.label}
											</span>
										{/if}
									{/each}
								</div>
							</div>
						</Card.Header>

						<Card.Content class="flex flex-1 flex-col gap-2 pt-0">
							<!-- Email -->
							{#if auditor.email}
								<div class="flex items-center gap-2 text-sm">
									<Mail class="text-muted-foreground h-3.5 w-3.5 shrink-0" />
									<a href="mailto:{auditor.email}" class="text-muted-foreground hover:text-foreground min-w-0 truncate transition-colors">
										{auditor.email}
									</a>
								</div>
							{/if}

							<!-- Phone -->
							{#if auditor.phone || auditor.mobile}
								<div class="flex items-center gap-2 text-sm">
									<Phone class="text-muted-foreground h-3.5 w-3.5 shrink-0" />
									<span class="text-muted-foreground truncate">
										{auditor.phone ?? auditor.mobile}
									</span>
								</div>
							{/if}

							<!-- Company -->
							{#if auditor.company}
								<div class="flex items-center gap-2 text-sm">
									<Building2 class="text-muted-foreground h-3.5 w-3.5 shrink-0" />
									<span class="text-muted-foreground truncate">{auditor.company}</span>
								</div>
							{/if}

							<!-- Experience -->
							{#if auditor.experienceYears != null}
								<div class="flex items-center gap-2 text-sm">
									<Award class="text-muted-foreground h-3.5 w-3.5 shrink-0" />
									<span class="text-muted-foreground">
										{i18n.t('auditor.experience_years', { count: auditor.experienceYears })}
									</span>
								</div>
							{/if}
						</Card.Content>

						<Card.Footer class="flex gap-2 pt-3">
							<Button variant="outline" size="sm" class="flex-1" onclick={() => goto(`/add-auditor?edit=${auditor.id}`)}>
								<Pencil class="mr-1.5 h-3.5 w-3.5" />
								{i18n.t('common.edit')}
							</Button>
							<Button variant="outline" size="sm" class="text-destructive hover:text-destructive flex-1" onclick={() => openDeleteDialog(auditor as Auditor)}>
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
			<AlertDialog.Title>{i18n.t('common.delete')} {auditorToDelete?.name}</AlertDialog.Title>
			<AlertDialog.Description>
				{i18n.t('auditor.delete_confirm', { name: auditorToDelete?.name ?? '' })}
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel
				onclick={() => {
					deleteDialogOpen = false;
					auditorToDelete = null;
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
