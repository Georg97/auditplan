<script lang="ts">
	import { getContext } from 'svelte';
	import type { I18nRune } from '$lib/i18n/i18n.svelte';
	import { getAudits } from '$lib/rpc/audits.remote';
	import type { Audit } from '$lib/types/audit';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import { toast } from 'svelte-sonner';
	import FileText from '@lucide/svelte/icons/file-text';
	import ClipboardList from '@lucide/svelte/icons/clipboard-list';

	const i18n = getContext<I18nRune>('i18n');

	// State
	let audits = $state<Audit[]>([]);
	let loadingAudits = $state(true);

	let selectedAuditId = $state('');
	let feststellungen = $state('');
	let empfehlungen = $state('');
	let fazit = $state('');

	interface GeneratedReport {
		audit: Audit;
		feststellungen: string;
		empfehlungen: string;
		fazit: string;
		generatedAt: string;
	}

	let report = $state<GeneratedReport | null>(null);

	const selectedAudit = $derived(audits.find((a) => a.id === selectedAuditId) ?? null);

	// Input classes
	const inputClass =
		'border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none';
	const textareaClass =
		'border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[60px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none';

	// Load audits on mount
	$effect(() => {
		loadingAudits = true;
		getAudits()
			.then((result) => {
				audits = result as Audit[];
			})
			.catch(() => {
				toast.error(i18n.t('common.error'));
			})
			.finally(() => {
				loadingAudits = false;
			});
	});

	function generateReport() {
		if (!selectedAudit) {
			toast.error(i18n.t('report_generator.audit_select_placeholder'));
			return;
		}

		report = {
			audit: selectedAudit,
			feststellungen,
			empfehlungen,
			fazit,
			generatedAt: new Date().toLocaleDateString('de-DE', {
				year: 'numeric',
				month: 'long',
				day: 'numeric'
			})
		};

		toast.success(i18n.t('report_generator.report_generated'));
	}
</script>

<div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
	<h1 class="mb-6 text-2xl font-bold" style="font-family: var(--font-display)">
		{i18n.t('report_generator.title')}
	</h1>

	<!-- Form Card -->
	<Card.Root class="mb-6">
		<Card.Header>
			<Card.Title class="flex items-center gap-2">
				<FileText class="size-5" />
				{i18n.t('report_generator.title')}
			</Card.Title>
		</Card.Header>
		<Card.Content class="space-y-5">
			<!-- Audit Select -->
			<div class="space-y-2">
				<Label for="audit-select">{i18n.t('report_generator.audit_select')}</Label>
				{#if loadingAudits}
					<div class={inputClass + ' text-muted-foreground'}>
						{i18n.t('common.loading')}
					</div>
				{:else if audits.length === 0}
					<div class={inputClass + ' text-muted-foreground'}>
						{i18n.t('report_generator.no_audits')}
					</div>
				{:else}
					<select id="audit-select" bind:value={selectedAuditId} class={inputClass}>
						<option value="">{i18n.t('report_generator.audit_select_placeholder')}</option>
						{#each audits as audit (audit.id)}
							<option value={audit.id}>
								{audit.auditName} — {audit.unternehmen} ({audit.startDatum})
							</option>
						{/each}
					</select>
				{/if}
			</div>

			<!-- Feststellungen -->
			<div class="space-y-2">
				<Label for="feststellungen">{i18n.t('report_generator.feststellungen')}</Label>
				<textarea id="feststellungen" bind:value={feststellungen} class={textareaClass} rows="4" placeholder={i18n.t('report_generator.feststellungen')}></textarea>
			</div>

			<!-- Empfehlungen -->
			<div class="space-y-2">
				<Label for="empfehlungen">{i18n.t('report_generator.empfehlungen')}</Label>
				<textarea id="empfehlungen" bind:value={empfehlungen} class={textareaClass} rows="4" placeholder={i18n.t('report_generator.empfehlungen')}></textarea>
			</div>

			<!-- Fazit -->
			<div class="space-y-2">
				<Label for="fazit">{i18n.t('report_generator.fazit')}</Label>
				<textarea id="fazit" bind:value={fazit} class={textareaClass} rows="3" placeholder={i18n.t('report_generator.fazit')}></textarea>
			</div>

			<!-- Generate Button -->
			<div class="flex justify-end pt-2">
				<Button onclick={generateReport} disabled={!selectedAuditId || loadingAudits}>
					<FileText class="mr-2 size-4" />
					{i18n.t('report_generator.generate')}
				</Button>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Generated Report Card -->
	{#if report}
		<Card.Root>
			<Card.Header>
				<Card.Title class="flex items-center gap-2">
					<ClipboardList class="size-5" />
					{i18n.t('report_generator.report_title')}
				</Card.Title>
				<Card.Description>
					{report.generatedAt}
				</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-6">
				<!-- Audit Info Section -->
				<div class="bg-surface-light rounded-lg p-4">
					<h2 class="mb-3 text-base font-semibold" style="font-family: var(--font-display)">
						{report.audit.auditName}
					</h2>
					<div class="grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
						<div class="flex gap-2">
							<span class="text-muted-foreground font-medium">Unternehmen:</span>
							<span>{report.audit.unternehmen}</span>
						</div>
						<div class="flex gap-2">
							<span class="text-muted-foreground font-medium">Abteilung:</span>
							<span>{report.audit.abteilung}</span>
						</div>
						<div class="flex gap-2">
							<span class="text-muted-foreground font-medium">Datum:</span>
							<span>{report.audit.startDatum}{report.audit.endDatum ? ' – ' + report.audit.endDatum : ''}</span>
						</div>
						{#if report.audit.normen}
							<div class="flex gap-2">
								<span class="text-muted-foreground font-medium">Normen:</span>
								<span>{report.audit.normen}</span>
							</div>
						{/if}
						{#if report.audit.standort}
							<div class="flex gap-2">
								<span class="text-muted-foreground font-medium">Standort:</span>
								<span>{report.audit.standort}</span>
							</div>
						{/if}
						{#if report.audit.geltungsbereich}
							<div class="flex gap-2 sm:col-span-2 lg:col-span-3">
								<span class="text-muted-foreground font-medium">Geltungsbereich:</span>
								<span>{report.audit.geltungsbereich}</span>
							</div>
						{/if}
					</div>
				</div>

				<!-- Feststellungen Section -->
				<div class="space-y-2">
					<h3 class="text-base font-semibold" style="font-family: var(--font-display)">
						{i18n.t('report_generator.feststellungen')}
					</h3>
					<div class="bg-muted/40 rounded-md border p-4 text-sm whitespace-pre-wrap">
						{report.feststellungen || '—'}
					</div>
				</div>

				<!-- Empfehlungen Section -->
				<div class="space-y-2">
					<h3 class="text-base font-semibold" style="font-family: var(--font-display)">
						{i18n.t('report_generator.empfehlungen')}
					</h3>
					<div class="bg-muted/40 rounded-md border p-4 text-sm whitespace-pre-wrap">
						{report.empfehlungen || '—'}
					</div>
				</div>

				<!-- Fazit Section -->
				<div class="space-y-2">
					<h3 class="text-base font-semibold" style="font-family: var(--font-display)">
						{i18n.t('report_generator.fazit')}
					</h3>
					<div class="bg-muted/40 rounded-md border p-4 text-sm whitespace-pre-wrap">
						{report.fazit || '—'}
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	{/if}
</div>
