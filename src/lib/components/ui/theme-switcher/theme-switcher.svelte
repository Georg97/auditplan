<script lang="ts">
	import { setMode, userPrefersMode } from 'mode-watcher';
	import Sun from '@lucide/svelte/icons/sun';
	import Moon from '@lucide/svelte/icons/moon';
	import Monitor from '@lucide/svelte/icons/monitor';

	const modes = [
		{ value: 'light' as const, icon: Sun, label: 'Light' },
		{ value: 'dark' as const, icon: Moon, label: 'Dark' },
		{ value: 'system' as const, icon: Monitor, label: 'System' }
	];
</script>

<div class="flex items-center gap-0.5 rounded-full border border-border bg-secondary/50 px-1 py-1">
	{#each modes as mode}
		<button
			onclick={() => setMode(mode.value)}
			class="relative flex size-7 items-center justify-center rounded-full transition-all {userPrefersMode.current === mode.value ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground'}"
			aria-label={mode.label}
		>
			<mode.icon class="size-3.5" />
		</button>
	{/each}
</div>
