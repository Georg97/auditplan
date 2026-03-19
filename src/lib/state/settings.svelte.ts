import type { AppSettings } from '$lib/types/settings';
import { DEFAULT_SETTINGS } from '$lib/types/settings';

export const ACCENT_PRESETS: Record<AppSettings['accentPreset'], { brand: string; accentMid: string; accentDeep: string }> = {
	default: {
		brand: '0.65 0.15 195',
		accentMid: '0.35 0.08 220',
		accentDeep: '0.25 0.06 230'
	},
	indigo: {
		brand: '0.55 0.2 265',
		accentMid: '0.35 0.12 270',
		accentDeep: '0.25 0.1 275'
	},
	violet: {
		brand: '0.58 0.22 295',
		accentMid: '0.35 0.14 300',
		accentDeep: '0.25 0.1 305'
	},
	rose: {
		brand: '0.6 0.2 10',
		accentMid: '0.38 0.12 15',
		accentDeep: '0.28 0.1 20'
	},
	emerald: {
		brand: '0.65 0.18 160',
		accentMid: '0.38 0.1 165',
		accentDeep: '0.28 0.08 170'
	},
	amber: {
		brand: '0.75 0.15 75',
		accentMid: '0.42 0.1 60',
		accentDeep: '0.32 0.08 55'
	},
	slate: {
		brand: '0.55 0.02 260',
		accentMid: '0.35 0.02 260',
		accentDeep: '0.25 0.02 260'
	}
};

export class SettingsState {
	settings = $state<AppSettings>({ ...DEFAULT_SETTINGS });
	loaded = $state(false);

	load(data: AppSettings) {
		this.settings = { ...DEFAULT_SETTINGS, ...data };
		this.loaded = true;
		this.applyAccent();
	}

	update(partial: Partial<AppSettings>) {
		this.settings = { ...this.settings, ...partial };
		if (partial.accentPreset !== undefined) {
			this.applyAccent();
		}
	}

	reset() {
		this.settings = { ...DEFAULT_SETTINGS };
		this.applyAccent();
	}

	private applyAccent() {
		if (typeof document === 'undefined') return;
		const preset = ACCENT_PRESETS[this.settings.accentPreset] ?? ACCENT_PRESETS.default;
		const html = document.documentElement;
		html.style.setProperty('--brand', preset.brand);
		html.style.setProperty('--accent-mid', preset.accentMid);
		html.style.setProperty('--accent-deep', preset.accentDeep);
	}
}
