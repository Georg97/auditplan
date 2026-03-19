import type { SupportedLocale } from '$lib/i18n/i18n.svelte';

export interface AppSettings {
	colorMode: 'light' | 'dark' | 'system';
	accentPreset: 'default' | 'indigo' | 'violet' | 'rose' | 'emerald' | 'amber' | 'slate';
	kompaktansicht: boolean;
	benachrichtigungen: boolean;
	sprache: SupportedLocale;
	standardAuditor: string;
	standardAbteilung: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
	colorMode: 'system',
	accentPreset: 'default',
	kompaktansicht: false,
	benachrichtigungen: true,
	sprache: 'de',
	standardAuditor: '',
	standardAbteilung: ''
};
