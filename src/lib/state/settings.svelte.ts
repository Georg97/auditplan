import type { AppSettings, ThemeName, SupportedLocale } from '$lib/types';

const defaults: AppSettings = {
	theme: 'default',
	kompaktansicht: false,
	benachrichtigungen: true,
	sprache: 'de',
	standardAuditor: undefined,
	standardAbteilung: undefined
};

export class SettingsState {
	theme = $state<ThemeName>(defaults.theme);
	kompaktansicht = $state(defaults.kompaktansicht);
	benachrichtigungen = $state(defaults.benachrichtigungen);
	sprache = $state<SupportedLocale>(defaults.sprache);
	standardAuditor = $state<string | undefined>(defaults.standardAuditor);
	standardAbteilung = $state<string | undefined>(defaults.standardAbteilung);

	apply(settings: Partial<AppSettings>) {
		if (settings.theme !== undefined) this.theme = settings.theme;
		if (settings.kompaktansicht !== undefined) this.kompaktansicht = settings.kompaktansicht;
		if (settings.benachrichtigungen !== undefined) this.benachrichtigungen = settings.benachrichtigungen;
		if (settings.sprache !== undefined) this.sprache = settings.sprache;
		if (settings.standardAuditor !== undefined) this.standardAuditor = settings.standardAuditor;
		if (settings.standardAbteilung !== undefined) this.standardAbteilung = settings.standardAbteilung;
	}

	toJSON(): AppSettings {
		return {
			theme: this.theme,
			kompaktansicht: this.kompaktansicht,
			benachrichtigungen: this.benachrichtigungen,
			sprache: this.sprache,
			standardAuditor: this.standardAuditor,
			standardAbteilung: this.standardAbteilung
		};
	}

	reset() {
		this.apply(defaults);
	}
}
