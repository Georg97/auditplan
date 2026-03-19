<script lang="ts">
	import { getContext } from 'svelte';
	import type { I18nRune } from '$lib/i18n/i18n.svelte';
	import Settings from '@lucide/svelte/icons/settings';

	let { onSettingsClick }: { onSettingsClick?: () => void } = $props();

	const i18n = getContext<I18nRune>('i18n');
</script>

<!-- TODO: H03 [IMPL] — Full implementation with SVGs, gradient, 3D title -->
<header class="relative px-8 py-6" style="background: linear-gradient(135deg, #667eea, #764ba2);">
	<div class="flex items-center justify-between">
		<!-- Left SVG placeholder -->
		<div class="hidden h-[250px] w-[280px] md:block"></div>

		<!-- Center: Title -->
		<div class="text-center">
			<h1 class="text-3xl font-bold text-white md:text-[2.5rem]" style="text-shadow: 2px 2px 4px rgba(0,0,0,0.3); font-family: var(--font-display);">
				{i18n.t('app.title')}
			</h1>
			<p class="mt-1 text-sm text-white/90 md:text-[1.1rem]">
				{i18n.t('app.subtitle1')}
			</p>
			<p class="text-sm text-white/90 md:text-[1.1rem]">
				{i18n.t('app.subtitle2')}
			</p>
		</div>

		<!-- Right SVG placeholder -->
		<div class="hidden h-[250px] w-[280px] md:block"></div>
	</div>

	<!-- Settings button -->
	<button
		class="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 transition-transform duration-300 hover:rotate-90 hover:bg-white/30"
		onclick={onSettingsClick}
		aria-label={i18n.t('nav.settings')}
	>
		<Settings class="h-5 w-5 text-white" />
	</button>
</header>
