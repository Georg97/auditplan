<script lang="ts">
	import { getContext } from 'svelte';
	import type { I18nRune } from '$lib/i18n/i18n.svelte';
	import * as Card from '$lib/components/ui/card';
	import StickyNote from '@lucide/svelte/icons/sticky-note';

	const i18n = getContext<I18nRune>('i18n');
</script>

<h1 class="text-2xl font-bold" style="font-family: var(--font-display)">
	{i18n.t('notesGenerator.title')}
</h1>

<div class="mt-6">
	<Card.Root>
		<Card.Header>
			<Card.Title class="flex items-center gap-2">
				<StickyNote class="h-5 w-5" />
				{i18n.t('notesGenerator.title')}
			</Card.Title>
		</Card.Header>
		<Card.Content>
			<p class="text-muted-foreground">
				{i18n.t('notesGenerator.placeholder')}
			</p>
		</Card.Content>
	</Card.Root>
</div>
