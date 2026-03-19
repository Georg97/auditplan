import { z } from 'zod';

export const themeNameValues = [
	'default',
	'ocean',
	'forest',
	'sunset',
	'midnight',
	'rose',
	'amber',
	'emerald',
	'violet',
	'slate',
	'stone',
	'zinc',
	'neutral',
	'red',
	'orange',
	'sky',
	'teal',
	'indigo'
] as const;
export type ThemeName = (typeof themeNameValues)[number];
export const themeNameSchema = z.enum(themeNameValues);

export interface ThemeDefinition {
	name: ThemeName;
	previewColor: string;
	gradient: [string, string];
}

export const THEME_DEFINITIONS: ThemeDefinition[] = [
	{ name: 'default', previewColor: '#667eea', gradient: ['#667eea', '#764ba2'] },
	{ name: 'ocean', previewColor: '#0ea5e9', gradient: ['#0ea5e9', '#0369a1'] },
	{ name: 'forest', previewColor: '#22c55e', gradient: ['#22c55e', '#15803d'] },
	{ name: 'sunset', previewColor: '#f97316', gradient: ['#f97316', '#dc2626'] },
	{ name: 'midnight', previewColor: '#1e293b', gradient: ['#1e293b', '#0f172a'] },
	{ name: 'rose', previewColor: '#f43f5e', gradient: ['#f43f5e', '#be123c'] },
	{ name: 'amber', previewColor: '#f59e0b', gradient: ['#f59e0b', '#b45309'] },
	{ name: 'emerald', previewColor: '#10b981', gradient: ['#10b981', '#065f46'] },
	{ name: 'violet', previewColor: '#8b5cf6', gradient: ['#8b5cf6', '#5b21b6'] },
	{ name: 'slate', previewColor: '#64748b', gradient: ['#64748b', '#334155'] },
	{ name: 'stone', previewColor: '#78716c', gradient: ['#78716c', '#44403c'] },
	{ name: 'zinc', previewColor: '#71717a', gradient: ['#71717a', '#3f3f46'] },
	{ name: 'neutral', previewColor: '#737373', gradient: ['#737373', '#404040'] },
	{ name: 'red', previewColor: '#ef4444', gradient: ['#ef4444', '#991b1b'] },
	{ name: 'orange', previewColor: '#fb923c', gradient: ['#fb923c', '#c2410c'] },
	{ name: 'sky', previewColor: '#38bdf8', gradient: ['#38bdf8', '#0284c7'] },
	{ name: 'teal', previewColor: '#14b8a6', gradient: ['#14b8a6', '#0f766e'] },
	{ name: 'indigo', previewColor: '#6366f1', gradient: ['#6366f1', '#3730a3'] }
];

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
