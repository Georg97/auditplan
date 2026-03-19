<script lang="ts">
	import { getContext } from 'svelte';
	import type { I18nRune } from '$lib/i18n/i18n.svelte';
	import Settings from '@lucide/svelte/icons/settings';

	let { onSettingsClick }: { onSettingsClick?: () => void } = $props();

	const i18n = getContext<I18nRune>('i18n');
</script>

<header class="header-root relative overflow-hidden">
	<!-- Layered background atmosphere -->
	<div class="header-bg-base"></div>
	<div class="header-bg-mesh"></div>
	<div class="header-grain"></div>

	<!-- Floating geometric accents -->
	<div class="geo geo-1"></div>
	<div class="geo geo-2"></div>
	<div class="geo geo-3"></div>

	<div class="relative z-10 flex items-center justify-between px-6 py-5 lg:px-10 lg:py-6">
		<!-- Left: ISO Certificate with Magnifying Glass -->
		<div class="hidden flex-shrink-0 md:block" aria-hidden="true">
			<svg viewBox="0 0 280 250" width="280" height="250" fill="none" xmlns="http://www.w3.org/2000/svg" class="header-svg-left">
				<defs>
					<linearGradient id="docGrad" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0%" stop-color="#ffffff" />
						<stop offset="100%" stop-color="#e8ecf4" />
					</linearGradient>
					<linearGradient id="docEdge" x1="0" y1="0" x2="1" y2="1">
						<stop offset="0%" stop-color="#d0d5e0" />
						<stop offset="100%" stop-color="#b8bfcd" />
					</linearGradient>
					<linearGradient id="stampGrad" x1="0" y1="0" x2="1" y2="1">
						<stop offset="0%" stop-color="#667eea" />
						<stop offset="100%" stop-color="#5a6fd6" />
					</linearGradient>
					<linearGradient id="lensGrad" x1="0" y1="0" x2="1" y2="1">
						<stop offset="0%" stop-color="#a8c4ff" stop-opacity="0.6" />
						<stop offset="100%" stop-color="#d4e4ff" stop-opacity="0.25" />
					</linearGradient>
					<linearGradient id="handleGrad" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0%" stop-color="#c8a24e" />
						<stop offset="40%" stop-color="#dbb756" />
						<stop offset="100%" stop-color="#a88530" />
					</linearGradient>
					<linearGradient id="rimGrad" x1="0" y1="0" x2="1" y2="1">
						<stop offset="0%" stop-color="#dbb756" />
						<stop offset="50%" stop-color="#c8a24e" />
						<stop offset="100%" stop-color="#a88530" />
					</linearGradient>
					<filter id="docShadow">
						<feDropShadow dx="3" dy="5" stdDeviation="6" flood-color="#2d1b69" flood-opacity="0.35" />
					</filter>
					<filter id="lensShadow">
						<feDropShadow dx="2" dy="3" stdDeviation="4" flood-color="#1a1040" flood-opacity="0.3" />
					</filter>
					<clipPath id="lensClip">
						<circle cx="175" cy="105" r="42" />
					</clipPath>
				</defs>

				<!-- Document shadow layer -->
				<rect x="48" y="28" width="150" height="195" rx="6" fill="#2d1b69" opacity="0.18" />

				<!-- Main document -->
				<g filter="url(#docShadow)">
					<rect x="42" y="20" width="150" height="195" rx="6" fill="url(#docGrad)" stroke="url(#docEdge)" stroke-width="1.5" />

					<!-- Document fold corner -->
					<path d="M167 20 L192 20 L192 45 Z" fill="#d0d5e0" />
					<path d="M167 20 L167 45 L192 45 Z" fill="#e8ecf4" stroke="#d0d5e0" stroke-width="0.5" />

					<!-- Header line -->
					<rect x="60" y="38" width="80" height="4" rx="2" fill="#667eea" opacity="0.7" />

					<!-- ISO text -->
					<text x="70" y="72" font-size="22" font-weight="800" fill="#374151" font-family="system-ui" letter-spacing="2">ISO</text>
					<text x="108" y="72" font-size="12" font-weight="600" fill="#667eea" font-family="system-ui">9001</text>

					<!-- Horizontal rule -->
					<line x1="60" y1="80" x2="174" y2="80" stroke="#667eea" stroke-width="1.5" opacity="0.4" />

					<!-- Body text lines -->
					<rect x="60" y="92" width="100" height="3" rx="1.5" fill="#9ca3af" opacity="0.6" />
					<rect x="60" y="102" width="85" height="3" rx="1.5" fill="#9ca3af" opacity="0.5" />
					<rect x="60" y="112" width="95" height="3" rx="1.5" fill="#9ca3af" opacity="0.5" />
					<rect x="60" y="122" width="70" height="3" rx="1.5" fill="#9ca3af" opacity="0.4" />

					<!-- Certification stamp circle -->
					<circle cx="140" cy="170" r="22" fill="none" stroke="url(#stampGrad)" stroke-width="2.5" opacity="0.8" />
					<circle cx="140" cy="170" r="16" fill="none" stroke="url(#stampGrad)" stroke-width="1" opacity="0.5" />
					<text x="127" y="168" font-size="7" font-weight="700" fill="#667eea" opacity="0.75" font-family="system-ui">CERTIFIED</text>
					<text x="131" y="178" font-size="6" font-weight="600" fill="#667eea" opacity="0.6" font-family="system-ui">✓ 2025</text>

					<!-- Checkmark lines -->
					<g transform="translate(60, 140)">
						<rect width="8" height="8" rx="2" fill="none" stroke="#667eea" stroke-width="1.2" opacity="0.6" />
						<path d="M2 4 L3.5 6 L6 2" stroke="#667eea" stroke-width="1.2" fill="none" opacity="0.7" />
						<rect x="14" y="2" width="50" height="3" rx="1.5" fill="#9ca3af" opacity="0.5" />
					</g>
					<g transform="translate(60, 155)">
						<rect width="8" height="8" rx="2" fill="none" stroke="#667eea" stroke-width="1.2" opacity="0.6" />
						<path d="M2 4 L3.5 6 L6 2" stroke="#667eea" stroke-width="1.2" fill="none" opacity="0.7" />
						<rect x="14" y="2" width="40" height="3" rx="1.5" fill="#9ca3af" opacity="0.5" />
					</g>
				</g>

				<!-- Magnifying glass -->
				<g filter="url(#lensShadow)">
					<!-- Glass lens -->
					<circle cx="175" cy="105" r="42" fill="url(#lensGrad)" />
					<circle cx="175" cy="105" r="42" fill="none" stroke="url(#rimGrad)" stroke-width="5" />
					<!-- Inner rim highlight -->
					<circle cx="175" cy="105" r="39" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1" />
					<!-- Lens glare -->
					<ellipse cx="162" cy="90" rx="14" ry="8" fill="white" opacity="0.25" transform="rotate(-25, 162, 90)" />

					<!-- Magnified content visible through lens -->
					<g clip-path="url(#lensClip)">
						<rect x="133" y="63" width="84" height="84" fill="white" opacity="0.15" />
						<text x="152" y="102" font-size="16" font-weight="800" fill="#374151" opacity="0.5" font-family="system-ui">ISO</text>
						<rect x="150" y="108" width="50" height="2.5" rx="1" fill="#9ca3af" opacity="0.4" />
						<rect x="150" y="115" width="40" height="2.5" rx="1" fill="#9ca3af" opacity="0.35" />
					</g>

					<!-- Handle -->
					<rect x="204" y="134" width="14" height="48" rx="5" fill="url(#handleGrad)" transform="rotate(42, 204, 134)" />
					<!-- Handle highlight -->
					<rect x="208" y="138" width="4" height="36" rx="2" fill="white" opacity="0.2" transform="rotate(42, 204, 134)" />
				</g>
			</svg>
		</div>

		<!-- Center: Title block -->
		<div class="flex flex-col items-center text-center">
			<h1 class="header-title">
				{i18n.t('app.title')}
			</h1>
			<div class="header-divider"></div>
			<p class="header-subtitle mt-2">
				{i18n.t('app.subtitle1')}
			</p>
			<p class="header-subtitle-norms mt-1">
				{i18n.t('app.subtitle2')}
			</p>
		</div>

		<!-- Right: Clipboard with Progress -->
		<div class="hidden flex-shrink-0 md:block" aria-hidden="true">
			<svg viewBox="0 0 280 250" width="280" height="250" fill="none" xmlns="http://www.w3.org/2000/svg" class="header-svg-right">
				<defs>
					<linearGradient id="boardGrad" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0%" stop-color="#f0ece4" />
						<stop offset="100%" stop-color="#d4cfc6" />
					</linearGradient>
					<linearGradient id="clipGrad" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0%" stop-color="#8b7355" />
						<stop offset="100%" stop-color="#6b5740" />
					</linearGradient>
					<linearGradient id="paperGrad" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0%" stop-color="#ffffff" />
						<stop offset="100%" stop-color="#f5f3ef" />
					</linearGradient>
					<linearGradient id="barGreen" x1="0" y1="0" x2="1" y2="0">
						<stop offset="0%" stop-color="#34d399" />
						<stop offset="100%" stop-color="#10b981" />
					</linearGradient>
					<linearGradient id="barOrange" x1="0" y1="0" x2="1" y2="0">
						<stop offset="0%" stop-color="#fbbf24" />
						<stop offset="100%" stop-color="#f59e0b" />
					</linearGradient>
					<linearGradient id="barBlue" x1="0" y1="0" x2="1" y2="0">
						<stop offset="0%" stop-color="#667eea" />
						<stop offset="100%" stop-color="#5a6fd6" />
					</linearGradient>
					<linearGradient id="barPurple" x1="0" y1="0" x2="1" y2="0">
						<stop offset="0%" stop-color="#a78bfa" />
						<stop offset="100%" stop-color="#8b5cf6" />
					</linearGradient>
					<filter id="boardShadow">
						<feDropShadow dx="3" dy="5" stdDeviation="6" flood-color="#2d1b69" flood-opacity="0.35" />
					</filter>
					<filter id="calShadow">
						<feDropShadow dx="1" dy="2" stdDeviation="3" flood-color="#1a1040" flood-opacity="0.25" />
					</filter>
				</defs>

				<!-- Clipboard board -->
				<g filter="url(#boardShadow)">
					<!-- Board body -->
					<rect x="65" y="28" width="150" height="200" rx="8" fill="url(#boardGrad)" stroke="#b8a88a" stroke-width="1" />

					<!-- Clip mechanism -->
					<rect x="112" y="18" width="56" height="22" rx="4" fill="url(#clipGrad)" />
					<rect x="122" y="22" width="36" height="12" rx="6" fill="#a39070" />
					<circle cx="140" cy="28" r="4" fill="#d4cfc6" stroke="#b8a88a" stroke-width="1" />

					<!-- Paper sheet -->
					<rect x="75" y="44" width="130" height="175" rx="3" fill="url(#paperGrad)" stroke="#e0dbd3" stroke-width="0.5" />

					<!-- Title area -->
					<text x="90" y="65" font-size="8" font-weight="700" fill="#374151" font-family="system-ui" letter-spacing="0.5">AUDIT PROGRESS</text>
					<line x1="85" y1="72" x2="195" y2="72" stroke="#667eea" stroke-width="1" opacity="0.4" />

					<!-- Progress bars -->
					<!-- ISO 9001 -->
					<text x="88" y="90" font-size="7" fill="#6b7280" font-family="system-ui" font-weight="600">ISO 9001</text>
					<rect x="88" y="94" width="100" height="8" rx="4" fill="#e5e7eb" />
					<rect x="88" y="94" width="85" height="8" rx="4" fill="url(#barGreen)" />
					<text x="178" y="101" font-size="6" fill="#10b981" font-family="system-ui" font-weight="700">85%</text>

					<!-- ISO 14001 -->
					<text x="88" y="118" font-size="7" fill="#6b7280" font-family="system-ui" font-weight="600">ISO 14001</text>
					<rect x="88" y="122" width="100" height="8" rx="4" fill="#e5e7eb" />
					<rect x="88" y="122" width="62" height="8" rx="4" fill="url(#barOrange)" />
					<text x="155" y="129" font-size="6" fill="#f59e0b" font-family="system-ui" font-weight="700">62%</text>

					<!-- ISO 45001 -->
					<text x="88" y="146" font-size="7" fill="#6b7280" font-family="system-ui" font-weight="600">ISO 45001</text>
					<rect x="88" y="150" width="100" height="8" rx="4" fill="#e5e7eb" />
					<rect x="88" y="150" width="40" height="8" rx="4" fill="url(#barBlue)" />
					<text x="133" y="157" font-size="6" fill="#667eea" font-family="system-ui" font-weight="700">40%</text>

					<!-- ISO 50001 -->
					<text x="88" y="174" font-size="7" fill="#6b7280" font-family="system-ui" font-weight="600">ISO 50001</text>
					<rect x="88" y="178" width="100" height="8" rx="4" fill="#e5e7eb" />
					<rect x="88" y="178" width="75" height="8" rx="4" fill="url(#barPurple)" />
					<text x="168" y="185" font-size="6" fill="#8b5cf6" font-family="system-ui" font-weight="700">75%</text>

					<!-- Team icons row -->
					<g transform="translate(88, 198)">
						<!-- Person 1 -->
						<circle cx="8" cy="6" r="5" fill="#667eea" opacity="0.8" />
						<circle cx="8" cy="3" r="2.5" fill="white" opacity="0.9" />
						<path d="M3 9 Q8 12 13 9" fill="white" opacity="0.7" />

						<!-- Person 2 -->
						<circle cx="26" cy="6" r="5" fill="#10b981" opacity="0.8" />
						<circle cx="26" cy="3" r="2.5" fill="white" opacity="0.9" />
						<path d="M21 9 Q26 12 31 9" fill="white" opacity="0.7" />

						<!-- Person 3 -->
						<circle cx="44" cy="6" r="5" fill="#f59e0b" opacity="0.8" />
						<circle cx="44" cy="3" r="2.5" fill="white" opacity="0.9" />
						<path d="M39 9 Q44 12 49 9" fill="white" opacity="0.7" />

						<!-- +N badge -->
						<circle cx="62" cy="6" r="5" fill="#e5e7eb" stroke="#9ca3af" stroke-width="0.5" />
						<text x="58" y="8.5" font-size="6" fill="#6b7280" font-family="system-ui" font-weight="700">+5</text>
					</g>
				</g>

				<!-- Calendar mini icon -->
				<g filter="url(#calShadow)" transform="translate(190, 170)">
					<rect width="34" height="32" rx="5" fill="white" stroke="#e5e7eb" stroke-width="1" />
					<rect width="34" height="10" rx="5" fill="#667eea" />
					<rect y="10" width="34" height="1" fill="#667eea" opacity="0.15" />
					<!-- Calendar dots -->
					<circle cx="10" cy="18" r="2" fill="#10b981" />
					<circle cx="17" cy="18" r="2" fill="#f59e0b" />
					<circle cx="24" cy="18" r="2" fill="#667eea" />
					<circle cx="10" cy="26" r="2" fill="#e5e7eb" />
					<circle cx="17" cy="26" r="2" fill="#10b981" />
					<circle cx="24" cy="26" r="2" fill="#e5e7eb" />
				</g>
			</svg>
		</div>
	</div>

	<!-- Settings gear button -->
	<button class="settings-btn" onclick={onSettingsClick} aria-label={i18n.t('nav.settings')}>
		<Settings class="h-5 w-5 text-white" />
	</button>
