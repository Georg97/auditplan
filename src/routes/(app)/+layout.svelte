<script lang="ts">
	import { setContext } from 'svelte';
	import { I18nRune } from '$lib/i18n/i18n.svelte';
	import { SettingsState } from '$lib/state/settings.svelte';
	import Header from '$lib/components/layout/Header.svelte';
	import NavBar from '$lib/components/layout/NavBar.svelte';
	import SettingsDialog from '$lib/components/SettingsDialog.svelte';

	let { children } = $props();

	const i18n = new I18nRune();
	i18n.init();
	setContext('i18n', i18n);

	const settingsState = new SettingsState();
	setContext('settings', settingsState);

	let settingsOpen = $state(false);

	function handleSettingsClick() {
		settingsOpen = !settingsOpen;
	}
</script>

<div class="bg-background text-foreground flex min-h-screen flex-col">
	<Header onSettingsClick={handleSettingsClick} />
	<NavBar />
	<main class="flex-1">
		{@render children()}
	</main>
</div>

<SettingsDialog bind:open={settingsOpen} />
