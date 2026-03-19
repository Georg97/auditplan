<script lang="ts">
	import { getContext } from 'svelte';
	import type { I18nRune } from '$lib/i18n/i18n.svelte';
	import Settings from '@lucide/svelte/icons/settings';

	interface Props {
		onSettingsClick: () => void;
	}

	let { onSettingsClick }: Props = $props();
	const i18n = getContext<I18nRune>('i18n');
</script>

<!-- TODO: [IMPL] Full header with SVG illustrations, gradient background, 3D title -->
<header class="relative px-8 py-6" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
	<div class="flex items-center justify-between">
		<div class="hidden md:block" style="width: 280px; height: 250px">
			<!-- TODO: Left SVG - ISO certificate with magnifying glass -->
		</div>

		<div class="text-center text-white">
			<h1 class="text-3xl font-bold md:text-[2.5rem]" style="text-shadow: 2px 2px 4px rgba(0,0,0,0.3)">
				{i18n.t('header.title')}
			</h1>
			<p class="mt-2 text-sm opacity-90 md:text-[1.1rem]">{i18n.t('header.subtitle1')}</p>
			<p class="mt-1 text-sm opacity-90 md:text-[1.1rem]">{i18n.t('header.subtitle2')}</p>
		</div>

		<div class="hidden md:block" style="width: 280px; height: 250px">
			<!-- TODO: Right SVG - Clipboard with progress bars -->
		</div>
	</div>

	<button
		type="button"
		class="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full transition-transform duration-300 hover:rotate-90"
		style="background: rgba(255, 255, 255, 0.2)"
		onclick={onSettingsClick}
		aria-label={i18n.t('nav.einstellungen')}
	>
		<Settings class="h-5 w-5 text-white" />
	</button>
</header>
