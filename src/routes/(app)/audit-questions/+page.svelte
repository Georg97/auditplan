<script lang="ts">
	import { getContext } from 'svelte';
	import type { I18nRune } from '$lib/i18n/i18n.svelte';
	import { saveAuditQuestions } from '$lib/rpc/auditfragen.remote';
	import { organisationseinheitOptionen } from '$lib/data/organisationseinheiten';
	import { auditQuestionsData } from '$lib/data/audit-questions';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import { toast } from 'svelte-sonner';
	import Save from '@lucide/svelte/icons/save';
	import FileText from '@lucide/svelte/icons/file-text';
	import Search from '@lucide/svelte/icons/search';

	const i18n = getContext<I18nRune>('i18n');

	const normOptionen = ['ISO 9001', 'ISO 14001', 'ISO 45001', 'ISO 50001', 'ISO 27001'];
	const abteilungOptionen = organisationseinheitOptionen.map((o) => o.name);

	// Form state
	let firma = $state('');
	let auditdatum = $state('');
	let uhrzeitVon = $state('');
	let uhrzeitBis = $state('');

	// Selection state
	let selectedAbteilung = $state('');
	let selectedNorm = $state('');

	// Loaded data state
	let loadedAbteilung = $state('');
	let loadedNorm = $state('');
	let questions = $state<Array<{ frage: string; normRef: string }>>([]);
	let documents = $state<Array<{ name: string; beschreibung?: string }>>([]);
	let hasLoaded = $state(false);

	let saving = $state(false);

	const inputClass =
		'border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none';

	function handleLoadQuestions() {
		if (!selectedAbteilung || !selectedNorm) return;

		const entry = auditQuestionsData[selectedAbteilung]?.[selectedNorm];
		questions = entry?.questions ?? [];
		documents = entry?.documents ?? [];
		loadedAbteilung = selectedAbteilung;
		loadedNorm = selectedNorm;
		hasLoaded = true;
	}

	async function handleSave() {
		saving = true;
		try {
			const name = firma
				? `Auditfragen - ${firma.trim()} - ${loadedAbteilung} ${loadedNorm}`
				: `Auditfragen - ${loadedAbteilung} ${loadedNorm} - ${new Date().toLocaleDateString('de-DE')}`;

			const formData = JSON.stringify({ firma, auditdatum, uhrzeitVon, uhrzeitBis });
			const questionsStr = JSON.stringify(questions);
			const documentsStr = JSON.stringify(documents);

			await saveAuditQuestions({ name, formData, questions: questionsStr, documents: documentsStr });
			toast.success(i18n.t('audit_questions.save_success'));
		} catch {
			toast.error(i18n.t('audit_questions.save_error'));
		} finally {
			saving = false;
		}
	}
</script>

