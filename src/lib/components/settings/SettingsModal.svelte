<script lang="ts">
	import { getContext } from 'svelte';
	import type { I18nRune } from '$lib/i18n/i18n.svelte';
	import type { SupportedLocale } from '$lib/i18n/i18n.svelte';
	import { SettingsState } from '$lib/state/settings.svelte';
	import { saveSettings } from '$lib/rpc/einstellungen.remote';
	import { themeNames, type ThemeName } from '$lib/types/settings';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Tabs from '$lib/components/ui/tabs';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Button } from '$lib/components/ui/button';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { toast } from 'svelte-sonner';
	import { exportAllData, importData } from '$lib/rpc/importexport.remote';

	let { open = $bindable(false) }: { open: boolean } = $props();

	const i18n = getContext<I18nRune>('i18n');
	const settings = getContext<SettingsState>('settings');

	let deleteDialogOpen = $state(false);

	const themeColors: Record<ThemeName, string> = {
		default: '#667eea',
		dark: '#1e293b',
		light: '#f1f5f9',
		blue: '#3b82f6',
		green: '#22c55e',
		red: '#ef4444',
		purple: '#a855f7',
		orange: '#f97316',
		teal: '#14b8a6',
		pink: '#ec4899',
		indigo: '#6366f1',
		cyan: '#06b6d4',
		amber: '#f59e0b',
		emerald: '#10b981',
		rose: '#f43f5e',
		violet: '#8b5cf6',
		slate: '#64748b',
		zinc: '#71717a'
	};

	const languages: { value: SupportedLocale; label: string }[] = [
		{ value: 'de', label: 'Deutsch' },
		{ value: 'en', label: 'English' },
		{ value: 'fr', label: 'Français' },
		{ value: 'es', label: 'Español' },
		{ value: 'it', label: 'Italiano' },
		{ value: 'nl', label: 'Nederlands' },
		{ value: 'pt', label: 'Português' },
		{ value: 'pl', label: 'Polski' },
		{ value: 'ru', label: 'Русский' },
		{ value: 'tr', label: 'Türkçe' }
	];

	async function persistSettings() {
		try {
			await saveSettings(settings.toJSON());
		} catch {
			// silent
		}
	}

	function setTheme(theme: ThemeName) {
		settings.theme = theme;
		persistSettings();
	}

	async function changeLanguage(locale: SupportedLocale) {
		settings.sprache = locale;
		await i18n.changeLocale(locale);
		persistSettings();
	}

	function downloadBlob(blob: Blob, filename: string) {
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = filename;
		a.click();
		URL.revokeObjectURL(url);
	}

	async function handleExport() {
		try {
			const data = await exportAllData(undefined as void);
			const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
			const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
			downloadBlob(blob, `auditplan_backup_${ts}.json`);
			toast.success(i18n.t('import_export.export_success'));
		} catch {
			toast.error(i18n.t('import_export.error'));
		}
	}

	async function handleImport(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		try {
			const text = await file.text();
			const parsed = JSON.parse(text);
			const validKeys = ['auditors', 'audits', 'calendar_entries', 'actions', 'saved_plans', 'saved_notes', 'saved_audit_questions', 'settings'];
			const payload: Record<string, unknown[]> = {};
			for (const key of validKeys) {
				if (Array.isArray(parsed[key])) payload[key] = parsed[key];
			}
			if (Object.keys(payload).length === 0) {
				toast.error(i18n.t('import_export.invalid_file'));
				return;
			}
			await importData(payload);
			toast.success(i18n.t('import_export.import_success'));
		} catch {
			toast.error(i18n.t('import_export.invalid_file'));
		}
		input.value = '';
	}

	function handleDeleteAll() {
		deleteDialogOpen = true;
	}

	async function confirmDeleteAll() {
		// TODO: implement deleteAllData remote function
		deleteDialogOpen = false;
		toast.success(i18n.t('settings.delete_data'));
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-2xl">
		<Dialog.Header>
			<Dialog.Title style="font-family: var(--font-display)">
				{i18n.t('settings.title')}
			</Dialog.Title>
		</Dialog.Header>

		<Tabs.Root value="theme" class="mt-4">
			<Tabs.List class="w-full">
				<Tabs.Trigger value="theme">{i18n.t('settings.theme')}</Tabs.Trigger>
				<Tabs.Trigger value="general">{i18n.t('settings.language')}</Tabs.Trigger>
				<Tabs.Trigger value="data">{i18n.t('settings.data_management')}</Tabs.Trigger>
			</Tabs.List>

			<!-- Theme Tab -->
			<Tabs.Content value="theme" class="mt-4">
				<p class="text-muted-foreground mb-3 text-sm">{i18n.t('settings.theme')}</p>
				<div class="grid grid-cols-6 gap-2">
					{#each themeNames as name (name)}
						<button
							class="flex flex-col items-center gap-1 rounded-lg border-2 p-2 transition-colors {settings.theme === name
								? 'border-primary'
								: 'hover:border-muted border-transparent'}"
							onclick={() => setTheme(name)}
						>
							<div class="h-8 w-8 rounded-md shadow-sm" style="background: {themeColors[name]}"></div>
							<span class="text-[10px] capitalize">{name}</span>
						</button>
					{/each}
				</div>
			</Tabs.Content>

			<!-- General Tab -->
			<Tabs.Content value="general" class="mt-4 space-y-4">
				<div class="flex flex-col gap-1.5">
					<Label for="settings-language">{i18n.t('settings.language')}</Label>
					<select
						id="settings-language"
						value={settings.sprache}
						onchange={(e) => changeLanguage((e.currentTarget as HTMLSelectElement).value as SupportedLocale)}
						class="border-input bg-background focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-none"
					>
						{#each languages as lang (lang.value)}
							<option value={lang.value}>{lang.label}</option>
						{/each}
					</select>
				</div>

				<div class="flex items-center gap-2">
					<Checkbox
						id="settings-compact"
						checked={settings.kompaktansicht}
						onCheckedChange={(v) => {
							settings.kompaktansicht = v === true;
							persistSettings();
						}}
					/>
					<Label for="settings-compact">{i18n.t('settings.compact_view')}</Label>
				</div>

				<div class="flex items-center gap-2">
					<Checkbox
						id="settings-notifications"
						checked={settings.benachrichtigungen}
						onCheckedChange={(v) => {
							settings.benachrichtigungen = v === true;
							persistSettings();
						}}
					/>
					<Label for="settings-notifications">{i18n.t('settings.notifications')}</Label>
				</div>

				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div class="flex flex-col gap-1.5">
						<Label for="settings-auditor">{i18n.t('settings.default_auditor')}</Label>
						<Input
							id="settings-auditor"
							type="text"
							value={settings.standardAuditor}
							oninput={(e) => {
								settings.standardAuditor = (e.currentTarget as HTMLInputElement).value;
							}}
							onblur={persistSettings}
						/>
					</div>
					<div class="flex flex-col gap-1.5">
						<Label for="settings-department">{i18n.t('settings.default_department')}</Label>
						<Input
							id="settings-department"
							type="text"
							value={settings.standardAbteilung}
							oninput={(e) => {
								settings.standardAbteilung = (e.currentTarget as HTMLInputElement).value;
							}}
							onblur={persistSettings}
						/>
					</div>
				</div>
			</Tabs.Content>

			<!-- Data Management Tab -->
			<Tabs.Content value="data" class="mt-4 space-y-4">
				<div class="space-y-3">
					<div class="flex items-center justify-between rounded-lg border p-4">
						<div>
							<p class="font-medium">{i18n.t('settings.export_data')}</p>
							<p class="text-muted-foreground text-xs">{i18n.t('import_export.export_desc')}</p>
						</div>
						<Button size="sm" onclick={handleExport}>{i18n.t('common.export')}</Button>
					</div>

					<div class="flex items-center justify-between rounded-lg border p-4">
						<div>
							<p class="font-medium">{i18n.t('settings.import_data')}</p>
							<p class="text-muted-foreground text-xs">{i18n.t('import_export.import_desc')}</p>
						</div>
						<label>
							<Button size="sm" class="pointer-events-none">{i18n.t('common.import')}</Button>
							<input type="file" accept=".json" class="hidden" onchange={handleImport} />
						</label>
					</div>

					<div class="flex items-center justify-between rounded-lg border border-red-200 p-4 dark:border-red-800">
						<div>
							<p class="text-destructive font-medium">{i18n.t('settings.delete_data')}</p>
							<p class="text-muted-foreground text-xs">{i18n.t('settings.delete_warning')}</p>
						</div>
						<Button size="sm" variant="destructive" onclick={handleDeleteAll}>
							{i18n.t('common.delete')}
						</Button>
					</div>
				</div>
			</Tabs.Content>
		</Tabs.Root>
	</Dialog.Content>
</Dialog.Root>

<!-- Delete All Confirmation -->
<AlertDialog.Root bind:open={deleteDialogOpen}>
	<AlertDialog.Portal>
		<AlertDialog.Overlay />
		<AlertDialog.Content>
			<AlertDialog.Header>
				<AlertDialog.Title>{i18n.t('settings.delete_data')}</AlertDialog.Title>
				<AlertDialog.Description>{i18n.t('settings.delete_warning')}</AlertDialog.Description>
			</AlertDialog.Header>
			<AlertDialog.Footer>
				<AlertDialog.Cancel onclick={() => (deleteDialogOpen = false)}>
					{i18n.t('common.cancel')}
				</AlertDialog.Cancel>
				<AlertDialog.Action onclick={confirmDeleteAll} class="bg-destructive text-destructive-foreground hover:bg-destructive/90">
					{i18n.t('common.confirm')}
				</AlertDialog.Action>
			</AlertDialog.Footer>
		</AlertDialog.Content>
	</AlertDialog.Portal>
</AlertDialog.Root>
