<script lang="ts">
	import { setContext } from 'svelte';
	import { I18nRune } from '$lib/i18n/i18n.svelte';

	let { children } = $props();

	const i18n = new I18nRune();
	i18n.init();
	setContext('i18n', i18n);
</script>

<!-- Header and Nav will be added in H03/H04 tasks -->

{@render children()}
