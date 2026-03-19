<script lang="ts">
	import { page } from '$app/state';
	import { getContext } from 'svelte';
	import type { I18nRune } from '$lib/i18n/i18n.svelte';
	import { NAV_ITEMS } from './nav-items';

	const i18n = getContext<I18nRune>('i18n');
</script>

<nav class="dark:border-border dark:bg-card flex flex-wrap justify-center gap-2 border-b-2 border-[#e2e8f0] bg-white px-4 py-2">
	{#each NAV_ITEMS as item (item.id)}
		{@const isActive = page.url.pathname === item.href}
		<a href={item.href} class="nav-item rounded-full border-2 px-5 py-2.5 text-[0.85rem] no-underline transition-all duration-300" class:active={isActive}>
			<span class="mr-1">{item.icon}</span>
			{i18n.t(item.labelKey)}
		</a>
	{/each}
</nav>

<style>
	.nav-item {
		border-color: #e2e8f0;
		background: white;
		color: inherit;
		cursor: pointer;
	}

	.nav-item:hover:not(.active) {
		border-color: #667eea;
		color: #667eea;
		transform: translateY(-2px);
		box-shadow: 0 4px 6px rgba(102, 126, 234, 0.2);
	}

	.nav-item.active {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border-color: transparent;
		box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
	}

	:global(.dark) .nav-item {
		background: hsl(var(--card));
		border-color: hsl(var(--border));
		color: hsl(var(--card-foreground));
	}

	:global(.dark) .nav-item:hover:not(.active) {
		border-color: #667eea;
		color: #667eea;
	}

	:global(.dark) .nav-item.active {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border-color: transparent;
	}
</style>