<div class="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
	<!-- Title -->
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold" style="font-family: var(--font-display)">
			{i18n.t('audit_questions.title')}
		</h1>
	</div>

	<!-- Card: Audit-Informationen -->
	<Card.Root>
		<Card.Header>
			<Card.Title>{i18n.t('audit_questions.info_title')}</Card.Title>
		</Card.Header>
		<Card.Content class="space-y-4">
			<!-- Row 1: Firmenname + Auditdatum -->
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div class="space-y-2">
					<Label>{i18n.t('audit_questions.firma')}</Label>
					<input type="text" bind:value={firma} placeholder={i18n.t('audit_questions.firma_placeholder')} class={inputClass} />
				</div>
				<div class="space-y-2">
					<Label>{i18n.t('audit_questions.auditdatum')}</Label>
					<input type="date" bind:value={auditdatum} class={inputClass} />
				</div>
			</div>
			<!-- Row 2: Uhrzeit Von + Uhrzeit Bis -->
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div class="space-y-2">
					<Label>{i18n.t('audit_questions.uhrzeit_von')}</Label>
					<input type="time" bind:value={uhrzeitVon} class={inputClass} />
				</div>
				<div class="space-y-2">
					<Label>{i18n.t('audit_questions.uhrzeit_bis')}</Label>
					<input type="time" bind:value={uhrzeitBis} class={inputClass} />
				</div>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Card: Bereichsauswahl -->
	<Card.Root>
		<Card.Header>
			<Card.Title>{i18n.t('audit_questions.bereich_title')}</Card.Title>
		</Card.Header>
		<Card.Content class="space-y-4">
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<!-- Abteilung -->
				<div class="space-y-2">
					<Label>{i18n.t('audit_questions.abteilung')}</Label>
					<select bind:value={selectedAbteilung} class={inputClass}>
						<option value="">{i18n.t('audit_questions.abteilung_placeholder')}</option>
						{#each abteilungOptionen as name (name)}
							<option value={name}>{name}</option>
						{/each}
					</select>
				</div>
				<!-- Norm -->
				<div class="space-y-2">
					<Label>{i18n.t('audit_questions.norm')}</Label>
					<select bind:value={selectedNorm} class={inputClass}>
						<option value="">{i18n.t('audit_questions.norm_placeholder')}</option>
						{#each normOptionen as norm (norm)}
							<option value={norm}>{norm}</option>
						{/each}
					</select>
				</div>
			</div>
			<div>
				<Button onclick={handleLoadQuestions} disabled={!selectedAbteilung || !selectedNorm}>
					<Search class="mr-2 size-4" />
					{i18n.t('audit_questions.load_questions')}
				</Button>
			</div>
		</Card.Content>
	</Card.Root>

	{#if hasLoaded}
		<!-- Card: Auditfragen -->
		<Card.Root>
			<Card.Header>
				<Card.Title>
					{i18n.t('audit_questions.questions_title')}
					{#if loadedAbteilung && loadedNorm}
						<span class="text-muted-foreground ml-2 text-sm font-normal">
							{loadedAbteilung} · {loadedNorm}
						</span>
					{/if}
				</Card.Title>
			</Card.Header>
			<Card.Content>
				{#if questions.length === 0}
					<p class="text-muted-foreground text-sm">{i18n.t('audit_questions.no_questions')}</p>
				{:else}
					<ol class="space-y-3">
						{#each questions as q, idx (idx)}
							<li class="flex gap-3">
								<span class="bg-brand text-brand-foreground flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
									{idx + 1}
								</span>
								<div class="flex-1">
									<p class="text-sm">{q.frage}</p>
									<p class="text-muted-foreground mt-0.5 text-xs">Norm-Ref: {q.normRef}</p>
								</div>
							</li>
						{/each}
					</ol>
				{/if}
			</Card.Content>
		</Card.Root>

		<!-- Card: Dokumente -->
		<Card.Root>
			<Card.Header>
				<Card.Title>
					{i18n.t('audit_questions.documents_title')}
					{#if loadedAbteilung && loadedNorm}
						<span class="text-muted-foreground ml-2 text-sm font-normal">
							{loadedAbteilung} · {loadedNorm}
						</span>
					{/if}
				</Card.Title>
			</Card.Header>
			<Card.Content>
				{#if documents.length === 0}
					<p class="text-muted-foreground text-sm">{i18n.t('audit_questions.no_documents')}</p>
				{:else}
					<ul class="space-y-2">
						{#each documents as doc, idx (idx)}
							<li class="flex items-start gap-3">
								<span class="bg-muted text-muted-foreground flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
									{idx + 1}
								</span>
								<div class="flex-1">
									<p class="text-sm font-medium">{doc.name}</p>
									{#if doc.beschreibung}
										<p class="text-muted-foreground text-xs">{doc.beschreibung}</p>
									{/if}
								</div>
							</li>
						{/each}
					</ul>
				{/if}
			</Card.Content>
		</Card.Root>

		<!-- Action Buttons -->
		<div class="flex justify-end gap-3">
			<Button variant="outline" disabled>
				<FileText class="mr-2 size-4" />
				{i18n.t('audit_questions.word_export')}
			</Button>
			<Button onclick={handleSave} disabled={saving}>
				<Save class="mr-2 size-4" />
				{saving ? i18n.t('common.loading') : i18n.t('audit_questions.save')}
			</Button>
		</div>
	{/if}
</div>
