<script lang="ts">
	import { getContext } from 'svelte';
	import type { I18nRune } from '$lib/i18n/i18n.svelte';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { toast } from 'svelte-sonner';
	import FileText from '@lucide/svelte/icons/file-text';
	import Send from '@lucide/svelte/icons/send';

	const i18n = getContext<I18nRune>('i18n');

	// ── State ───────────────────────────────────────────────────
	let selectedAuditId = $state('');
	let feststellungen = $state('');
	let empfehlungen = $state('');
	let fazit = $state('');
	let generatedReport = $state<{ feststellungen: string; empfehlungen: string; fazit: string } | null>(null);

	// TODO: Load audits from server
	let audits = $state<{ id: string; name: string }[]>([]);

	// ── Actions ─────────────────────────────────────────────────
	function handleGenerate() {
		if (!selectedAuditId) {
			toast.error(i18n.t('reportGenerator.selectAudit') + ' ' + i18n.t('common.required'));
			return;
		}
		if (!feststellungen.trim() && !empfehlungen.trim() && !fazit.trim()) {
			toast.error(i18n.t('common.required'));
			return;
		}
		generatedReport = {
			feststellungen: feststellungen.trim(),
			empfehlungen: empfehlungen.trim(),
			fazit: fazit.trim()
		};
		toast.success(i18n.t('common.success'));
	}
</script>

<div class="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
	<h1 class="mb-6 text-2xl font-bold" style="font-family: var(--font-display)">
		{i18n.t('reportGenerator.title')}
	</h1>

	<!-- Form -->
	<Card.Root>
		<Card.Header>
			<Card.Title class="flex items-center gap-2">
				<FileText class="size-5" />
				{i18n.t('reportGenerator.title')}
			</Card.Title>
		</Card.Header>
		<Card.Content class="space-y-4">
			<!-- Audit Select -->
			<div>
				<label class="mb-1 block text-sm font-medium" for="audit-select">
					{i18n.t('reportGenerator.selectAudit')}
				</label>
				{#if audits.length === 0}
					<p class="text-muted-foreground text-sm">
						{i18n.t('reportGenerator.noAuditsAvailable')}
					</p>
				{/if}
				<select id="audit-select" bind:value={selectedAuditId} class="border-input bg-background w-full rounded-md border px-3 py-2 text-sm">
					<option value="">{i18n.t('reportGenerator.selectAuditPlaceholder')}</option>
					{#each audits as audit}
						<option value={audit.id}>{audit.name}</option>
					{/each}
				</select>
			</div>

			<!-- Feststellungen -->
			<div>
				<label class="mb-1 block text-sm font-medium" for="feststellungen">
					{i18n.t('reportGenerator.findings')}
				</label>
				<textarea
					id="feststellungen"
					bind:value={feststellungen}
					rows="4"
					class="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
					placeholder={i18n.t('reportGenerator.findingsPlaceholder')}
				></textarea>
			</div>

			<!-- Empfehlungen -->
			<div>
				<label class="mb-1 block text-sm font-medium" for="empfehlungen">
					{i18n.t('reportGenerator.recommendations')}
				</label>
				<textarea
					id="empfehlungen"
					bind:value={empfehlungen}
					rows="4"
					class="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
					placeholder={i18n.t('reportGenerator.recommendationsPlaceholder')}
				></textarea>
			</div>

			<!-- Fazit -->
			<div>
				<label class="mb-1 block text-sm font-medium" for="fazit">
					{i18n.t('reportGenerator.conclusion')}
				</label>
				<textarea
					id="fazit"
					bind:value={fazit}
					rows="4"
					class="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
					placeholder={i18n.t('reportGenerator.conclusionPlaceholder')}
				></textarea>
			</div>

			<!-- Generate Button -->
			<Button onclick={handleGenerate}>
				<Send class="mr-1.5 size-4" />
				{i18n.t('reportGenerator.generateReport')}
			</Button>
		</Card.Content>
	</Card.Root>

	<!-- Generated Report -->
	{#if generatedReport}
		<Card.Root class="mt-6">
			<Card.Header>
				<Card.Title>{i18n.t('reportGenerator.generatedReport')}</Card.Title>
			</Card.Header>
			<Card.Content class="space-y-6">
				{#if generatedReport.feststellungen}
					<div>
						<h3 class="mb-2 text-lg font-semibold" style="font-family: var(--font-display)">
							{i18n.t('reportGenerator.findings')}
						</h3>
						<p class="text-sm whitespace-pre-wrap">{generatedReport.feststellungen}</p>
					</div>
				{/if}
				{#if generatedReport.empfehlungen}
					<div>
						<h3 class="mb-2 text-lg font-semibold" style="font-family: var(--font-display)">
							{i18n.t('reportGenerator.recommendations')}
						</h3>
						<p class="text-sm whitespace-pre-wrap">{generatedReport.empfehlungen}</p>
					</div>
				{/if}
				{#if generatedReport.fazit}
					<div>
						<h3 class="mb-2 text-lg font-semibold" style="font-family: var(--font-display)">
							{i18n.t('reportGenerator.conclusion')}
						</h3>
						<p class="text-sm whitespace-pre-wrap">{generatedReport.fazit}</p>
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
	{:else}
		<Card.Root class="mt-6">
			<Card.Content class="text-muted-foreground py-8 text-center text-sm">
				{i18n.t('reportGenerator.noReportYet')}
			</Card.Content>
		</Card.Root>
	{/if}
</div>
