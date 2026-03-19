<script lang="ts">
	import { getContext } from 'svelte';
	import type { I18nRune } from '$lib/i18n/i18n.svelte';
	import Settings from '@lucide/svelte/icons/settings';

	interface Props {
		onSettingsClick: () => void;
	}

	let { onSettingsClick }: Props = $props();
	const i18n = getContext<I18nRune>('i18n');
</script>

<header class="header-gradient relative overflow-hidden px-6 py-6 md:px-8">
	<div class="grain pointer-events-none absolute inset-0 opacity-[0.03]"></div>

	<div class="relative z-10 flex items-center justify-between">
		<!-- Left SVG: ISO Certificate with Magnifying Glass -->
		<div class="hidden flex-shrink-0 lg:block" style="width: 260px; height: 220px">
			<svg viewBox="0 0 280 250" xmlns="http://www.w3.org/2000/svg" class="h-full w-full">
				<defs>
					<linearGradient id="docGrad" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0%" stop-color="#ffffff" />
						<stop offset="100%" stop-color="#e8ecf4" />
					</linearGradient>
					<linearGradient id="lupeGrad" x1="0" y1="0" x2="1" y2="1">
						<stop offset="0%" stop-color="#ffd700" />
						<stop offset="100%" stop-color="#f0a500" />
					</linearGradient>
					<filter id="docShadow">
						<feDropShadow dx="3" dy="4" stdDeviation="4" flood-opacity="0.25" />
					</filter>
					<filter id="lupeShadow">
						<feDropShadow dx="2" dy="2" stdDeviation="3" flood-opacity="0.3" />
					</filter>
				</defs>

				<!-- Document -->
				<g filter="url(#docShadow)">
					<rect x="50" y="30" width="160" height="200" rx="8" fill="url(#docGrad)" stroke="#c0c8d8" stroke-width="1.5" />
					<!-- Folded corner -->
					<path d="M180 30 L210 60 L180 60 Z" fill="#d0d8e8" stroke="#c0c8d8" stroke-width="1" />
					<!-- ISO text -->
					<text x="130" y="80" text-anchor="middle" font-size="22" font-weight="bold" fill="#4a5568" font-family="sans-serif">ISO</text>
					<!-- Certificate lines -->
					<rect x="75" y="95" width="110" height="3" rx="1.5" fill="#a0aec0" opacity="0.6" />
					<rect x="75" y="108" width="90" height="3" rx="1.5" fill="#a0aec0" opacity="0.4" />
					<rect x="75" y="121" width="100" height="3" rx="1.5" fill="#a0aec0" opacity="0.4" />
					<!-- Checkmarks -->
					<g fill="none" stroke="#48bb78" stroke-width="2.5" stroke-linecap="round">
						<path d="M80 145 L86 151 L96 139" />
						<path d="M80 165 L86 171 L96 159" />
						<path d="M80 185 L86 191 L96 179" />
					</g>
					<rect x="105" y="143" width="80" height="3" rx="1.5" fill="#a0aec0" opacity="0.5" />
					<rect x="105" y="163" width="65" height="3" rx="1.5" fill="#a0aec0" opacity="0.5" />
					<rect x="105" y="183" width="75" height="3" rx="1.5" fill="#a0aec0" opacity="0.5" />
					<!-- Seal -->
					<circle cx="170" cy="205" r="14" fill="none" stroke="#667eea" stroke-width="2" opacity="0.5" />
					<circle cx="170" cy="205" r="9" fill="#667eea" opacity="0.15" />
				</g>

				<!-- Magnifying Glass -->
				<g filter="url(#lupeShadow)">
					<circle cx="195" cy="75" r="28" fill="none" stroke="url(#lupeGrad)" stroke-width="5" />
					<circle cx="195" cy="75" r="22" fill="rgba(255,255,255,0.15)" />
					<line x1="215" y1="96" x2="238" y2="119" stroke="url(#lupeGrad)" stroke-width="6" stroke-linecap="round" />
					<!-- Glare -->
					<path d="M182 60 Q186 55 192 58" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="2" stroke-linecap="round" />
				</g>
			</svg>
		</div>

		<!-- Center: Title -->
		<div class="flex-1 text-center text-white">
			<h1 class="title-3d text-[1.8rem] leading-tight font-bold md:text-[2.5rem]" style="font-family: var(--font-display)">
				{i18n.t('header.title')}
			</h1>
			<p class="subtitle mt-3 text-sm md:text-[1.1rem]">{i18n.t('header.subtitle1')}</p>
			<p class="subtitle mt-1 text-sm md:text-[1.1rem]">{i18n.t('header.subtitle2')}</p>
		</div>

		<!-- Right SVG: Clipboard with Progress Bars -->
		<div class="hidden flex-shrink-0 lg:block" style="width: 260px; height: 220px">
			<svg viewBox="0 0 280 250" xmlns="http://www.w3.org/2000/svg" class="h-full w-full">
				<defs>
					<linearGradient id="clipGrad" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0%" stop-color="#f7f8fc" />
						<stop offset="100%" stop-color="#e2e6f0" />
					</linearGradient>
					<filter id="clipShadow">
						<feDropShadow dx="3" dy="4" stdDeviation="4" flood-opacity="0.25" />
					</filter>
				</defs>

				<!-- Clipboard body -->
				<g filter="url(#clipShadow)">
					<rect x="60" y="40" width="160" height="195" rx="10" fill="url(#clipGrad)" stroke="#b8c4d8" stroke-width="1.5" />
					<!-- Clip mechanism -->
					<rect x="110" y="28" width="60" height="24" rx="6" fill="#8892a8" />
					<rect x="120" y="34" width="40" height="12" rx="4" fill="#a0aec0" />
				</g>

				<!-- ISO 9001 bar -->
				<text x="78" y="82" font-size="9" fill="#4a5568" font-family="sans-serif">ISO 9001</text>
				<rect x="135" y="73" width="72" height="10" rx="5" fill="#e2e8f0" />
				<rect x="135" y="73" width="62" height="10" rx="5" fill="#48bb78" />

				<!-- ISO 14001 bar -->
				<text x="78" y="105" font-size="9" fill="#4a5568" font-family="sans-serif">ISO 14001</text>
				<rect x="135" y="96" width="72" height="10" rx="5" fill="#e2e8f0" />
				<rect x="135" y="96" width="50" height="10" rx="5" fill="#ed8936" />

				<!-- ISO 45001 bar -->
				<text x="78" y="128" font-size="9" fill="#4a5568" font-family="sans-serif">ISO 45001</text>
				<rect x="135" y="119" width="72" height="10" rx="5" fill="#e2e8f0" />
				<rect x="135" y="119" width="38" height="10" rx="5" fill="#667eea" />

				<!-- ISO 27001 bar -->
				<text x="78" y="151" font-size="9" fill="#4a5568" font-family="sans-serif">ISO 27001</text>
				<rect x="135" y="142" width="72" height="10" rx="5" fill="#e2e8f0" />
				<rect x="135" y="142" width="55" height="10" rx="5" fill="#48bb78" />

				<!-- ISO 50001 bar -->
				<text x="78" y="174" font-size="9" fill="#4a5568" font-family="sans-serif">ISO 50001</text>
				<rect x="135" y="165" width="72" height="10" rx="5" fill="#e2e8f0" />
				<rect x="135" y="165" width="28" height="10" rx="5" fill="#ed8936" />

				<!-- Team icons -->
				<g transform="translate(82, 190)">
					<circle cx="0" cy="8" r="8" fill="#667eea" opacity="0.7" />
					<circle cx="0" cy="3" r="4" fill="white" opacity="0.9" />
					<circle cx="22" cy="8" r="8" fill="#764ba2" opacity="0.7" />
					<circle cx="22" cy="3" r="4" fill="white" opacity="0.9" />
					<circle cx="44" cy="8" r="8" fill="#48bb78" opacity="0.7" />
					<circle cx="44" cy="3" r="4" fill="white" opacity="0.9" />
				</g>

				<!-- Calendar mini -->
				<g transform="translate(168, 188)">
					<rect x="0" y="0" width="32" height="28" rx="4" fill="white" stroke="#b8c4d8" stroke-width="1" />
					<rect x="0" y="0" width="32" height="10" rx="4" fill="#667eea" />
					<text x="16" y="24" text-anchor="middle" font-size="11" fill="#4a5568" font-weight="bold" font-family="sans-serif">15</text>
				</g>
			</svg>
		</div>
	</div>

	<!-- Settings button -->
	<button
		type="button"
		class="settings-btn absolute top-4 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-sm transition-all duration-300"
		onclick={onSettingsClick}
		aria-label={i18n.t('header.settings')}
	>
		<Settings class="h-5 w-5 text-white" />
	</button>
</header>

<style>
	.header-gradient {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	}

	.title-3d {
		text-shadow:
			0 1px 0 rgba(255, 255, 255, 0.1),
			0 2px 4px rgba(0, 0, 0, 0.2),
			0 4px 8px rgba(0, 0, 0, 0.15),
			0 8px 16px rgba(0, 0, 0, 0.1);
		letter-spacing: -0.01em;
	}

	.subtitle {
		color: rgba(255, 255, 255, 0.88);
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
		letter-spacing: 0.02em;
	}

	.settings-btn {
		background: rgba(255, 255, 255, 0.15);
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	.settings-btn:hover {
		background: rgba(255, 255, 255, 0.25);
		transform: rotate(90deg);
	}
</style>
