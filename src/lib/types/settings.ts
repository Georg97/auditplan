import type { SupportedLocale } from '$lib/i18n/i18n.svelte';

export const themeNames = [
	'default',
	'dark',
	'light',
	'blue',
	'green',
	'red',
	'purple',
	'orange',
	'teal',
	'pink',
	'indigo',
	'cyan',
	'amber',
	'emerald',
	'rose',
	'violet',
	'slate',
	'zinc'
] as const;
export type ThemeName = (typeof themeNames)[number];

export const individualColorOptions = ['inherit', 'default', 'blue', 'green', 'red', 'purple', 'orange'] as const;
export type IndividualColor = (typeof individualColorOptions)[number];

export interface AppSettings {
	theme: ThemeName;
	individualColors: {
		header: IndividualColor;
		nav: IndividualColor;
		card: IndividualColor;
	};
	kompaktansicht: boolean;
	benachrichtigungen: boolean;
	sprache: SupportedLocale;
	standardAuditor: string;
	standardAbteilung: string;
	auditplanLogo: string | null;
}

export const defaultSettings: AppSettings = {
	theme: 'default',
	individualColors: {
		header: 'inherit',
		nav: 'inherit',
		card: 'inherit'
	},
	kompaktansicht: false,
	benachrichtigungen: true,
	sprache: 'de',
	standardAuditor: '',
	standardAbteilung: '',
	auditplanLogo: null
};
