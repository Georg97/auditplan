import { describe, it, expect } from 'vitest';
import { appSettingsSchema, themeNameSchema, supportedLocaleSchema, themeNameValues, supportedLocaleValues } from '$lib/types';
import { getSettings, saveSettings, exportAllData, importAllData, deleteAllData } from './settings.remote';

describe('appSettingsSchema validation', () => {
	it('accepts valid full settings object', () => {
		const result = appSettingsSchema.safeParse({
			theme: 'default',
			kompaktansicht: false,
			benachrichtigungen: true,
			sprache: 'de',
			standardAuditor: 'Max Mustermann',
			standardAbteilung: 'Qualitätsmanagement'
		});
		expect(result.success).toBe(true);
	});

	it('applies defaults when all fields are omitted', () => {
		const result = appSettingsSchema.safeParse({});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.theme).toBe('default');
			expect(result.data.kompaktansicht).toBe(false);
			expect(result.data.benachrichtigungen).toBe(true);
			expect(result.data.sprache).toBe('de');
		}
	});

	it('defaults theme to "default" when omitted', () => {
		const result = appSettingsSchema.safeParse({ sprache: 'en' });
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.theme).toBe('default');
		}
	});

	it('defaults benachrichtigungen to true when omitted', () => {
		const result = appSettingsSchema.safeParse({});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.benachrichtigungen).toBe(true);
		}
	});

	it('defaults kompaktansicht to false when omitted', () => {
		const result = appSettingsSchema.safeParse({});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.kompaktansicht).toBe(false);
		}
	});

	it('accepts optional standardAuditor and standardAbteilung', () => {
		const result = appSettingsSchema.safeParse({
			standardAuditor: 'Erika Muster',
			standardAbteilung: 'IT'
		});
		expect(result.success).toBe(true);
	});

	it('accepts missing optional string fields', () => {
		const result = appSettingsSchema.safeParse({
			theme: 'ocean',
			kompaktansicht: true,
			benachrichtigungen: false,
			sprache: 'en'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.standardAuditor).toBeUndefined();
			expect(result.data.standardAbteilung).toBeUndefined();
		}
	});
});

describe('themeNameSchema validation', () => {
	it('accepts all 18 defined theme values', () => {
		for (const theme of themeNameValues) {
			const result = themeNameSchema.safeParse(theme);
			expect(result.success).toBe(true);
		}
	});

	it('contains exactly 18 theme options', () => {
		expect(themeNameValues).toHaveLength(18);
	});

	it('rejects unknown theme value', () => {
		const result = themeNameSchema.safeParse('unknown-theme');
		expect(result.success).toBe(false);
	});

	it('includes required theme names', () => {
		const names = [...themeNameValues];
		expect(names).toContain('default');
		expect(names).toContain('ocean');
		expect(names).toContain('forest');
		expect(names).toContain('sunset');
		expect(names).toContain('midnight');
		expect(names).toContain('rose');
		expect(names).toContain('amber');
		expect(names).toContain('emerald');
		expect(names).toContain('violet');
		expect(names).toContain('slate');
		expect(names).toContain('stone');
		expect(names).toContain('zinc');
		expect(names).toContain('neutral');
		expect(names).toContain('red');
		expect(names).toContain('orange');
		expect(names).toContain('sky');
		expect(names).toContain('teal');
		expect(names).toContain('indigo');
	});

	it('rejects empty string', () => {
		const result = themeNameSchema.safeParse('');
		expect(result.success).toBe(false);
	});
});

describe('supportedLocaleSchema validation', () => {
	it('accepts all 10 supported locales', () => {
		for (const locale of supportedLocaleValues) {
			const result = supportedLocaleSchema.safeParse(locale);
			expect(result.success).toBe(true);
		}
	});

	it('contains exactly 10 locales', () => {
		expect(supportedLocaleValues).toHaveLength(10);
	});

	it('rejects unsupported locale', () => {
		const result = supportedLocaleSchema.safeParse('ja');
		expect(result.success).toBe(false);
	});

	it('includes all required language codes', () => {
		const locales = [...supportedLocaleValues];
		expect(locales).toContain('de');
		expect(locales).toContain('en');
		expect(locales).toContain('fr');
		expect(locales).toContain('es');
		expect(locales).toContain('it');
		expect(locales).toContain('nl');
		expect(locales).toContain('pt');
		expect(locales).toContain('pl');
		expect(locales).toContain('ru');
		expect(locales).toContain('tr');
	});

	it('rejects empty string', () => {
		const result = supportedLocaleSchema.safeParse('');
		expect(result.success).toBe(false);
	});
});

describe('settings remote function exports', () => {
	it('getSettings is a function', () => {
		expect(typeof getSettings).toBe('function');
	});

	it('saveSettings is a function', () => {
		expect(typeof saveSettings).toBe('function');
	});

	it('exportAllData is a function', () => {
		expect(typeof exportAllData).toBe('function');
	});

	it('importAllData is a function', () => {
		expect(typeof importAllData).toBe('function');
	});

	it('deleteAllData is a function', () => {
		expect(typeof deleteAllData).toBe('function');
	});
});
