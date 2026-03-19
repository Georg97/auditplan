<script lang="ts">
	import { getContext } from 'svelte';
	import type { I18nRune } from '$lib/i18n/i18n.svelte';
	import { LOCALE_LABELS, SUPPORTED_LOCALES } from '$lib/i18n/i18n.svelte';
	import type { SupportedLocale } from '$lib/i18n/i18n.svelte';
	import type { SettingsState } from '$lib/state/settings.svelte';
	import { ACCENT_PRESETS } from '$lib/state/settings.svelte';
	import type { AppSettings } from '$lib/types/settings';
	import * as Card from '$lib/components/ui/card';
	import * as Select from '$lib/components/ui/select';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Button } from '$lib/components/ui/button';
	import { Switch } from '$lib/components/ui/switch';
	import { Input } from '$lib/components/ui/input';
	import { setMode, resetMode, userPrefersMode } from 'mode-watcher';
	import { toast } from 'svelte-sonner';
	import Sun from '@lucide/svelte/icons/sun';
	import Moon from '@lucide/svelte/icons/moon';
	import Monitor from '@lucide/svelte/icons/monitor';
	import Palette from '@lucide/svelte/icons/palette';
	import Eye from '@lucide/svelte/icons/eye';
	import Languages from '@lucide/svelte/icons/languages';
	import UserCog from '@lucide/svelte/icons/user-cog';
	import Database from '@lucide/svelte/icons/database';
	import Download from '@lucide/svelte/icons/download';
	import Upload from '@lucide/svelte/icons/upload';
	import Trash2 from '@lucide/svelte/icons/trash-2';

	const i18n = getContext<I18nRune>('i18n');
	const settings = getContext<SettingsState>('settings');

	let deleteDialogOpen = $state(false);

	const accentPresetKeys = Object.keys(ACCENT_PRESETS) as AppSettings['accentPreset'][];

	const accentPresetLabels: Record<AppSettings['accentPreset'], string> = $derived({
		default: i18n.t('settings.accentDefault'),
		indigo: i18n.t('settings.accentIndigo'),
		violet: i18n.t('settings.accentViolet'),
		rose: i18n.t('settings.accentRose'),
		emerald: i18n.t('settings.accentEmerald'),
		amber: i18n.t('settings.accentAmber'),
		slate: i18n.t('settings.accentSlate')
	});

	const colorModeValue = $derived(userPrefersMode.current ?? 'system');

	function handleColorMode(mode: 'light' | 'dark' | 'system') {
		if (mode === 'system') {
			resetMode();
		} else {
			setMode(mode);
		}
		settings.update({ colorMode: mode });
	}

	function handleAccentChange(preset: AppSettings['accentPreset']) {
		settings.update({ accentPreset: preset });
	}

	function handleCompactView(checked: boolean) {
		settings.update({ kompaktansicht: checked });
	}

	function handleNotifications(checked: boolean) {
		settings.update({ benachrichtigungen: checked });
	}

	function handleLanguageChange(value: string) {
		const locale = value as SupportedLocale;
		i18n.changeLocale(locale);
		settings.update({ sprache: locale });
	}

	function handleAuditorChange(e: Event) {
		const target = e.target as HTMLInputElement;
		settings.update({ standardAuditor: target.value });
	}

	function handleDepartmentChange(e: Event) {
		const target = e.target as HTMLInputElement;
		settings.update({ standardAbteilung: target.value });
	}

	function handleExport() {
		toast.success(i18n.t('settings.exportSuccess'));
	}

	function handleImport() {
		toast.success(i18n.t('settings.importSuccess'));
	}

	function handleDeleteAll() {
		deleteDialogOpen = false;
		settings.reset();
		toast.success(i18n.t('settings.deleteAllSuccess'));
	}
</script>

