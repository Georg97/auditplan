<script lang="ts">
	import { getContext } from 'svelte';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import type { I18nRune } from '$lib/i18n/i18n.svelte';
	import { getSavedPlans, getSavedPlanById, deleteSavedPlan } from '$lib/rpc/plaene.remote';
	import { getSavedNotes, getSavedNotesById, deleteSavedNotes } from '$lib/rpc/notizen.remote';
	import { getSavedAuditQuestions, getSavedAuditQuestionsById, deleteSavedAuditQuestions } from '$lib/rpc/auditfragen.remote';
	import { generatePlanWordDocument } from '$lib/word/auditplan-word';
	import { generateNotesWordDocument } from '$lib/word/auditnotizen-word';
	import { generateAuditQuestionsWord } from '$lib/word/auditfragen-word';
	import * as Card from '$lib/components/ui/card';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Button } from '$lib/components/ui/button';
	import FileText from '@lucide/svelte/icons/file-text';
	import Notebook from '@lucide/svelte/icons/notebook';
	import HelpCircle from '@lucide/svelte/icons/help-circle';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Download from '@lucide/svelte/icons/download';

	const i18n = getContext<I18nRune>('i18n');

	type SavedItem = {
		id: string;
		name: string;
		createdAt: Date;
		updatedAt: Date;
	};

	// Load data
	const plansPromise = getSavedPlans();
	const notesPromise = getSavedNotes();
	const questionsPromise = getSavedAuditQuestions();

	// Local state for optimistic UI
	let plans = $state<SavedItem[]>([]);
	let notes = $state<SavedItem[]>([]);
	let questions = $state<SavedItem[]>([]);

	let plansLoaded = $state(false);
	let notesLoaded = $state(false);
	let questionsLoaded = $state(false);

	plansPromise
		.then((data) => {
			plans = (data as SavedItem[]) ?? [];
			plansLoaded = true;
		})
		.catch(() => {
			plansLoaded = true;
		});

	notesPromise
		.then((data) => {
			notes = (data as SavedItem[]) ?? [];
			notesLoaded = true;
		})
		.catch(() => {
			notesLoaded = true;
		});

	questionsPromise
		.then((data) => {
			questions = (data as SavedItem[]) ?? [];
			questionsLoaded = true;
		})
		.catch(() => {
			questionsLoaded = true;
		});

	// Delete dialog state
	let deleteDialogOpen = $state(false);
	let itemToDelete = $state<{ id: string; name: string; type: 'plan' | 'note' | 'question' } | null>(null);
	let isDeleting = $state(false);

	function openDeleteDialog(id: string, name: string, type: 'plan' | 'note' | 'question') {
		itemToDelete = { id, name, type };
		deleteDialogOpen = true;
	}

	async function confirmDelete() {
		if (!itemToDelete) return;
		isDeleting = true;
		try {
			if (itemToDelete.type === 'plan') {
				await deleteSavedPlan(itemToDelete.id);
				plans = plans.filter((p) => p.id !== itemToDelete!.id);
			} else if (itemToDelete.type === 'note') {
				await deleteSavedNotes(itemToDelete.id);
				notes = notes.filter((n) => n.id !== itemToDelete!.id);
			} else {
				await deleteSavedAuditQuestions(itemToDelete.id);
				questions = questions.filter((q) => q.id !== itemToDelete!.id);
			}
			toast.success(i18n.t('overview.delete_success'));
			deleteDialogOpen = false;
			itemToDelete = null;
		} catch {
			toast.error(i18n.t('common.no_data'));
		} finally {
			isDeleting = false;
		}
	}

	function formatDate(date: Date): string {
		return new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(date));
	}

	function handleEdit(id: string, type: 'plan' | 'note' | 'question') {
		if (type === 'plan') goto(`/plan-generator?edit=${id}`);
		else if (type === 'note') goto(`/notes-generator?edit=${id}`);
		else goto(`/audit-questions?edit=${id}`);
	}

	async function handleDownload(id: string, type: 'plan' | 'note' | 'question') {
		try {
			if (type === 'plan') {
				const plan = await getSavedPlanById(id);
				if (!plan?.daten) return;
				const data = JSON.parse(plan.daten);
				await generatePlanWordDocument(data, data.logoBase64 ?? undefined);
			} else if (type === 'note') {
				const note = await getSavedNotesById(id);
				if (!note?.daten) return;
				const data = JSON.parse(note.daten);
				await generateNotesWordDocument(data);
			} else {
				const q = await getSavedAuditQuestionsById(id);
				if (!q) return;
				const formData = JSON.parse(q.formData);
				const questionsList = JSON.parse(q.questions);
				const documentsList = JSON.parse(q.documents);
				generateAuditQuestionsWord({
					abteilung: formData.abteilung ?? '',
					datum: formData.datum ?? '',
					questions: questionsList,
					documents: documentsList
				});
			}
			toast.success(i18n.t('common.download') + ' ✓');
		} catch {
			toast.error(i18n.t('common.no_data'));
		}
	}
