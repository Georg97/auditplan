<script lang="ts">
	import { getContext } from 'svelte';
	import type { I18nRune } from '$lib/i18n/i18n.svelte';
	import type { AuditPlanGrunddaten, AuditPlanStandort, AuditPlanRevision, AuditPlanTeamMitglied, AuditPlanBlock, AuditPlanAuditzeit } from '$lib/types/audit-plan';
	import { generateId } from '$lib/utils/plan-generator';
	import PlanGrunddaten from '$lib/components/plan-generator/PlanGrunddaten.svelte';
	import PlanBlockSystem from '$lib/components/plan-generator/PlanBlockSystem.svelte';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Button } from '$lib/components/ui/button';
	import { toast } from 'svelte-sonner';
	import Save from '@lucide/svelte/icons/save';
	import FileText from '@lucide/svelte/icons/file-text';
	import FileDown from '@lucide/svelte/icons/file-down';
	import StickyNote from '@lucide/svelte/icons/sticky-note';
	import RotateCcw from '@lucide/svelte/icons/rotate-ccw';

	const i18n = getContext<I18nRune>('i18n');

	// ── State ───────────────────────────────────────────────────
	let planName = $state('');
	let grunddaten = $state<Partial<AuditPlanGrunddaten>>({});
	let standorte = $state<AuditPlanStandort[]>([{ id: generateId(), auditPlanId: '', name: '', position: 0 }]);
	let znNummern = $state<string[]>([]);
	let selectedNorms = $state<string[]>([]);
	let selectedAuditarten = $state<string[]>([]);
	let selectedSprachen = $state<string[]>([]);
	let teamMitglieder = $state<AuditPlanTeamMitglied[]>([]);
	let revisionen = $state<AuditPlanRevision[]>([]);
	let auditzeiten = $state<AuditPlanAuditzeit[]>([]);
	let blocks = $state<AuditPlanBlock[]>([]);
	let logoBase64 = $state<string | undefined>(undefined);
	let logoDateiname = $state<string | undefined>(undefined);
	let resetDialogOpen = $state(false);

	// ── Actions ─────────────────────────────────────────────────
	function handleSave() {
		if (!planName.trim()) {
			toast.error(i18n.t('planGenerator.planName') + ' ' + i18n.t('common.required'));
			return;
		}
		// TODO: Call remote function to save
		toast.success(i18n.t('planGenerator.savedSuccess'));
	}

	function handleGenerateWord() {
		// TODO: Trigger Word export endpoint
		toast.success(i18n.t('planGenerator.generateWord'));
	}

	function handleGeneratePdf() {
		// TODO: Trigger PDF export endpoint
		toast.success(i18n.t('planGenerator.generatePdf'));
	}

	function handleGenerateNotes() {
		// TODO: Navigate to notes generator with pre-filled data
		toast.success(i18n.t('planGenerator.generateNotes'));
	}

	function handleReset() {
		planName = '';
		grunddaten = {};
		standorte = [{ id: generateId(), auditPlanId: '', name: '', position: 0 }];
		znNummern = [];
		selectedNorms = [];
		selectedAuditarten = [];
		selectedSprachen = [];
		teamMitglieder = [];
		revisionen = [];
		auditzeiten = [];
		blocks = [];
		logoBase64 = undefined;
		logoDateiname = undefined;
		resetDialogOpen = false;
		toast.success(i18n.t('common.success'));
	}
</script>

<div class="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-2xl font-bold" style="font-family: var(--font-display)">
			{i18n.t('planGenerator.title')}
		</h1>
		<div class="flex flex-wrap gap-2">
			<Button onclick={handleSave}>
				<Save class="mr-1.5 size-4" />
				{i18n.t('planGenerator.save')}
			</Button>
			<Button variant="outline" onclick={handleGenerateWord}>
				<FileText class="mr-1.5 size-4" />
				{i18n.t('planGenerator.generateWord')}
			</Button>
			<Button variant="outline" onclick={handleGeneratePdf}>
				<FileDown class="mr-1.5 size-4" />
				{i18n.t('planGenerator.generatePdf')}
			</Button>
			<Button variant="outline" onclick={handleGenerateNotes}>
				<StickyNote class="mr-1.5 size-4" />
				{i18n.t('planGenerator.generateNotes')}
			</Button>
			<Button
				variant="destructive"
				onclick={() => {
					resetDialogOpen = true;
				}}
			>
				<RotateCcw class="mr-1.5 size-4" />
				{i18n.t('planGenerator.resetForm')}
			</Button>
		</div>
	</div>

	<!-- Grunddaten -->
	<PlanGrunddaten
		bind:planName
		bind:grunddaten
		bind:standorte
		bind:znNummern
		bind:selectedNorms
		bind:selectedAuditarten
		bind:selectedSprachen
		bind:teamMitglieder
		bind:revisionen
		bind:auditzeiten
		bind:logoBase64
		bind:logoDateiname
	/>

	<!-- Blocks -->
	<div class="mt-6">
		<PlanBlockSystem bind:blocks {selectedNorms} />
	</div>
</div>

<!-- Reset confirmation -->
<AlertDialog.Root bind:open={resetDialogOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>{i18n.t('planGenerator.resetForm')}</AlertDialog.Title>
			<AlertDialog.Description>{i18n.t('planGenerator.resetConfirm')}</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>{i18n.t('common.cancel')}</AlertDialog.Cancel>
			<AlertDialog.Action onclick={handleReset}>{i18n.t('common.confirm')}</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