<div class="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
	<h1 class="text-2xl font-bold" style="font-family: var(--font-display)">
		{i18n.t('settings.title')}
	</h1>

	<div class="mt-6 space-y-6">
		<!-- Appearance -->
		<Card.Root>
			<Card.Header>
				<div class="flex items-center gap-2">
					<Palette class="text-muted-foreground size-5" />
					<Card.Title>{i18n.t('settings.appearance')}</Card.Title>
				</div>
			</Card.Header>
			<Card.Content class="space-y-6">
				<!-- Color Mode -->
				<div class="space-y-2">
					<p class="text-sm font-medium">{i18n.t('settings.colorMode')}</p>
					<div class="flex gap-2">
						<Button variant={colorModeValue === 'light' ? 'default' : 'outline'} size="sm" onclick={() => handleColorMode('light')}>
							<Sun class="mr-1.5 size-4" />
							{i18n.t('settings.lightMode')}
						</Button>
						<Button variant={colorModeValue === 'dark' ? 'default' : 'outline'} size="sm" onclick={() => handleColorMode('dark')}>
							<Moon class="mr-1.5 size-4" />
							{i18n.t('settings.darkMode')}
						</Button>
						<Button variant={colorModeValue === 'system' ? 'default' : 'outline'} size="sm" onclick={() => handleColorMode('system')}>
							<Monitor class="mr-1.5 size-4" />
							{i18n.t('settings.systemMode')}
						</Button>
					</div>
				</div>

				<!-- Accent Color -->
				<div class="space-y-2">
					<p class="text-sm font-medium">{i18n.t('settings.accent')}</p>
					<div class="flex flex-wrap gap-3">
						{#each accentPresetKeys as preset}
							{@const colors = ACCENT_PRESETS[preset]}
							<button class="flex flex-col items-center gap-1.5" onclick={() => handleAccentChange(preset)} aria-label={accentPresetLabels[preset]}>
								<span
									class="block size-8 rounded-full border-2 transition-all {settings.settings.accentPreset === preset
										? 'border-foreground ring-ring ring-offset-background scale-110 ring-2 ring-offset-2'
										: 'hover:border-muted-foreground/50 border-transparent'}"
									style="background-color: oklch({colors.brand})"
								></span>
								<span class="text-muted-foreground text-xs {settings.settings.accentPreset === preset ? 'text-foreground font-medium' : ''}">
									{accentPresetLabels[preset]}
								</span>
							</button>
						{/each}
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- View -->
		<Card.Root>
			<Card.Header>
				<div class="flex items-center gap-2">
					<Eye class="text-muted-foreground size-5" />
					<Card.Title>{i18n.t('settings.view')}</Card.Title>
				</div>
			</Card.Header>
			<Card.Content class="space-y-4">
				<div class="flex items-center justify-between">
					<div class="space-y-0.5">
						<p class="text-sm font-medium">{i18n.t('settings.compactView')}</p>
						<p class="text-muted-foreground text-xs">
							{i18n.t('settings.compactViewDesc')}
						</p>
					</div>
					<Switch checked={settings.settings.kompaktansicht} onCheckedChange={handleCompactView} />
				</div>
				<div class="border-border border-t"></div>
				<div class="flex items-center justify-between">
					<div class="space-y-0.5">
						<p class="text-sm font-medium">{i18n.t('settings.notifications')}</p>
						<p class="text-muted-foreground text-xs">
							{i18n.t('settings.notificationsDesc')}
						</p>
					</div>
					<Switch checked={settings.settings.benachrichtigungen} onCheckedChange={handleNotifications} />
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Language -->
		<Card.Root>
			<Card.Header>
				<div class="flex items-center gap-2">
					<Languages class="text-muted-foreground size-5" />
					<Card.Title>{i18n.t('settings.language')}</Card.Title>
				</div>
				<Card.Description>{i18n.t('settings.languageDesc')}</Card.Description>
			</Card.Header>
			<Card.Content>
				<Select.Root type="single" value={settings.settings.sprache} onValueChange={handleLanguageChange}>
					<Select.Trigger class="w-full sm:w-64">
						{LOCALE_LABELS[settings.settings.sprache]}
					</Select.Trigger>
					<Select.Content>
						{#each SUPPORTED_LOCALES as locale}
							<Select.Item value={locale} label={LOCALE_LABELS[locale]}>
								{LOCALE_LABELS[locale]}
							</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</Card.Content>
		</Card.Root>

		<!-- Defaults -->
		<Card.Root>
			<Card.Header>
				<div class="flex items-center gap-2">
					<UserCog class="text-muted-foreground size-5" />
					<Card.Title>{i18n.t('settings.defaults')}</Card.Title>
				</div>
			</Card.Header>
			<Card.Content>
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div class="space-y-2">
						<label for="standard-auditor" class="text-sm font-medium">
							{i18n.t('settings.defaultAuditor')}
						</label>
						<Input id="standard-auditor" value={settings.settings.standardAuditor} placeholder={i18n.t('settings.standardAuditorPlaceholder')} onchange={handleAuditorChange} />
					</div>
					<div class="space-y-2">
						<label for="standard-department" class="text-sm font-medium">
							{i18n.t('settings.defaultDepartment')}
						</label>
						<Input
							id="standard-department"
							value={settings.settings.standardAbteilung}
							placeholder={i18n.t('settings.standardDepartmentPlaceholder')}
							onchange={handleDepartmentChange}
						/>
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Data Management -->
		<Card.Root>
			<Card.Header>
				<div class="flex items-center gap-2">
					<Database class="text-muted-foreground size-5" />
					<Card.Title>{i18n.t('settings.dataManagement')}</Card.Title>
				</div>
				<Card.Description>{i18n.t('settings.dataManagementDesc')}</Card.Description>
			</Card.Header>
			<Card.Content>
				<div class="flex flex-wrap gap-3">
					<Button variant="outline" onclick={handleExport}>
						<Download class="mr-1.5 size-4" />
						{i18n.t('settings.exportAll')}
					</Button>
					<Button variant="outline" onclick={handleImport}>
						<Upload class="mr-1.5 size-4" />
						{i18n.t('settings.importAll')}
					</Button>

					<AlertDialog.Root bind:open={deleteDialogOpen}>
						<AlertDialog.Trigger>
							{#snippet child({ props })}
								<Button variant="destructive" {...props}>
									<Trash2 class="mr-1.5 size-4" />
									{i18n.t('settings.deleteAll')}
								</Button>
							{/snippet}
						</AlertDialog.Trigger>
						<AlertDialog.Content>
							<AlertDialog.Header>
								<AlertDialog.Title>
									{i18n.t('settings.deleteAllConfirmTitle')}
								</AlertDialog.Title>
								<AlertDialog.Description>
									{i18n.t('settings.deleteAllConfirmMessage')}
								</AlertDialog.Description>
							</AlertDialog.Header>
							<AlertDialog.Footer>
								<AlertDialog.Cancel>{i18n.t('common.cancel')}</AlertDialog.Cancel>
								<AlertDialog.Action onclick={handleDeleteAll}>
									{i18n.t('common.confirm')}
								</AlertDialog.Action>
							</AlertDialog.Footer>
						</AlertDialog.Content>
					</AlertDialog.Root>
				</div>
			</Card.Content>
		</Card.Root>
	</div>
</div>
