<script lang="ts">
	import { getContext } from 'svelte';
	import type { I18nRune } from '$lib/i18n/i18n.svelte';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { toast } from 'svelte-sonner';
	import HelpCircle from '@lucide/svelte/icons/help-circle';
	import FileText from '@lucide/svelte/icons/file-text';
	import FileDown from '@lucide/svelte/icons/file-down';
	import Save from '@lucide/svelte/icons/save';
	import FileSearch from '@lucide/svelte/icons/file-search';
	import { organisationseinheitOptionen } from '$lib/data/organisationseinheiten';
	import { alleNormkapitel } from '$lib/data/normkapitel';
	import { auditQuestionsData, type AuditQuestionEntry, type AuditDocumentEntry } from '$lib/data/audit-questions';
	import { ISO_NORMS } from '$lib/types/audit-plan';
	import { generateAuditfragenWord, auditfragenFilename } from '$lib/word/auditfragen-word';

	const i18n = getContext<I18nRune>('i18n');

	// ── State: Audit-Info ───────────────────────────────────────
	let firmenname = $state('');
	let auditdatum = $state('');
	let uhrzeitVon = $state('');
	let uhrzeitBis = $state('');

	// ── State: Area Selection ───────────────────────────────────
	let selectedDepartment = $state('');
	let selectedNorm = $state('');
	let selectedChapter = $state('');

	// ── State: Results ──────────────────────────────────────────
	let questions = $state<AuditQuestionEntry[]>([]);
	let documents = $state<AuditDocumentEntry[]>([]);

	// ── Derived ─────────────────────────────────────────────────
	let normkapitelForNorm = $derived(selectedNorm ? (alleNormkapitel[selectedNorm] ?? []) : []);

	let departments = $derived(organisationseinheitOptionen.map((o) => o.name));

	// ── Actions ─────────────────────────────────────────────────
	function loadQuestions() {
		if (!selectedDepartment || !selectedNorm) {
			toast.error(i18n.t('auditQuestions.department') + ' + ' + i18n.t('auditQuestions.norm') + ' ' + i18n.t('common.required'));
			return;
		}
		const deptData = auditQuestionsData[selectedDepartment];
		if (!deptData) {
			questions = [];
			documents = [];
			return;
		}
		const normData = deptData[selectedNorm];
		if (!normData) {
			questions = [];
			documents = [];
			return;
		}
		questions = normData.questions;
		documents = normData.documents;
	}

	function handleSave() {
		if (!firmenname.trim()) {
			toast.error(i18n.t('auditQuestions.companyName') + ' ' + i18n.t('common.required'));
			return;
		}
		// TODO: Call saveAuditQuestions remote function
		toast.success(i18n.t('common.success'));
	}

	function handleExportWord() {
		if (questions.length === 0) {
			toast.error(i18n.t('auditQuestions.noQuestionsFound'));
			return;
		}
		const blob = generateAuditfragenWord({
			abteilung: selectedDepartment,
			datum: auditdatum || new Date().toISOString().slice(0, 10),
			questions: questions.map((q, idx) => ({
				nummer: idx + 1,
				frage: q.frage,
				normRef: q.normRef
			})),
			documents: documents.map((d) => ({
				name: d.name,
				beschreibung: d.beschreibung
			}))
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = auditfragenFilename(selectedDepartment || 'Export', auditdatum || new Date().toISOString().slice(0, 10));
		a.click();
		URL.revokeObjectURL(url);
		toast.success(i18n.t('auditQuestions.generateWord'));
	}

	function handleExportPdf() {
		// TODO: Trigger PDF export endpoint
		toast.success(i18n.t('auditQuestions.generatePdf'));
	}
</script>

<div class="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-2xl font-bold" style="font-family: var(--font-display)">
			{i18n.t('auditQuestions.title')}
		</h1>
		<div class="flex flex-wrap gap-2">
			<Button onclick={handleSave}>
				<Save class="mr-1.5 size-4" />
				{i18n.t('common.save')}
			</Button>
			<Button variant="outline" onclick={handleExportWord}>
				<FileText class="mr-1.5 size-4" />
				{i18n.t('auditQuestions.generateWord')}
			</Button>
			<Button variant="outline" onclick={handleExportPdf}>
				<FileDown class="mr-1.5 size-4" />
				{i18n.t('auditQuestions.generatePdf')}
			</Button>
		</div>
	</div>

	<!-- Audit Info -->
	<Card.Root>
		<Card.Header>
			<Card.Title class="flex items-center gap-2">
				<HelpCircle class="size-5" />
				{i18n.t('auditQuestions.auditInfo')}
			</Card.Title>
		</Card.Header>
		<Card.Content>
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div>
					<label class="mb-1 block text-sm font-medium" for="firmenname">
						{i18n.t('auditQuestions.companyName')}
					</label>
					<input id="firmenname" type="text" bind:value={firmenname} class="border-input bg-background w-full rounded-md border px-3 py-2 text-sm" />
				</div>
				<div>
					<label class="mb-1 block text-sm font-medium" for="auditdatum">
						{i18n.t('auditQuestions.auditDate')}
					</label>
					<input id="auditdatum" type="date" bind:value={auditdatum} class="border-input bg-background w-full rounded-md border px-3 py-2 text-sm" />
				</div>
				<div>
					<label class="mb-1 block text-sm font-medium" for="uhrzeit-von">
						{i18n.t('auditQuestions.timeFrom')}
					</label>
					<input id="uhrzeit-von" type="time" bind:value={uhrzeitVon} class="border-input bg-background w-full rounded-md border px-3 py-2 text-sm" />
				</div>
				<div>
					<label class="mb-1 block text-sm font-medium" for="uhrzeit-bis">
						{i18n.t('auditQuestions.timeTo')}
					</label>
					<input id="uhrzeit-bis" type="time" bind:value={uhrzeitBis} class="border-input bg-background w-full rounded-md border px-3 py-2 text-sm" />
				</div>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Area Selection -->
	<Card.Root class="mt-4">
		<Card.Header>
			<Card.Title>{i18n.t('auditQuestions.areaSelection')}</Card.Title>
		</Card.Header>
		<Card.Content>
			<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
				<div>
					<label class="mb-1 block text-sm font-medium" for="department">
						{i18n.t('auditQuestions.department')}
					</label>
					<select id="department" bind:value={selectedDepartment} class="border-input bg-background w-full rounded-md border px-3 py-2 text-sm">
						<option value="">{i18n.t('auditQuestions.selectDepartment')}</option>
						{#each departments as dept}
							<option value={dept}>{dept}</option>
						{/each}
					</select>
				</div>
				<div>
					<label class="mb-1 block text-sm font-medium" for="norm">
						{i18n.t('auditQuestions.norm')}
					</label>
					<select id="norm" bind:value={selectedNorm} class="border-input bg-background w-full rounded-md border px-3 py-2 text-sm">
						<option value="">{i18n.t('auditQuestions.selectNorm')}</option>
						{#each ISO_NORMS as norm}
							<option value={norm}>{norm}</option>
						{/each}
					</select>
				</div>
				<div>
					<label class="mb-1 block text-sm font-medium" for="chapter">
						{i18n.t('auditQuestions.chapter')}
					</label>
					<select id="chapter" bind:value={selectedChapter} class="border-input bg-background w-full rounded-md border px-3 py-2 text-sm">
						<option value="">{i18n.t('auditQuestions.selectChapter')}</option>
						{#each normkapitelForNorm as kap}
							<option value={kap.id}>{kap.id} – {kap.titel}</option>
						{/each}
					</select>
				</div>
			</div>
			<div class="mt-4">
				<Button onclick={loadQuestions}>
					<FileSearch class="mr-1.5 size-4" />
					{i18n.t('auditQuestions.loadQuestions')}
				</Button>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Questions & Documents -->
	<Card.Root class="mt-4">
		<Card.Header>
			<Card.Title>{i18n.t('auditQuestions.questionsAndDocs')}</Card.Title>
		</Card.Header>
		<Card.Content>
			<!-- Questions -->
			<div class="mb-6">
				<h3 class="mb-3 text-lg font-semibold" style="font-family: var(--font-display)">
					{i18n.t('auditQuestions.questions')}
				</h3>
				{#if questions.length === 0}
					<p class="text-muted-foreground text-sm">
						{i18n.t('auditQuestions.noQuestionsFound')}
					</p>
				{:else}
					<div class="space-y-3">
						{#each questions as question, idx}
							<div class="border-border bg-card rounded-md border p-3">
								<div class="flex items-start gap-3">
									<span class="bg-primary/10 text-primary flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
										{idx + 1}
									</span>
									<div class="flex-1">
										<p class="text-sm">{question.frage}</p>
										<p class="text-muted-foreground mt-1 text-xs">
											{i18n.t('auditQuestions.normReference')}: {question.normRef}
										</p>
									</div>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Documents -->
			<div>
				<h3 class="mb-3 text-lg font-semibold" style="font-family: var(--font-display)">
					{i18n.t('auditQuestions.documents')}
				</h3>
				{#if documents.length === 0}
					<p class="text-muted-foreground text-sm">
						{i18n.t('auditQuestions.noDocumentsFound')}
					</p>
				{:else}
					<div class="space-y-2">
						{#each documents as doc}
							<div class="border-border bg-card flex items-center gap-3 rounded-md border p-3">
								<FileText class="text-muted-foreground size-4 shrink-0" />
								<div>
									<p class="text-sm font-medium">{doc.name}</p>
									{#if doc.beschreibung}
										<p class="text-muted-foreground text-xs">{doc.beschreibung}</p>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</Card.Content>
	</Card.Root>
</div>
