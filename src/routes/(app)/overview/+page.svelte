<script lang="ts">
	import { getContext } from 'svelte';
	import type { I18nRune } from '$lib/i18n/i18n.svelte';
	import type { SavedPlan, SavedNotes, SavedQuestions } from '$lib/types';
	import { getSavedPlans, deletePlan } from '$lib/rpc/plans.remote';
	import { getSavedNotes, deleteNote } from '$lib/rpc/notes.remote';
	import { getSavedQuestions, deleteQuestion } from '$lib/rpc/questions.remote';
	import * as Card from '$lib/components/ui/card';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { toast } from 'svelte-sonner';
	import FileText from '@lucide/svelte/icons/file-text';
	import StickyNote from '@lucide/svelte/icons/sticky-note';
	import ClipboardList from '@lucide/svelte/icons/clipboard-list';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Download from '@lucide/svelte/icons/download';
	import FileDown from '@lucide/svelte/icons/file-down';
	import type { Component } from 'svelte';

	const i18n = getContext<I18nRune>('i18n');

	let loading = $state(true);
	let documents = $state<SavedQuestions[]>([]);
	let notes = $state<SavedNotes[]>([]);
	let plans = $state<SavedPlan[]>([]);
	let deleteDialogOpen = $state(false);
	let deleteTarget = $state<{ id: string; name: string; type: 'document' | 'note' | 'plan' } | null>(null);

	$effect(() => {
		loadAll();
	});

	async function loadAll() {
		loading = true;
		try {
			const [d, n, p] = await Promise.all([getSavedQuestions(), getSavedNotes(), getSavedPlans()]);
			documents = d;
			notes = n;
			plans = p;
		} catch {
			documents = [];
			notes = [];
			plans = [];
		} finally {
			loading = false;
		}
	}

	function confirmDelete(id: string, name: string, type: 'document' | 'note' | 'plan') {
		deleteTarget = { id, name, type };
		deleteDialogOpen = true;
	}

	async function handleDelete() {
		if (!deleteTarget) return;
		try {
			if (deleteTarget.type === 'document') {
				await deleteQuestion(deleteTarget.id);
				documents = documents.filter((d) => d.id !== deleteTarget!.id);
			} else if (deleteTarget.type === 'note') {
				await deleteNote(deleteTarget.id);
				notes = notes.filter((n) => n.id !== deleteTarget!.id);
			} else {
				await deletePlan(deleteTarget.id);
				plans = plans.filter((p) => p.id !== deleteTarget!.id);
			}
			toast.success(i18n.t('overview.deleteSuccess'));
		} catch {
			toast.error('Fehler beim Löschen');
		} finally {
			deleteDialogOpen = false;
			deleteTarget = null;
		}
	}

	function formatDate(date: Date): string {
		return new Date(date).toLocaleDateString('de-DE', {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		});
	}

	interface SectionConfig {
		title: string;
		icon: Component;
		items: { id: string; name: string; createdAt: Date; updatedAt: Date }[];
		emptyKey: string;
		editBase: string;
		deleteType: 'document' | 'note' | 'plan';
		accentClass: string;
		iconBgClass: string;
	}

	let sections = $derived.by((): SectionConfig[] => [
		{
			title: 'overview.savedQuestions',
			icon: FileText,
			items: documents,
			emptyKey: 'overview.emptyDocuments',
			editBase: '/audit-questions?edit=',
			deleteType: 'document',
			accentClass: 'border-l-blue-500',
			iconBgClass: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
		},
		{
			title: 'overview.savedNotes',
			icon: StickyNote,
			items: notes,
			emptyKey: 'overview.emptyNotes',
			editBase: '/notes-generator?edit=',
			deleteType: 'note',
			accentClass: 'border-l-amber-500',
			iconBgClass: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
		},
		{
			title: 'overview.savedPlans',
			icon: ClipboardList,
			items: plans,
			emptyKey: 'overview.emptyPlans',
			editBase: '/plan-generator?edit=',
			deleteType: 'plan',
			accentClass: 'border-l-emerald-500',
			iconBgClass: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
		}
	]);
</script>

