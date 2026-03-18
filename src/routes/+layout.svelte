<script lang="ts">
	import './layout.css';
	import { TooltipProvider } from '$lib/components/ui/tooltip';
	import { Toaster } from '$lib/components/ui/sonner';
	import { ModeWatcher, mode } from 'mode-watcher';

	let { children } = $props();

	const favicon = $derived(mode.current === 'dark' ? '/logo_dark.png' : '/logo_light.png');
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<ModeWatcher defaultMode="system" />
<TooltipProvider>
	{@render children()}
</TooltipProvider>
<Toaster richColors />
