<script lang="ts">
	import { getContext } from 'svelte';
	import type { I18nRune } from '$lib/i18n/i18n.svelte';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { toast } from 'svelte-sonner';
	import { exportToJson, validateImportJson, exportAuditsCsv, type ExportData } from '$lib/utils/import-export';
	import Download from '@lucide/svelte/icons/download';
	import Upload from '@lucide/svelte/icons/upload';
	import FileSpreadsheet from '@lucide/svelte/icons/file-spreadsheet';
	import Loader2 from '@lucide/svelte/icons/loader-2';

	const i18n = getContext<I18nRune>('i18n');

	let isExporting = $state(false);
	let isImporting = $state(false);
	let isCsvExporting = $state(false);

	let fileInput: HTMLInputElement;

	function handleJsonExport() {
		isExporting = true;
		try {
			// TODO: Load actual data from DB via remote functions
			const data: ExportData = {
				version: '1.0',
				exportedAt: new Date().toISOString(),
				audits: [],
				auditors: [],
				calendarEntries: [],
				actions: []
			};
			const filename = exportToJson(data);
			toast.success(`${i18n.t('importExport.exportSuccess')}: ${filename}`);
		} catch {
			toast.error(i18n.t('importExport.exportError'));
		} finally {
			isExporting = false;
		}
	}

	function handleJsonImport() {
		fileInput?.click();
	}

	function handleFileSelected(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;

		isImporting = true;
		const reader = new FileReader();
		reader.onload = () => {
			try {
				const jsonString = reader.result as string;
				const result = validateImportJson(jsonString);

				if (result.success) {
					const summary = result.importedKeys.map((key) => `${key}: ${result.counts[key]}`).join(', ');
					toast.success(`${i18n.t('importExport.importSuccess')}: ${summary}`);
				} else {
					toast.error(result.errors.join('; ') || i18n.t('importExport.importError'));
				}
			} catch {
				toast.error(i18n.t('importExport.importError'));
			} finally {
				isImporting = false;
				target.value = '';
			}
		};
		reader.onerror = () => {
			toast.error(i18n.t('importExport.importError'));
			isImporting = false;
		};
		reader.readAsText(file);
	}

	function handleCsvExport() {
		isCsvExporting = true;
		try {
			// TODO: Load actual audit data from DB
			const filename = exportAuditsCsv([]);
			toast.success(`${i18n.t('importExport.csvExportSuccess')}: ${filename}`);
		} catch {
			toast.error(i18n.t('importExport.exportError'));
		} finally {
			isCsvExporting = false;
		}
	}
</script>

<input bind:this={fileInput} type="file" accept=".json" class="hidden" onchange={handleFileSelected} />

<div class="space-y-6">
	<h1 class="text-2xl font-bold" style="font-family: var(--font-display)">
		{i18n.t('importExport.title')}
	</h1>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
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
				<Button class="w-full" onclick={handleJsonExport} disabled={isExporting}>
					{#if isExporting}
						<Loader2 class="mr-2 h-4 w-4 animate-spin" />
					{:else}
						<Download class="mr-2 h-4 w-4" />
					{/if}
					{i18n.t('importExport.exportJson')}
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
			<Card.Footer>
				<Button variant="outline" class="w-full" onclick={handleJsonImport} disabled={isImporting}>
					{#if isImporting}
						<Loader2 class="mr-2 h-4 w-4 animate-spin" />
					{:else}
						<Upload class="mr-2 h-4 w-4" />
					{/if}
					{i18n.t('importExport.importJson')}
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
				<Button class="w-full" onclick={handleCsvExport} disabled={isCsvExporting}>
					{#if isCsvExporting}
						<Loader2 class="mr-2 h-4 w-4 animate-spin" />
					{:else}
						<Download class="mr-2 h-4 w-4" />
					{/if}
					{i18n.t('importExport.exportCsv')}
				</Button>
			</Card.Footer>
		</Card.Root>
	</div>
</div>
