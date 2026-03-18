<script lang="ts">
	import { toggleMode, mode } from 'mode-watcher';
	import Sun from '@lucide/svelte/icons/sun';
	import Moon from '@lucide/svelte/icons/moon';
</script>

<button
	onclick={toggleMode}
	class="border-border bg-secondary/50 hover:bg-secondary relative flex size-8 items-center justify-center rounded-full border transition-all"
	aria-label="Toggle theme"
>
	{#if mode.current === 'dark'}
		<Moon class="text-foreground size-3.5" />
	{:else}
		<Sun class="text-foreground size-3.5" />
	{/if}
</button>
