import type { SupportedLocale } from '$lib/i18n/i18n.svelte';
import { type ThemeName, type IndividualColor, type AppSettings, defaultSettings } from '$lib/types/settings';

export class SettingsState {
	theme = $state<ThemeName>(defaultSettings.theme);
	individualColors = $state<AppSettings['individualColors']>({
		...defaultSettings.individualColors
	});
	kompaktansicht = $state(defaultSettings.kompaktansicht);
	benachrichtigungen = $state(defaultSettings.benachrichtigungen);
	sprache = $state<SupportedLocale>(defaultSettings.sprache);
	standardAuditor = $state(defaultSettings.standardAuditor);
	standardAbteilung = $state(defaultSettings.standardAbteilung);
	auditplanLogo = $state<string | null>(defaultSettings.auditplanLogo);

	apply(settings: AppSettings) {
		this.theme = settings.theme;
		this.individualColors = { ...settings.individualColors };
		this.kompaktansicht = settings.kompaktansicht;
		this.benachrichtigungen = settings.benachrichtigungen;
		this.sprache = settings.sprache;
		this.standardAuditor = settings.standardAuditor;
		this.standardAbteilung = settings.standardAbteilung;
		this.auditplanLogo = settings.auditplanLogo;
	}

	toJSON(): AppSettings {
		return {
			theme: this.theme,
			individualColors: { ...this.individualColors },
			kompaktansicht: this.kompaktansicht,
			benachrichtigungen: this.benachrichtigungen,
			sprache: this.sprache,
			standardAuditor: this.standardAuditor,
			standardAbteilung: this.standardAbteilung,
			auditplanLogo: this.auditplanLogo
		};
	}
}