<div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
	<h1 class="text-foreground animate-fade-up mb-8 text-2xl font-bold tracking-tight" style="font-family: var(--font-display)">
		{i18n.t('overview.title')}
	</h1>

	{#if loading}
		<div class="space-y-6">
			{#each Array(3) as _, i (i)}
				<Card.Root>
					<Card.Header>
						<Skeleton class="h-6 w-48" />
					</Card.Header>
					<Card.Content class="space-y-3">
						{#each Array(3) as _, j (j)}
							<Skeleton class="h-12 w-full rounded-lg" />
						{/each}
					</Card.Content>
				</Card.Root>
			{/each}
		</div>
	{:else}
		<div class="space-y-6">
			{#each sections as section, sIdx (section.title)}
				<Card.Root class="animate-fade-up border-l-4 {section.accentClass}" style="animation-delay: {sIdx * 100}ms">
					<Card.Header class="pb-3">
						<div class="flex items-center gap-3">
							<div class="flex h-9 w-9 items-center justify-center rounded-lg {section.iconBgClass}">
								<section.icon class="h-4.5 w-4.5" />
							</div>
							<Card.Title class="text-foreground text-lg" style="font-family: var(--font-display)">
								{i18n.t(section.title)}
							</Card.Title>
						</div>
					</Card.Header>
					<Card.Content>
						{#if section.items.length === 0}
							<div class="flex flex-col items-center py-8">
								<section.icon class="text-muted-foreground mb-3 h-8 w-8 opacity-40" />
								<p class="text-muted-foreground text-sm">{i18n.t(section.emptyKey)}</p>
							</div>
						{:else}
							<div class="max-h-[400px] overflow-y-auto">
								<div class="divide-border divide-y">
									{#each section.items as item (item.id)}
										<div class="hover:bg-muted/50 flex items-center justify-between gap-4 rounded-lg px-3 py-3 transition-colors">
											<!-- Left: Name + Date -->
											<div class="min-w-0 flex-1">
												<p class="text-foreground truncate text-sm font-semibold" style="font-family: var(--font-display)">{item.name}</p>
												<p class="text-muted-foreground mt-0.5 text-xs">{formatDate(item.updatedAt)}</p>
											</div>

											<!-- Right: Action buttons -->
											<div class="flex shrink-0 items-center gap-1.5">
												<Button variant="outline" size="sm" href="{section.editBase}{item.id}" class="h-8 gap-1.5 px-2.5">
													<Pencil class="h-3.5 w-3.5" />
													<span class="hidden sm:inline">{i18n.t('common.edit')}</span>
												</Button>

												<Button
													variant="outline"
													size="sm"
													class="text-destructive hover:bg-destructive hover:text-destructive-foreground h-8 px-2"
													onclick={() => confirmDelete(item.id, item.name, section.deleteType)}
												>
													<Trash2 class="h-3.5 w-3.5" />
												</Button>

												<DropdownMenu.Root>
													<DropdownMenu.Trigger>
														{#snippet child({ props })}
															<Button variant="outline" size="sm" class="h-8 gap-1.5 px-2.5" {...props}>
																<Download class="h-3.5 w-3.5" />
															</Button>
														{/snippet}
													</DropdownMenu.Trigger>
													<DropdownMenu.Content align="end">
														<DropdownMenu.Item class="gap-2">
															<FileDown class="h-4 w-4" />
															{i18n.t('overview.downloadWord')}
														</DropdownMenu.Item>
														<DropdownMenu.Item class="gap-2">
															<FileDown class="h-4 w-4" />
															{i18n.t('overview.downloadPdf')}
														</DropdownMenu.Item>
													</DropdownMenu.Content>
												</DropdownMenu.Root>
											</div>
										</div>
									{/each}
								</div>
							</div>
						{/if}
					</Card.Content>
				</Card.Root>
			{/each}
		</div>
	{/if}
</div>

<!-- Delete Confirmation Dialog -->
<AlertDialog.Root bind:open={deleteDialogOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>{i18n.t('overview.deleteConfirmTitle')}</AlertDialog.Title>
			<AlertDialog.Description>
				{#if deleteTarget}
					{i18n.t('overview.deleteConfirmDescription', { name: deleteTarget.name })}
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
