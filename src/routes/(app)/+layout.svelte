<script lang="ts">
	import { setContext } from 'svelte';
	import { I18nRune } from '$lib/i18n/i18n.svelte';
	import { SettingsState } from '$lib/state/settings.svelte';
	import Header from '$lib/components/layout/Header.svelte';
	import NavBar from '$lib/components/layout/NavBar.svelte';
	import type { Snippet } from 'svelte';

	let { data, children }: { data: { user: { name: string; email: string }; session: unknown }; children: Snippet } = $props();

	const i18n = new I18nRune();
	setContext('i18n', i18n);

	const settings = new SettingsState();
	setContext('settings', settings);

	let settingsOpen = $state(false);

	$effect(() => {
		i18n.init();
	});

	function openSettings() {
		settingsOpen = true;
	}
</script>

{#if i18n.ready}
	<div class="bg-background text-foreground min-h-screen">
		<Header onSettingsClick={openSettings} />
		<NavBar />
		<main>
			{@render children()}
		</main>
	</div>
{:else}
	<div class="flex min-h-screen items-center justify-center">
		<p class="text-muted-foreground">{i18n.t('common.loading')}</p>
	</div>
{/if}
