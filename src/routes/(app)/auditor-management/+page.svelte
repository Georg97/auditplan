<script lang="ts">
	import { getContext } from 'svelte';
	import type { I18nRune } from '$lib/i18n/i18n.svelte';
	import type { Auditor } from '$lib/types/auditor';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Badge } from '$lib/components/ui/badge';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { toast } from 'svelte-sonner';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import UserPlus from '@lucide/svelte/icons/user-plus';
	import Search from '@lucide/svelte/icons/search';
	import { getAuditors } from '$lib/rpc/auditors.remote';
	import { deleteAuditor } from '$lib/rpc/auditors.remote';

	const i18n = getContext<I18nRune>('i18n');

	let auditors = $state<Auditor[]>([]);
	let searchQuery = $state('');
	let auditorToDelete = $state<Auditor | null>(null);

	let filteredAuditors = $derived(
		searchQuery
			? auditors.filter(
					(a) =>
						a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
						(a.company?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
						a.email.toLowerCase().includes(searchQuery.toLowerCase())
				)
			: auditors
	);

	const isoNorms = [
		{ key: 'iso9001' as const, label: 'ISO 9001' },
		{ key: 'iso14001' as const, label: 'ISO 14001' },
		{ key: 'iso45001' as const, label: 'ISO 45001' },
		{ key: 'iso50001' as const, label: 'ISO 50001' },
		{ key: 'iso27001' as const, label: 'ISO 27001' }
	];

	async function loadAuditors() {
		try {
			auditors = await getAuditors();
		} catch {
			auditors = [];
		}
	}

	async function handleDelete() {
		if (!auditorToDelete) return;
		try {
			await deleteAuditor(auditorToDelete.id);
			auditors = auditors.filter((a) => a.id !== auditorToDelete!.id);
			toast.success(i18n.t('auditor.deleted'));
		} catch {
			toast.error(i18n.t('auditor.deleteError'));
		} finally {
			auditorToDelete = null;
		}
	}

	$effect(() => {
		loadAuditors();
	});
</script>

<h1 class="text-2xl font-bold" style="font-family: var(--font-display)">
	{i18n.t('nav.auditorManagement')}
</h1>

<div class="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
	<div class="relative w-full sm:max-w-sm">
		<Search class="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
		<Input type="text" placeholder={i18n.t('auditor.searchPlaceholder')} class="pl-9" bind:value={searchQuery} />
	</div>
	<Button href="/add-auditor">
		<UserPlus class="mr-2 h-4 w-4" />
		{i18n.t('auditor.add')}
	</Button>
</div>

{#if filteredAuditors.length === 0}
	<div class="mt-12 flex flex-col items-center justify-center gap-4 text-center">
		<p class="text-muted-foreground text-lg">
			{#if searchQuery}
				{i18n.t('auditor.noSearchResults')}
			{:else}
				{i18n.t('auditor.noAuditors')}
			{/if}
		</p>
		{#if !searchQuery}
			<Button href="/add-auditor">
				<UserPlus class="mr-2 h-4 w-4" />
				{i18n.t('auditor.add')}
			</Button>
		{/if}
	</div>
{:else}
	<div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
		{#each filteredAuditors as auditor (auditor.id)}
			<Card.Root>
				<Card.Header>
					<Card.Title class="flex items-start justify-between">
						<div>
							<span class="text-lg font-bold">{auditor.name}</span>
							{#if auditor.title}
								<span class="text-muted-foreground ml-2 text-sm font-normal">
									{auditor.title}
								</span>
							{/if}
						</div>
					</Card.Title>
				</Card.Header>
				<Card.Content class="space-y-3">
					<div class="space-y-1 text-sm">
						<p class="text-muted-foreground truncate">{auditor.email}</p>
						{#if auditor.phone}
							<p class="text-muted-foreground">{auditor.phone}</p>
						{/if}
						{#if auditor.company}
							<p class="font-medium">{auditor.company}</p>
						{/if}
					</div>

					{#if isoNorms.some((n) => auditor[n.key])}
						<div class="flex flex-wrap gap-1.5">
							{#each isoNorms as norm}
								{#if auditor[norm.key]}
									<Badge variant="secondary" class="text-xs">
										{norm.label}
									</Badge>
								{/if}
							{/each}
						</div>
					{/if}

					{#if auditor.experienceYears != null}
						<p class="text-muted-foreground text-sm">
							{i18n.t('auditor.experienceYears')}: {auditor.experienceYears}
						</p>
					{/if}
				</Card.Content>
				<Card.Footer class="flex justify-end gap-2">
					<Button variant="outline" size="sm" href="/add-auditor?edit={auditor.id}">
						<Pencil class="mr-1 h-3.5 w-3.5" />
						{i18n.t('common.edit')}
					</Button>
					<Button variant="destructive" size="sm" onclick={() => (auditorToDelete = auditor)}>
						<Trash2 class="mr-1 h-3.5 w-3.5" />
						{i18n.t('common.delete')}
					</Button>
				</Card.Footer>
			</Card.Root>
		{/each}
	</div>
{/if}

<AlertDialog.Root open={auditorToDelete !== null}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>{i18n.t('auditor.deleteTitle')}</AlertDialog.Title>
			<AlertDialog.Description>
				{i18n.t('auditor.deleteConfirmation', { name: auditorToDelete?.name ?? '' })}
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel onclick={() => (auditorToDelete = null)}>
				{i18n.t('common.cancel')}
			</AlertDialog.Cancel>
			<AlertDialog.Action onclick={handleDelete}>
				{i18n.t('common.delete')}
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