</header>

<style>
	.header-root {
		position: relative;
		min-height: 120px;
	}

	/* --- Background layers --- */
	.header-bg-base {
		position: absolute;
		inset: 0;
		background: linear-gradient(135deg, #667eea 0%, #5a67d8 40%, #764ba2 100%);
	}

	.header-bg-mesh {
		position: absolute;
		inset: 0;
		background:
			radial-gradient(ellipse 60% 50% at 15% 80%, rgba(102, 126, 234, 0.5) 0%, transparent 70%),
			radial-gradient(ellipse 50% 60% at 85% 20%, rgba(118, 75, 162, 0.6) 0%, transparent 60%), radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.03) 0%, transparent 50%);
	}

	.header-grain {
		position: absolute;
		inset: 0;
		opacity: 0.035;
		background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
	}

	/* --- Floating geometrics --- */
	.geo {
		position: absolute;
		border-radius: 50%;
		pointer-events: none;
	}

	.geo-1 {
		width: 180px;
		height: 180px;
		top: -60px;
		left: -40px;
		background: radial-gradient(circle, rgba(255, 255, 255, 0.06) 0%, transparent 70%);
	}

	.geo-2 {
		width: 120px;
		height: 120px;
		bottom: -30px;
		right: 15%;
		background: radial-gradient(circle, rgba(255, 255, 255, 0.04) 0%, transparent 70%);
	}

	.geo-3 {
		width: 80px;
		height: 80px;
		top: 20%;
		right: 35%;
		background: radial-gradient(circle, rgba(255, 255, 255, 0.03) 0%, transparent 70%);
	}

	/* --- Title typography --- */
	.header-title {
		font-family: var(--font-display), system-ui, sans-serif;
		font-size: clamp(1.6rem, 4vw, 2.5rem);
		font-weight: 800;
		color: white;
		letter-spacing: -0.01em;
		line-height: 1.15;
		text-shadow:
			0 1px 0 rgba(255, 255, 255, 0.15),
			0 2px 4px rgba(45, 27, 105, 0.35),
			0 4px 12px rgba(45, 27, 105, 0.2);
	}

	.header-divider {
		margin-top: 0.6rem;
		width: 48px;
		height: 2px;
		border-radius: 1px;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
	}

	.header-subtitle {
		font-family: var(--font-body), system-ui, sans-serif;
		font-size: clamp(0.8rem, 1.8vw, 1.1rem);
		color: rgba(255, 255, 255, 0.88);
		letter-spacing: 0.02em;
		font-weight: 400;
	}

	.header-subtitle-norms {
		font-family: var(--font-body), system-ui, sans-serif;
		font-size: clamp(0.7rem, 1.4vw, 0.85rem);
		color: rgba(255, 255, 255, 0.55);
		letter-spacing: 0.08em;
		font-weight: 500;
	}

	/* --- SVG illustrations --- */
	.header-svg-left,
	.header-svg-right {
		filter: drop-shadow(0 2px 8px rgba(45, 27, 105, 0.15));
		transition: transform 0.4s ease;
	}

	.header-svg-left:hover {
		transform: translateY(-2px) rotate(-0.5deg);
	}

	.header-svg-right:hover {
		transform: translateY(-2px) rotate(0.5deg);
	}

	/* --- Settings button --- */
	.settings-btn {
		position: absolute;
		top: 1rem;
		right: 1rem;
		z-index: 20;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 50%;
		border: 1px solid rgba(255, 255, 255, 0.15);
		background: rgba(255, 255, 255, 0.12);
		backdrop-filter: blur(8px);
		cursor: pointer;
		transition:
			transform 0.35s cubic-bezier(0.4, 0, 0.2, 1),
			background 0.25s ease;
	}

	.settings-btn:hover {
		transform: rotate(90deg);
		background: rgba(255, 255, 255, 0.22);
	}

	.settings-btn:active {
		transform: rotate(90deg) scale(0.92);
	}

	/* --- Responsive --- */
	@media (max-width: 767px) {
		.header-root {
			min-height: 80px;
		}

		.geo-1,
		.geo-2,
		.geo-3 {
			display: none;
		}
	}
</style>
