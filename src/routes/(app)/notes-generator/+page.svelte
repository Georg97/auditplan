<script lang="ts">
	import { getContext } from 'svelte';
	import type { I18nRune } from '$lib/i18n/i18n.svelte';

	const i18n = getContext<I18nRune>('i18n');
</script>

<div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
	<h1 class="text-2xl font-bold" style="font-family: var(--font-display)">{i18n.t('notes.title')}</h1>
</div>