</script>

<div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
	<h1 class="mb-8 text-2xl font-bold" style="font-family: var(--font-display)">
		{i18n.t('overview.title')}
	</h1>

	<!-- Saved Audit Questions -->
	<section class="mb-6">
		<div class="mb-3 flex items-center gap-2">
			<HelpCircle class="text-brand h-5 w-5" />
			<h2 class="text-foreground text-lg font-bold">{i18n.t('overview.saved_questions')}</h2>
		</div>
		<Card.Root class="overflow-hidden">
			<div class="max-h-96 overflow-y-auto">
				{#if !questionsLoaded}
					<div class="space-y-2 p-4">
						{#each [1, 2, 3] as n (n)}
							<div class="bg-muted h-12 animate-pulse rounded"></div>
						{/each}
					</div>
				{:else if questions.length === 0}
					<div class="text-muted-foreground py-8 text-center text-sm">
						{i18n.t('overview.no_questions')}
					</div>
				{:else}
					{#each questions as item (item.id)}
						<div class="hover:bg-muted/50 flex items-center justify-between border-b px-4 py-3 last:border-b-0">
							<div>
								<p class="text-foreground font-medium">{item.name}</p>
								<p class="text-muted-foreground text-xs">{formatDate(item.createdAt)}</p>
							</div>
							<div class="flex gap-2">
								<Button size="sm" onclick={() => handleEdit(item.id, 'question')}>
									<Pencil class="mr-1 h-4 w-4" />
									{i18n.t('common.edit')}
								</Button>
								<Button size="sm" variant="destructive" onclick={() => openDeleteDialog(item.id, item.name, 'question')}>
									<Trash2 class="mr-1 h-4 w-4" />
									{i18n.t('common.delete')}
								</Button>
								<Button size="sm" variant="outline" onclick={() => handleDownload(item.id, 'question')}>
									<Download class="mr-1 h-4 w-4" />
									{i18n.t('common.download')}
								</Button>
							</div>
						</div>
					{/each}
				{/if}
			</div>
		</Card.Root>
	</section>

	<!-- Saved Notes -->
	<section class="mb-6">
		<div class="mb-3 flex items-center gap-2">
			<Notebook class="text-brand h-5 w-5" />
			<h2 class="text-foreground text-lg font-bold">{i18n.t('overview.saved_notes')}</h2>
		</div>
		<Card.Root class="overflow-hidden">
			<div class="max-h-96 overflow-y-auto">
				{#if !notesLoaded}
					<div class="space-y-2 p-4">
						{#each [1, 2, 3] as n (n)}
							<div class="bg-muted h-12 animate-pulse rounded"></div>
						{/each}
					</div>
				{:else if notes.length === 0}
					<div class="text-muted-foreground py-8 text-center text-sm">
						{i18n.t('overview.no_notes')}
					</div>
				{:else}
					{#each notes as item (item.id)}
						<div class="hover:bg-muted/50 flex items-center justify-between border-b px-4 py-3 last:border-b-0">
							<div>
								<p class="text-foreground font-medium">{item.name}</p>
								<p class="text-muted-foreground text-xs">{formatDate(item.createdAt)}</p>
							</div>
							<div class="flex gap-2">
								<Button size="sm" onclick={() => handleEdit(item.id, 'note')}>
									<Pencil class="mr-1 h-4 w-4" />
									{i18n.t('common.edit')}
								</Button>
								<Button size="sm" variant="destructive" onclick={() => openDeleteDialog(item.id, item.name, 'note')}>
									<Trash2 class="mr-1 h-4 w-4" />
									{i18n.t('common.delete')}
								</Button>
								<Button size="sm" variant="outline" onclick={() => handleDownload(item.id, 'note')}>
									<Download class="mr-1 h-4 w-4" />
									{i18n.t('common.download')}
								</Button>
							</div>
						</div>
					{/each}
				{/if}
			</div>
		</Card.Root>
	</section>

	<!-- Saved Plans -->
	<section class="mb-6">
		<div class="mb-3 flex items-center gap-2">
			<FileText class="text-brand h-5 w-5" />
			<h2 class="text-foreground text-lg font-bold">{i18n.t('overview.saved_plans')}</h2>
		</div>
		<Card.Root class="overflow-hidden">
			<div class="max-h-96 overflow-y-auto">
				{#if !plansLoaded}
					<div class="space-y-2 p-4">
						{#each [1, 2, 3] as n (n)}
							<div class="bg-muted h-12 animate-pulse rounded"></div>
						{/each}
					</div>
				{:else if plans.length === 0}
					<div class="text-muted-foreground py-8 text-center text-sm">
						{i18n.t('overview.no_plans')}
					</div>
				{:else}
					{#each plans as item (item.id)}
						<div class="hover:bg-muted/50 flex items-center justify-between border-b px-4 py-3 last:border-b-0">
							<div>
								<p class="text-foreground font-medium">{item.name}</p>
								<p class="text-muted-foreground text-xs">{formatDate(item.createdAt)}</p>
							</div>
							<div class="flex gap-2">
								<Button size="sm" onclick={() => handleEdit(item.id, 'plan')}>
									<Pencil class="mr-1 h-4 w-4" />
									{i18n.t('common.edit')}
								</Button>
								<Button size="sm" variant="destructive" onclick={() => openDeleteDialog(item.id, item.name, 'plan')}>
									<Trash2 class="mr-1 h-4 w-4" />
									{i18n.t('common.delete')}
								</Button>
								<Button size="sm" variant="outline" onclick={() => handleDownload(item.id, 'plan')}>
									<Download class="mr-1 h-4 w-4" />
									{i18n.t('common.download')}
								</Button>
							</div>
						</div>
					{/each}
				{/if}
			</div>
		</Card.Root>
	</section>
</div>

<!-- Delete Confirmation Dialog -->
<AlertDialog.Root bind:open={deleteDialogOpen}>
	<AlertDialog.Portal>
		<AlertDialog.Overlay />
		<AlertDialog.Content>
			<AlertDialog.Header>
				<AlertDialog.Title>{i18n.t('overview.delete_confirm')}</AlertDialog.Title>
				<AlertDialog.Description>
					{itemToDelete?.name ?? ''}
				</AlertDialog.Description>
			</AlertDialog.Header>
			<AlertDialog.Footer>
				<AlertDialog.Cancel onclick={() => (deleteDialogOpen = false)}>
					{i18n.t('common.cancel')}
				</AlertDialog.Cancel>
				<AlertDialog.Action onclick={confirmDelete} class="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={isDeleting}>
					{i18n.t('common.delete')}
				</AlertDialog.Action>
			</AlertDialog.Footer>
		</AlertDialog.Content>
	</AlertDialog.Portal>
</AlertDialog.Root>
