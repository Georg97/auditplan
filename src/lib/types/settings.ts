import { z } from 'zod';

export const themeNameValues = [
	'default',
	'dark',
	'light',
	'green',
	'blue',
	'red',
	'purple',
	'orange',
	'cyan',
	'pink',
	'yellow',
	'indigo',
	'teal',
	'rose',
	'emerald',
	'sky',
	'slate'
] as const;
export type ThemeName = (typeof themeNameValues)[number];
export const themeNameSchema = z.enum(themeNameValues);

export const supportedLocaleValues = ['de', 'en', 'fr', 'es', 'it', 'nl', 'pt', 'pl', 'ru', 'tr'] as const;
export type SupportedLocale = (typeof supportedLocaleValues)[number];
export const supportedLocaleSchema = z.enum(supportedLocaleValues);

export const appSettingsSchema = z.object({
	theme: themeNameSchema.default('default'),
	kompaktansicht: z.boolean().default(false),
	benachrichtigungen: z.boolean().default(true),
	sprache: supportedLocaleSchema.default('de'),
	standardAuditor: z.string().optional(),
	standardAbteilung: z.string().optional()
});

export type AppSettings = z.infer<typeof appSettingsSchema>;
