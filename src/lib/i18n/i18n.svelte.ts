import i18next from 'i18next';

export const SUPPORTED_LOCALES = ['de', 'en', 'fr', 'es', 'it', 'nl', 'pt', 'pl', 'ru', 'tr'] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const LOCALE_LABELS: Record<SupportedLocale, string> = {
	de: 'Deutsch',
	en: 'English',
	fr: 'Français',
	es: 'Español',
	it: 'Italiano',
	nl: 'Nederlands',
	pt: 'Português',
	pl: 'Polski',
	ru: 'Русский',
	tr: 'Türkçe'
};

export class I18nRune {
	locale = $state<SupportedLocale>('de');
	ready = $state(false);

	async init() {
		const de = await fetch('/locales/de.json').then((r) => r.json());
		await i18next.init({
			lng: 'de',
			fallbackLng: 'de',
			resources: { de: { translation: de } },
			interpolation: { escapeValue: false }
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
		return i18next.t(key, params) ?? key;
	}
}
