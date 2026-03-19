<script lang="ts">
	import { setContext } from 'svelte';
	import { I18nRune } from '$lib/i18n/i18n.svelte';
	import { SettingsState } from '$lib/state/settings.svelte';
	import { getSettings } from '$lib/rpc/einstellungen.remote';
	import { setMode } from 'mode-watcher';
	import Header from '$lib/components/layout/Header.svelte';
	import NavBar from '$lib/components/layout/NavBar.svelte';
	import SettingsModal from '$lib/components/settings/SettingsModal.svelte';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();

	const i18n = new I18nRune();
	setContext('i18n', i18n);

	const settings = new SettingsState();
	setContext('settings', settings);

	let settingsOpen = $state(false);

	$effect(() => {
		i18n.init();
	});

	// Load saved settings
	$effect(() => {
		getSettings().then((saved) => {
			if (saved) {
				settings.apply(saved);
				// Sync language
				if (saved.sprache && saved.sprache !== i18n.locale) {
					i18n.changeLocale(saved.sprache);
				}
			}
		});
	});

	// Apply theme: dark/light via mode-watcher, color themes via CSS class
	$effect(() => {
		const theme = settings.theme;
		if (theme === 'dark') {
			setMode('dark');
		} else if (theme === 'light') {
			setMode('light');
		} else if (theme === 'default') {
			setMode('system');
		} else {
			// Color themes — apply as dark mode variant + theme class
			setMode('system');
		}
		// Apply theme class to document for color themes
		if (typeof document !== 'undefined') {
			const root = document.documentElement;
			// Remove old theme classes
			root.classList.forEach((cls) => {
				if (cls.startsWith('theme-')) root.classList.remove(cls);
			});
			if (theme !== 'default' && theme !== 'dark' && theme !== 'light') {
				root.classList.add(`theme-${theme}`);
			}
		}
	});

	// Apply compact view
	$effect(() => {
		if (typeof document !== 'undefined') {
			document.documentElement.classList.toggle('compact', settings.kompaktansicht);
		}
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
	<SettingsModal bind:open={settingsOpen} />
{:else}
	<div class="flex min-h-screen items-center justify-center">
		<p class="text-muted-foreground">{i18n.t('common.loading')}</p>
	</div>
{/if}
