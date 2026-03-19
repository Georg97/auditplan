<script lang="ts">
	import { getContext } from 'svelte';
	import type { I18nRune } from '$lib/i18n/i18n.svelte';
	import type { SettingsState } from '$lib/state/settings.svelte';
	import { THEME_DEFINITIONS, supportedLocaleValues, type ThemeName, type SupportedLocale } from '$lib/types';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Switch } from '$lib/components/ui/switch/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { toast } from 'svelte-sonner';
	import Download from '@lucide/svelte/icons/download';
	import Upload from '@lucide/svelte/icons/upload';
	import Trash2 from '@lucide/svelte/icons/trash-2';

	interface Props {
		open: boolean;
	}

	let { open = $bindable() }: Props = $props();

	const i18n = getContext<I18nRune>('i18n');
	const settings = getContext<SettingsState>('settings');

	// Local draft state — loaded from settings when dialog opens
	let draftTheme = $state<ThemeName>(settings.theme);
	let draftSprache = $state<SupportedLocale>(settings.sprache);
	let draftKompaktansicht = $state(settings.kompaktansicht);
	let draftBenachrichtigungen = $state(settings.benachrichtigungen);
	let draftStandardAuditor = $state(settings.standardAuditor ?? '');
	let draftStandardAbteilung = $state(settings.standardAbteilung ?? '');

	let deleteConfirmOpen = $state(false);
	let activeTab = $state('global');

	// Sync draft state when dialog opens
	$effect(() => {
		if (open) {
			draftTheme = settings.theme;
			draftSprache = settings.sprache;
			draftKompaktansicht = settings.kompaktansicht;
			draftBenachrichtigungen = settings.benachrichtigungen;
			draftStandardAuditor = settings.standardAuditor ?? '';
			draftStandardAbteilung = settings.standardAbteilung ?? '';
			activeTab = 'global';
		}
	});

	function handleSave() {
		settings.apply({
			theme: draftTheme,
			sprache: draftSprache,
			kompaktansicht: draftKompaktansicht,
			benachrichtigungen: draftBenachrichtigungen,
			standardAuditor: draftStandardAuditor || undefined,
			standardAbteilung: draftStandardAbteilung || undefined
		});
		open = false;
	}

	function handleCancel() {
		open = false;
	}

	function handleExportData() {
		// Stub — full implementation wired in I03
		toast.success(i18n.t('importExport.exportSuccess'));
	}

	function handleImportData() {
		// Stub — full implementation wired in I03
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = '.json';
		input.click();
	}

	function handleDeleteAllData() {
		deleteConfirmOpen = true;
	}

	function confirmDeleteAllData() {
		deleteConfirmOpen = false;
		// Stub — full implementation wired in I03
		settings.reset();
		toast.success(i18n.t('settings.deleteSuccess'));
		open = false;
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="flex max-h-[90vh] w-full max-w-2xl flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
		<Dialog.Header class="border-b px-6 py-4">
			<Dialog.Title style="font-family: var(--font-display)">{i18n.t('settings.title')}</Dialog.Title>
		</Dialog.Header>

		<div class="flex-1 overflow-y-auto">
			<Tabs.Root bind:value={activeTab} class="flex flex-col gap-0">
				<div class="border-b px-6 pt-4">
					<Tabs.List class="w-full">
						<Tabs.Trigger value="global" class="flex-1">{i18n.t('settings.tabs.global')}</Tabs.Trigger>
						<Tabs.Trigger value="individual" class="flex-1">{i18n.t('settings.tabs.individual')}</Tabs.Trigger>
						<Tabs.Trigger value="data" class="flex-1">{i18n.t('settings.tabs.data')}</Tabs.Trigger>
					</Tabs.List>
				</div>

				<!-- Global Tab: Theme + Language -->
				<Tabs.Content value="global" class="px-6 py-5">
					<div class="space-y-6">
						<!-- Theme selector -->
						<div class="space-y-3">
							<Label class="text-sm font-semibold">{i18n.t('settings.theme')}</Label>
							<div class="grid grid-cols-6 gap-2 sm:grid-cols-9">
								{#each THEME_DEFINITIONS as theme (theme.name)}
									<button type="button" title={i18n.t(`settings.themes.${theme.name}`)} class="group flex flex-col items-center gap-1" onclick={() => (draftTheme = theme.name)}>
										<span
											class="block h-8 w-8 rounded-lg border-2 transition-all"
											style="background-color: {theme.previewColor}; border-color: {draftTheme === theme.name ? theme.previewColor : 'transparent'}; outline: {draftTheme ===
											theme.name
												? '2px solid ' + theme.previewColor
												: 'none'}; outline-offset: 2px; box-shadow: {draftTheme === theme.name ? '0 0 0 3px rgba(0,0,0,0.15)' : 'none'}"
										></span>
										<span class="text-muted-foreground max-w-[3rem] truncate text-center text-[0.6rem]">
											{i18n.t(`settings.themes.${theme.name}`)}
										</span>
									</button>
								{/each}
							</div>
						</div>

						<!-- Language selector -->
						<div class="space-y-2">
							<Label for="language-select" class="text-sm font-semibold">{i18n.t('settings.language')}</Label>
							<Select.Root type="single" bind:value={draftSprache as string}>
								<Select.Trigger id="language-select" class="w-full">
									{#if draftSprache}
										{i18n.t(`settings.languages.${draftSprache}`)}
									{:else}
										<span class="text-muted-foreground">{i18n.t('settings.language')}</span>
									{/if}
								</Select.Trigger>
								<Select.Content>
									{#each supportedLocaleValues as locale (locale)}
										<Select.Item value={locale}>{i18n.t(`settings.languages.${locale}`)}</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
						</div>
					</div>
				</Tabs.Content>

				<!-- Individual Tab: Compact view, Notifications, Defaults -->
				<Tabs.Content value="individual" class="px-6 py-5">
					<div class="space-y-5">
						<!-- Compact view switch -->
						<div class="flex items-center justify-between">
							<div class="space-y-0.5">
								<Label class="text-sm font-semibold">{i18n.t('settings.compactView')}</Label>
							</div>
							<Switch bind:checked={draftKompaktansicht} />
						</div>

						<!-- Notifications switch -->
						<div class="flex items-center justify-between">
							<div class="space-y-0.5">
								<Label class="text-sm font-semibold">{i18n.t('settings.notifications')}</Label>
							</div>
							<Switch bind:checked={draftBenachrichtigungen} />
						</div>

						<!-- Default auditor -->
						<div class="space-y-2">
							<Label for="default-auditor" class="text-sm font-semibold">{i18n.t('settings.defaultAuditor')}</Label>
							<Input id="default-auditor" bind:value={draftStandardAuditor} placeholder={i18n.t('settings.placeholders.defaultAuditor')} />
						</div>

						<!-- Default department -->
						<div class="space-y-2">
							<Label for="default-department" class="text-sm font-semibold">{i18n.t('settings.defaultDepartment')}</Label>
							<Input id="default-department" bind:value={draftStandardAbteilung} placeholder={i18n.t('settings.placeholders.defaultDepartment')} />
						</div>
					</div>
				</Tabs.Content>

				<!-- Data Management Tab -->
				<Tabs.Content value="data" class="px-6 py-5">
					<div class="space-y-4">
						<!-- Export -->
						<div class="bg-muted/40 flex items-center justify-between rounded-lg p-4">
							<div class="space-y-0.5">
								<p class="text-sm font-semibold">{i18n.t('settings.exportData')}</p>
								<p class="text-muted-foreground text-xs">{i18n.t('settings.exportDataDesc')}</p>
							</div>
							<Button variant="outline" onclick={handleExportData}>
								<Download class="mr-2 h-4 w-4" />
								{i18n.t('common.export')}
							</Button>
						</div>

						<!-- Import -->
						<div class="bg-muted/40 flex items-center justify-between rounded-lg p-4">
							<div class="space-y-0.5">
								<p class="text-sm font-semibold">{i18n.t('settings.importData')}</p>
								<p class="text-muted-foreground text-xs">{i18n.t('settings.importDataDesc')}</p>
							</div>
							<Button variant="outline" onclick={handleImportData}>
								<Upload class="mr-2 h-4 w-4" />
								{i18n.t('common.import')}
							</Button>
						</div>

						<!-- Delete all data -->
						<div class="border-destructive/30 flex items-center justify-between rounded-lg border p-4">
							<div class="space-y-0.5">
								<p class="text-destructive text-sm font-semibold">{i18n.t('settings.deleteAllData')}</p>
								<p class="text-muted-foreground text-xs">{i18n.t('settings.deleteAllDataDesc')}</p>
							</div>
							<Button variant="destructive" onclick={handleDeleteAllData}>
								<Trash2 class="mr-2 h-4 w-4" />
								{i18n.t('common.delete')}
							</Button>
						</div>
					</div>
				</Tabs.Content>
			</Tabs.Root>
		</div>

		<Dialog.Footer class="border-t px-6 py-4">
			<Button variant="outline" onclick={handleCancel}>{i18n.t('common.cancel')}</Button>
			<Button onclick={handleSave}>{i18n.t('common.save')}</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Delete confirmation alert dialog -->
<AlertDialog.Root bind:open={deleteConfirmOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>{i18n.t('settings.deleteConfirmTitle')}</AlertDialog.Title>
			<AlertDialog.Description>{i18n.t('settings.deleteConfirmDescription')}</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>{i18n.t('common.cancel')}</AlertDialog.Cancel>
			<AlertDialog.Action onclick={confirmDeleteAllData}>{i18n.t('common.confirm')}</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
