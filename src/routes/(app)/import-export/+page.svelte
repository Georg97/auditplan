<script lang="ts">
	import { getContext } from 'svelte';
	import type { I18nRune } from '$lib/i18n/i18n.svelte';
	import { exportAllData, importData } from '$lib/rpc/importexport.remote';
	import { getAudits } from '$lib/rpc/audits.remote';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { toast } from 'svelte-sonner';
	import Download from '@lucide/svelte/icons/download';
	import Upload from '@lucide/svelte/icons/upload';
	import FileSpreadsheet from '@lucide/svelte/icons/file-spreadsheet';
	import Loader2 from '@lucide/svelte/icons/loader-2';

	const i18n = getContext<I18nRune>('i18n');

	let exportLoading = $state(false);
	let importLoading = $state(false);
	let csvLoading = $state(false);
	let importResult = $state<{ result: Record<string, number>; errors: string[] } | null>(null);
	let exportFilename = $state('');

	function downloadBlob(blob: Blob, filename: string) {
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = filename;
		a.click();
		URL.revokeObjectURL(url);
	}

	function getTimestamp(): string {
		return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
	}

	async function handleJsonExport() {
		exportLoading = true;
		try {
			const data = await exportAllData(undefined as void);
			const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
			const filename = `auditplan_backup_${getTimestamp()}.json`;
			downloadBlob(blob, filename);
			exportFilename = filename;
			toast.success(i18n.t('import_export.export_success'));
		} catch {
			toast.error(i18n.t('import_export.error'));
		} finally {
			exportLoading = false;
		}
	}

	async function handleJsonImport(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		importLoading = true;
		importResult = null;

		try {
			const text = await file.text();
			const parsed = JSON.parse(text);

			if (typeof parsed !== 'object' || parsed === null) {
				toast.error(i18n.t('import_export.invalid_file'));
				return;
			}

			// Extract importable keys
			const validKeys = ['auditors', 'audits', 'calendar_entries', 'actions', 'saved_plans', 'saved_notes', 'saved_audit_questions', 'settings'];
			const importPayload: Record<string, unknown[]> = {};
			for (const key of validKeys) {
				if (Array.isArray(parsed[key])) {
					importPayload[key] = parsed[key];
				}
			}

			if (Object.keys(importPayload).length === 0) {
				toast.error(i18n.t('import_export.invalid_file'));
				return;
			}

			importResult = await importData(importPayload);
			toast.success(i18n.t('import_export.import_success'));
		} catch {
			toast.error(i18n.t('import_export.invalid_file'));
		} finally {
			importLoading = false;
			input.value = '';
		}
	}

	function escapeCsv(val: string): string {
		if (val.includes(';') || val.includes('"') || val.includes('\n')) {
			return `"${val.replace(/"/g, '""')}"`;
		}
		return val;
	}

	async function handleCsvExport() {
		csvLoading = true;
		try {
			const auditsData = await getAudits();
			const headers = ['Auditname', 'Audittyp', 'Startdatum', 'Enddatum', 'Unternehmen', 'Abteilung', 'Standort', 'Format', 'Leitender Auditor', 'Status'];

			const rows = auditsData.map((a) =>
				[a.auditName, a.auditTyp, a.startDatum, a.endDatum ?? '', a.unternehmen, a.abteilung ?? '', a.standort ?? '', a.format ?? '', a.leitenderAuditorId ?? '', a.status]
					.map(escapeCsv)
					.join(';')
			);

			const csv = '\uFEFF' + headers.join(';') + '\r\n' + rows.join('\r\n');
			const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
			const filename = `audits_export_${getTimestamp()}.csv`;
			downloadBlob(blob, filename);
			toast.success(i18n.t('import_export.csv_success'));
		} catch {
			toast.error(i18n.t('import_export.error'));
		} finally {
			csvLoading = false;
		}
	}

	const keyLabels: Record<string, string> = {
		auditors: 'Auditoren',
		audits: 'Audits',
		calendar_entries: 'Kalendereinträge',
		actions: 'Maßnahmen',
		saved_plans: 'Auditpläne',
		saved_notes: 'Auditnotizen',
		saved_audit_questions: 'Auditfragen',
		settings: 'Einstellungen'
	};
</script>

<div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
	<h1 class="mb-6 text-2xl font-bold" style="font-family: var(--font-display)">
		{i18n.t('nav.import_export')}
	</h1>

	<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
		<!-- JSON Export -->
		<Card.Root class="flex flex-col">
			<Card.Header>
				<div class="bg-brand/10 mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl">
					<Download class="text-brand h-6 w-6" />
				</div>
				<Card.Title style="font-family: var(--font-display)">
					{i18n.t('import_export.export_title')}
				</Card.Title>
				<Card.Description>
					{i18n.t('import_export.export_desc')}
				</Card.Description>
			</Card.Header>
			<Card.Content class="mt-auto">
				<Button class="w-full" onclick={handleJsonExport} disabled={exportLoading}>
					{#if exportLoading}
						<Loader2 class="mr-2 h-4 w-4 animate-spin" />
					{/if}
					{i18n.t('import_export.export_json')}
				</Button>
				{#if exportFilename}
					<p class="mt-2 text-xs text-green-600 dark:text-green-400">
						{i18n.t('import_export.export_file', { name: exportFilename })}
					</p>
				{/if}
			</Card.Content>
		</Card.Root>

		<!-- JSON Import -->
		<Card.Root class="flex flex-col">
			<Card.Header>
				<div class="bg-brand/10 mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl">
					<Upload class="text-brand h-6 w-6" />
				</div>
				<Card.Title style="font-family: var(--font-display)">
					{i18n.t('import_export.import_title')}
				</Card.Title>
				<Card.Description>
					{i18n.t('import_export.import_desc')}
				</Card.Description>
			</Card.Header>
			<Card.Content class="mt-auto">
				<label class="block">
					<Button class="pointer-events-none w-full" disabled={importLoading}>
						{#if importLoading}
							<Loader2 class="mr-2 h-4 w-4 animate-spin" />
						{/if}
						{i18n.t('import_export.import_json')}
					</Button>
					<input type="file" accept=".json" class="hidden" onchange={handleJsonImport} />
				</label>
				{#if importResult}
					<div class="mt-3 space-y-1 text-xs">
						{#each Object.entries(importResult.result) as [key, count] (key)}
							<div class="flex justify-between">
								<span>{keyLabels[key] ?? key}</span>
								<span class="font-medium">{count}</span>
							</div>
						{/each}
						{#if importResult.errors.length > 0}
							<div class="text-destructive mt-2">
								{#each importResult.errors as err (err)}
									<p>{err}</p>
								{/each}
							</div>
						{/if}
					</div>
				{/if}
			</Card.Content>
		</Card.Root>

		<!-- CSV Export -->
		<Card.Root class="flex flex-col">
			<Card.Header>
				<div class="bg-brand/10 mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl">
					<FileSpreadsheet class="text-brand h-6 w-6" />
				</div>
				<Card.Title style="font-family: var(--font-display)">
					{i18n.t('import_export.csv_title')}
				</Card.Title>
				<Card.Description>
					{i18n.t('import_export.csv_desc')}
				</Card.Description>
			</Card.Header>
			<Card.Content class="mt-auto">
				<Button class="w-full" onclick={handleCsvExport} disabled={csvLoading}>
					{#if csvLoading}
						<Loader2 class="mr-2 h-4 w-4 animate-spin" />
					{/if}
					{i18n.t('import_export.export_csv')}
				</Button>
			</Card.Content>
		</Card.Root>
	</div>
</div>
