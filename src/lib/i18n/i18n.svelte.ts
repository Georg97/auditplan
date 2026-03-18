import i18next from 'i18next';

export type SupportedLocale = 'de' | 'en' | 'fr' | 'es' | 'it' | 'nl' | 'pt' | 'pl' | 'ru' | 'tr';

export class I18nRune {
	locale = $state<SupportedLocale>('de');
	ready = $state(false);

	async init() {
		const de = await fetch('/locales/de.json').then((r) => r.json());
		await i18next.init({
			lng: 'de',
			fallbackLng: 'de',
			interpolation: { escapeValue: false },
			resources: { de: { translation: de } }
		});
		this.ready = true;
	}

	async changeLocale(lang: SupportedLocale) {
		if (!i18next.hasResourceBundle(lang, 'translation')) {
			const data = await fetch(`/locales/${lang}.json`).then((r) => r.json());
			i18next.addResourceBundle(lang, 'translation', data);
		}
		await i18next.changeLanguage(lang);
		this.locale = lang;
	}

	t(key: string, params?: Record<string, unknown>): string {
		return String(i18next.t(key, params as never) ?? key);
	}
}
