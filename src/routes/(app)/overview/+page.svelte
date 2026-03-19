<script lang="ts">
	import { getContext } from 'svelte';
	import type { I18nRune } from '$lib/i18n/i18n.svelte';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Download from '@lucide/svelte/icons/download';
	import FileText from '@lucide/svelte/icons/file-text';
	import StickyNote from '@lucide/svelte/icons/sticky-note';
	import HelpCircle from '@lucide/svelte/icons/help-circle';

	const i18n = getContext<I18nRune>('i18n');

	interface SavedItem {
		id: string;
		name: string;
		date: string;
	}

	let savedPlans: SavedItem[] = $state([]);
	let savedNotes: SavedItem[] = $state([]);
	let savedQuestions: SavedItem[] = $state([]);

	const sections = $derived([
		{
			titleKey: 'overview.savedPlans',
			emptyKey: 'overview.noSavedPlans',
			icon: FileText,
			items: savedPlans,
			editHref: '/auditplan-generator',
			downloadHref: '/api/export/auditplan'
		},
		{
			titleKey: 'overview.savedNotes',
			emptyKey: 'overview.noSavedNotes',
			icon: StickyNote,
			items: savedNotes,
			editHref: '/notizen-generator',
			downloadHref: '/api/export/notes'
		},
		{
			titleKey: 'overview.savedQuestions',
			emptyKey: 'overview.noSavedQuestions',
			icon: HelpCircle,
			items: savedQuestions,
			editHref: '/auditfragen',
			downloadHref: '/api/export/questions'
		}
	]);

	function handleDelete(_sectionIndex: number, _itemId: string) {
		// TODO: implement delete via remote mutation
	}
</script>

<div class="space-y-8">
	<h1 class="text-2xl font-bold" style="font-family: var(--font-display)">
		{i18n.t('nav.overview')}
	</h1>

	{#each sections as section, sectionIndex}
		<Card.Root>
			<Card.Header>
				<Card.Title class="flex items-center gap-2">
					<section.icon class="text-muted-foreground h-5 w-5" />
					{i18n.t(section.titleKey)}
				</Card.Title>
			</Card.Header>
			<Card.Content>
				{#if section.items.length === 0}
					<p class="text-muted-foreground text-sm">
						{i18n.t(section.emptyKey)}
					</p>
				{:else}
					<div class="space-y-2">
						{#each section.items as item}
							<div class="hover:bg-muted/50 flex items-center justify-between rounded-md border p-3 transition-colors">
								<div class="min-w-0 flex-1">
									<p class="truncate font-medium">{item.name}</p>
									<p class="text-muted-foreground text-sm">{item.date}</p>
								</div>
								<div class="flex items-center gap-1">
									<Button variant="ghost" size="icon" href="{section.editHref}?id={item.id}">
										<Pencil class="h-4 w-4" />
										<span class="sr-only">{i18n.t('actions.edit')}</span>
									</Button>
									<Button variant="ghost" size="icon" onclick={() => handleDelete(sectionIndex, item.id)}>
										<Trash2 class="text-destructive h-4 w-4" />
										<span class="sr-only">{i18n.t('actions.delete')}</span>
									</Button>
									<Button variant="ghost" size="icon" href="{section.downloadHref}?id={item.id}">
										<Download class="h-4 w-4" />
										<span class="sr-only">{i18n.t('actions.download')}</span>
									</Button>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
	{/each}
</div>
