<script lang="ts">
	import { setContext } from 'svelte';
	import { I18nRune } from '$lib/i18n/i18n.svelte';
	import { SettingsState } from '$lib/state/settings.svelte';
	import AppSidebar from '$lib/components/layout/AppSidebar.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar';

	let { children, data } = $props();

	const i18n = new I18nRune();
	i18n.init();
	setContext('i18n', i18n);
	setContext('user', data.user);

	const settingsState = new SettingsState();
	setContext('settings', settingsState);
</script>

<Sidebar.Provider>
	<AppSidebar />
	<Sidebar.Inset>
		<header class="border-border flex items-center gap-2 border-b px-4 py-2 lg:hidden">
			<Sidebar.Trigger />
			<span class="font-semibold" style="font-family: var(--font-display)">{i18n.t('app.name')}</span>
		</header>
		<main class="flex-1 overflow-y-auto">
			<div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
				{@render children()}
			</div>
		</main>
	</Sidebar.Inset>
</Sidebar.Provider>
