<script lang="ts">
	import { setContext } from 'svelte';
	import { I18nRune } from '$lib/i18n/i18n.svelte';

	let { children, data } = $props();

	const i18n = new I18nRune();
	i18n.init();
	setContext('i18n', i18n);
	setContext('user', data.user);
</script>

{@render children()}
