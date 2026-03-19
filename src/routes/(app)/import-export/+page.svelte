<script lang="ts">
	import { getContext } from 'svelte';
	import type { I18nRune } from '$lib/i18n/i18n.svelte';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import Download from '@lucide/svelte/icons/download';
	import Upload from '@lucide/svelte/icons/upload';
	import FileSpreadsheet from '@lucide/svelte/icons/file-spreadsheet';

	const i18n = getContext<I18nRune>('i18n');
</script>

<h1 class="text-2xl font-bold" style="font-family: var(--font-display)">
	{i18n.t('importExport.title')}
</h1>

<div class="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
	<Card.Root>
		<Card.Header>
			<Card.Title class="flex items-center gap-2">
				<Download class="h-5 w-5" />
				{i18n.t('importExport.exportJson')}
			</Card.Title>
			<Card.Description>
				{i18n.t('importExport.exportJsonDesc')}
			</Card.Description>
		</Card.Header>
		<Card.Footer>
			<Button class="w-full">
				<Download class="mr-2 h-4 w-4" />
				{i18n.t('common.download')}
			</Button>
		</Card.Footer>
	</Card.Root>

	<Card.Root>
		<Card.Header>
			<Card.Title class="flex items-center gap-2">
				<Upload class="h-5 w-5" />
				{i18n.t('importExport.importJson')}
			</Card.Title>
			<Card.Description>
				{i18n.t('importExport.importJsonDesc')}
			</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="border-border bg-muted/50 flex min-h-[80px] items-center justify-center rounded-lg border-2 border-dashed p-4">
				<p class="text-muted-foreground text-sm">
					{i18n.t('upload.dropOrClick')}
				</p>
			</div>
		</Card.Content>
		<Card.Footer>
			<Button variant="outline" class="w-full">
				<Upload class="mr-2 h-4 w-4" />
				{i18n.t('common.upload')}
			</Button>
		</Card.Footer>
	</Card.Root>

	<Card.Root>
		<Card.Header>
			<Card.Title class="flex items-center gap-2">
				<FileSpreadsheet class="h-5 w-5" />
				{i18n.t('importExport.exportCsv')}
			</Card.Title>
			<Card.Description>
				{i18n.t('importExport.exportCsvDesc')}
			</Card.Description>
		</Card.Header>
		<Card.Footer>
			<Button class="w-full">
				<Download class="mr-2 h-4 w-4" />
				{i18n.t('common.download')}
			</Button>
		</Card.Footer>
	</Card.Root>
</div>
