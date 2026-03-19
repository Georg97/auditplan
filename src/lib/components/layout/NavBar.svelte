<script lang="ts">
	import { page } from '$app/state';
	import { getContext } from 'svelte';
	import type { I18nRune } from '$lib/i18n/i18n.svelte';
	import { NAV_ITEMS } from './nav-items';

	const i18n = getContext<I18nRune>('i18n');

	function isActive(href: string): boolean {
		return page.url.pathname === href;
	}
</script>

<nav class="flex flex-wrap justify-center gap-2 border-b-2 border-[#e2e8f0] bg-white px-4 py-2">
	{#each NAV_ITEMS as item (item.id)}
		<a
			href={item.href}
			class="rounded-full border-2 px-5 py-2.5 text-[0.85rem] transition-all duration-300 {isActive(item.href)
				? 'border-transparent text-white shadow-[0_4px_15px_rgba(102,126,234,0.4)]'
				: 'border-[#e2e8f0] bg-white hover:-translate-y-0.5 hover:border-[#667eea] hover:text-[#667eea] hover:shadow-[0_4px_6px_rgba(102,126,234,0.2)]'}"
			style={isActive(item.href) ? 'background: linear-gradient(135deg, #667eea, #764ba2);' : ''}
		>
			{i18n.t(item.label)}
		</a>
	{/each}
</nav>
