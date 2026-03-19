<script lang="ts">
	import { getContext } from 'svelte';
	import type { I18nRune } from '$lib/i18n/i18n.svelte';
	import { toast } from 'svelte-sonner';
	import Download from '@lucide/svelte/icons/download';
	import Upload from '@lucide/svelte/icons/upload';
	import FileSpreadsheet from '@lucide/svelte/icons/file-spreadsheet';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { exportAllData, importData } from '$lib/rpc/import-export.remote';
	import { getAudits } from '$lib/rpc/audits.remote';
	import { exportDataSchema } from '$lib/types';

	const i18n = getContext<I18nRune>('i18n');

	let exportLoading = $state(false);
	let importLoading = $state(false);
	let csvLoading = $state(false);
	let importResult = $state<{ importedKeys: string[]; skippedKeys: string[]; counts: Record<string, number> } | null>(null);
	let fileInput: HTMLInputElement;

	async function handleExportJson() {
		exportLoading = true;
		try {
			const data = await exportAllData();
			const json = JSON.stringify(data, null, 2);
			const blob = new Blob([json], { type: 'application/json' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `audit-backup-${new Date().toISOString().slice(0, 10)}.json`;
			a.click();
			URL.revokeObjectURL(url);
			toast.success(i18n.t('importExport.exportSuccess'));
		} catch {
			toast.error(i18n.t('importExport.error'));
		} finally {
			exportLoading = false;
		}
	}

	function handleImportClick() {
		fileInput.value = '';
		fileInput.click();
	}

	async function handleFileSelected(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;

		importLoading = true;
		importResult = null;
		try {
			const text = await file.text();
			const raw = JSON.parse(text);
			const parsed = exportDataSchema.safeParse(raw);
			if (!parsed.success) {
				toast.error(i18n.t('importExport.importError'));
				return;
			}
			const result = await importData(parsed.data);
			importResult = {
				importedKeys: result.importedKeys,
				skippedKeys: result.skippedKeys,
				counts: result.counts
			};
			const totalCount = Object.values(result.counts).reduce((sum, n) => sum + n, 0);
			toast.success(i18n.t('importExport.importSuccess') + ' — ' + i18n.t('importExport.importedRecords', { count: totalCount }));
		} catch {
			toast.error(i18n.t('importExport.importError'));
		} finally {
			importLoading = false;
		}
	}

	async function handleExportCsv() {
		csvLoading = true;
		try {
			const audits = await getAudits();
			const headers = [
				'ID',
				'Name',
				'Typ',
				'Status',
				'Startdatum',
				'Enddatum',
				'Unternehmen',
				'Abteilung',
				'Standort',
				'Format',
				'Normen',
				'Geltungsbereich',
				'Leitender Auditor',
				'Auditteam',
				'Ansprechpartner',
				'Kontakt-E-Mail',
				'Notizen'
			];

			const escape = (val: unknown) => {
				if (val == null) return '';
				const str = String(val).replace(/"/g, '""');
				return `"${str}"`;
			};

			const rows = audits.map((audit) => [
				escape(audit.id),
				escape(audit.auditName),
				escape(audit.auditType),
				escape(audit.status),
				escape(audit.startDate),
				escape(audit.endDate),
				escape(audit.company),
				escape(audit.department),
				escape(audit.location),
				escape(audit.format),
				escape(audit.norms),
				escape(audit.scope),
				escape(audit.leadAuditorId),
				escape(audit.auditTeam),
				escape(audit.contactPerson),
				escape(audit.contactEmail),
				escape(audit.notes)
			]);

			const csvContent = [headers.map((h) => `"${h}"`).join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');

			// UTF-8 BOM for Excel compatibility
			const bom = '\uFEFF';
			const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `audits-${new Date().toISOString().slice(0, 10)}.csv`;
			a.click();
			URL.revokeObjectURL(url);
			toast.success(i18n.t('importExport.csvSuccess'));
		} catch {
			toast.error(i18n.t('importExport.error'));
		} finally {
			csvLoading = false;
		}
	}
</script>

<input bind:this={fileInput} type="file" accept=".json" class="hidden" onchange={handleFileSelected} />

<div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
	<h1 class="mb-6 text-2xl font-bold" style="font-family: var(--font-display)">{i18n.t('importExport.title')}</h1>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
		<!-- Export JSON Card -->
		<Card.Root>
			<Card.Header>
				<div class="bg-brand/10 mb-2 flex h-10 w-10 items-center justify-center rounded-lg">
					<Download class="text-brand h-5 w-5" />
				</div>
				<Card.Title>{i18n.t('importExport.exportJson')}</Card.Title>
				<Card.Description>{i18n.t('importExport.exportJsonDesc')}</Card.Description>
			</Card.Header>
			<Card.Footer>
				<Button onclick={handleExportJson} disabled={exportLoading} class="w-full">
					{#if exportLoading}
						{i18n.t('common.loading')}
					{:else}
						{i18n.t('importExport.exportJsonButton')}
					{/if}
				</Button>
			</Card.Footer>
		</Card.Root>

		<!-- Import JSON Card -->
		<Card.Root>
			<Card.Header>
				<div class="bg-brand/10 mb-2 flex h-10 w-10 items-center justify-center rounded-lg">
					<Upload class="text-brand h-5 w-5" />
				</div>
				<Card.Title>{i18n.t('importExport.importJson')}</Card.Title>
				<Card.Description>{i18n.t('importExport.importJsonDesc')}</Card.Description>
			</Card.Header>
			<Card.Content>
				{#if importResult}
					<div class="bg-muted rounded-md p-3 text-sm">
						<p class="font-medium">{i18n.t('importExport.importSuccess')}</p>
						{#if importResult.importedKeys.length > 0}
							<ul class="text-muted-foreground mt-1 list-inside list-disc">
								{#each importResult.importedKeys as key (key)}
									<li>{key}: {importResult.counts[key] ?? 0}</li>
								{/each}
							</ul>
						{/if}
						{#if importResult.skippedKeys.length > 0}
							<p class="text-muted-foreground mt-1">
								{i18n.t('importExport.skippedKeys')}: {importResult.skippedKeys.join(', ')}
							</p>
						{/if}
					</div>
				{/if}
			</Card.Content>
			<Card.Footer>
				<Button onclick={handleImportClick} disabled={importLoading} variant="outline" class="w-full">
					{#if importLoading}
						{i18n.t('common.loading')}
					{:else}
						{i18n.t('importExport.importJsonButton')}
					{/if}
				</Button>
			</Card.Footer>
		</Card.Root>

		<!-- CSV Export Card -->
		<Card.Root>
			<Card.Header>
				<div class="bg-brand/10 mb-2 flex h-10 w-10 items-center justify-center rounded-lg">
					<FileSpreadsheet class="text-brand h-5 w-5" />
				</div>
				<Card.Title>{i18n.t('importExport.exportCsv')}</Card.Title>
				<Card.Description>{i18n.t('importExport.exportCsvDesc')}</Card.Description>
			</Card.Header>
			<Card.Footer>
				<Button onclick={handleExportCsv} disabled={csvLoading} variant="outline" class="w-full">
					{#if csvLoading}
						{i18n.t('common.loading')}
					{:else}
						{i18n.t('importExport.exportCsvButton')}
					{/if}
				</Button>
			</Card.Footer>
		</Card.Root>
	</div>
</div>
