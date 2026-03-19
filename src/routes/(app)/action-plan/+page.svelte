<script lang="ts">
	import { getContext } from 'svelte';
	import type { I18nRune } from '$lib/i18n/i18n.svelte';
	import * as Card from '$lib/components/ui/card';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Button } from '$lib/components/ui/button';
	import { toast } from 'svelte-sonner';
	import ListChecks from '@lucide/svelte/icons/list-checks';
	import Plus from '@lucide/svelte/icons/plus';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import AlertTriangle from '@lucide/svelte/icons/alert-triangle';
	import X from '@lucide/svelte/icons/x';
	import {
		FINDING_TYPES,
		ACTION_STATUSES,
		PRIORITIES,
		ACTION_AUDIT_TYPES,
		ACTION_NORMS,
		findingTypeColor,
		isOverdue,
		type FindingType,
		type ActionStatus,
		type Priority,
		type AuditType
	} from '$lib/types/action';

	const i18n = getContext<I18nRune>('i18n');

	// ── Types ───────────────────────────────────────────────────
	interface ActionItem {
		id: string;
		description: string;
		findingType: FindingType;
		plannedAction: string;
		status: ActionStatus;
		responsible: string;
		priority: Priority;
		dueDate: string;
		completionDate: string;
		norm: string;
		evidenceNotes: string;
		auditType: AuditType;
	}

	// ── State: Filters ──────────────────────────────────────────
	let filterFindingType = $state('all');
	let filterStatus = $state('all');
	let filterAuditType = $state('all');
	let filterResponsible = $state('all');
	let filterPriority = $state('all');
	let filterNorm = $state('all');

	// ── State: Data ─────────────────────────────────────────────
	let actions = $state<ActionItem[]>([]);

	// ── State: Dialog ───────────────────────────────────────────
	let dialogOpen = $state(false);
	let editingAction = $state<ActionItem | null>(null);
	let deleteDialogOpen = $state(false);
	let deletingId = $state('');

	// ── Form fields ─────────────────────────────────────────────
	let formDescription = $state('');
	let formFindingType = $state<FindingType>('observation');
	let formPlannedAction = $state('');
	let formStatus = $state<ActionStatus>('open');
	let formResponsible = $state('');
	let formPriority = $state<Priority>('medium');
	let formDueDate = $state('');
	let formCompletionDate = $state('');
	let formNorm = $state('');
	let formEvidenceNotes = $state('');
	let formAuditType = $state<AuditType>('internal');

	// ── Derived ─────────────────────────────────────────────────
	let filteredActions = $derived.by(() => {
		return actions.filter((a) => {
			if (filterFindingType !== 'all' && a.findingType !== filterFindingType) return false;
			if (filterStatus !== 'all' && a.status !== filterStatus) return false;
			if (filterAuditType !== 'all' && a.auditType !== filterAuditType) return false;
			if (filterResponsible !== 'all' && a.responsible !== filterResponsible) return false;
			if (filterPriority !== 'all' && a.priority !== filterPriority) return false;
			if (filterNorm !== 'all' && a.norm !== filterNorm) return false;
			return true;
		});
	});

	let uniqueResponsibles = $derived([...new Set(actions.map((a) => a.responsible).filter(Boolean))].sort());

	// ── Actions ─────────────────────────────────────────────────
	function generateId() {
		return crypto.randomUUID();
	}

	function openNewDialog() {
		editingAction = null;
		formDescription = '';
		formFindingType = 'observation';
		formPlannedAction = '';
		formStatus = 'open';
		formResponsible = '';
		formPriority = 'medium';
		formDueDate = '';
		formCompletionDate = '';
		formNorm = '';
		formEvidenceNotes = '';
		formAuditType = 'internal';
		dialogOpen = true;
	}

	function openEditDialog(action: ActionItem) {
		editingAction = action;
		formDescription = action.description;
		formFindingType = action.findingType;
		formPlannedAction = action.plannedAction;
		formStatus = action.status;
		formResponsible = action.responsible;
		formPriority = action.priority;
		formDueDate = action.dueDate;
		formCompletionDate = action.completionDate;
		formNorm = action.norm;
		formEvidenceNotes = action.evidenceNotes;
		formAuditType = action.auditType;
		dialogOpen = true;
	}

	function handleSaveAction() {
		if (!formDescription.trim()) {
			toast.error(i18n.t('actionPlan.findingDescription') + ' ' + i18n.t('common.required'));
			return;
		}
		if (editingAction) {
			actions = actions.map((a) =>
				a.id === editingAction!.id
					? {
							...a,
							description: formDescription,
							findingType: formFindingType,
							plannedAction: formPlannedAction,
							status: formStatus,
							responsible: formResponsible,
							priority: formPriority,
							dueDate: formDueDate,
							completionDate: formCompletionDate,
							norm: formNorm,
							evidenceNotes: formEvidenceNotes,
							auditType: formAuditType
						}
					: a
			);
		} else {
			actions = [
				...actions,
				{
					id: generateId(),
					description: formDescription,
					findingType: formFindingType,
					plannedAction: formPlannedAction,
					status: formStatus,
					responsible: formResponsible,
					priority: formPriority,
					dueDate: formDueDate,
					completionDate: formCompletionDate,
					norm: formNorm,
					evidenceNotes: formEvidenceNotes,
					auditType: formAuditType
				}
			];
		}
		dialogOpen = false;
		toast.success(i18n.t('common.success'));
	}

	function confirmDelete(id: string) {
		deletingId = id;
		deleteDialogOpen = true;
	}

	function handleDelete() {
		actions = actions.filter((a) => a.id !== deletingId);
		deleteDialogOpen = false;
		toast.success(i18n.t('common.success'));
	}

	function overdueDays(dueDate: string): number {
		const diff = Date.now() - new Date(dueDate).getTime();
		return Math.floor(diff / (1000 * 60 * 60 * 24));
	}
</script>

<div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-2xl font-bold" style="font-family: var(--font-display)">
			{i18n.t('actionPlan.title')}
		</h1>
		<Button onclick={openNewDialog}>
			<Plus class="mr-1.5 size-4" />
			{i18n.t('actionPlan.newAction')}
		</Button>
	</div>

	<!-- Filter Bar -->
	<Card.Root class="mb-4">
		<Card.Content class="pt-4">
			<div class="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
				<!-- FindingType filter -->
				<div>
					<label class="mb-1 block text-xs font-medium" for="filter-finding">
						{i18n.t('actionPlan.findingType')}
					</label>
					<select id="filter-finding" bind:value={filterFindingType} class="border-input bg-background w-full rounded-md border px-2 py-1.5 text-xs">
						<option value="all">{i18n.t('actionPlan.filterAll')}</option>
						{#each FINDING_TYPES as ft}
							<option value={ft}>{i18n.t('findingType.' + ft)}</option>
						{/each}
					</select>
				</div>
				<!-- Status filter -->
				<div>
					<label class="mb-1 block text-xs font-medium" for="filter-status">
						{i18n.t('actionPlan.status')}
					</label>
					<select id="filter-status" bind:value={filterStatus} class="border-input bg-background w-full rounded-md border px-2 py-1.5 text-xs">
						<option value="all">{i18n.t('actionPlan.filterAll')}</option>
						{#each ACTION_STATUSES as s}
							<option value={s}>{i18n.t('actionStatus.' + s)}</option>
						{/each}
					</select>
				</div>
				<!-- AuditType filter -->
				<div>
					<label class="mb-1 block text-xs font-medium" for="filter-audit-type">
						{i18n.t('actionPlan.auditType')}
					</label>
					<select id="filter-audit-type" bind:value={filterAuditType} class="border-input bg-background w-full rounded-md border px-2 py-1.5 text-xs">
						<option value="all">{i18n.t('actionPlan.filterAll')}</option>
						{#each ACTION_AUDIT_TYPES as at}
							<option value={at}>{i18n.t('auditTypeLabel.' + at)}</option>
						{/each}
					</select>
				</div>
				<!-- Responsible filter -->
				<div>
					<label class="mb-1 block text-xs font-medium" for="filter-responsible">
						{i18n.t('actionPlan.responsible')}
					</label>
					<select id="filter-responsible" bind:value={filterResponsible} class="border-input bg-background w-full rounded-md border px-2 py-1.5 text-xs">
						<option value="all">{i18n.t('actionPlan.filterAll')}</option>
						{#each uniqueResponsibles as r}
							<option value={r}>{r}</option>
						{/each}
					</select>
				</div>
				<!-- Priority filter -->
				<div>
					<label class="mb-1 block text-xs font-medium" for="filter-priority">
						{i18n.t('actionPlan.priority')}
					</label>
					<select id="filter-priority" bind:value={filterPriority} class="border-input bg-background w-full rounded-md border px-2 py-1.5 text-xs">
						<option value="all">{i18n.t('actionPlan.filterAll')}</option>
						{#each PRIORITIES as p}
							<option value={p}>{i18n.t('priorityLabel.' + p)}</option>
						{/each}
					</select>
				</div>
				<!-- Norm filter -->
				<div>
					<label class="mb-1 block text-xs font-medium" for="filter-norm">
						{i18n.t('actionPlan.norm')}
					</label>
					<select id="filter-norm" bind:value={filterNorm} class="border-input bg-background w-full rounded-md border px-2 py-1.5 text-xs">
						<option value="all">{i18n.t('actionPlan.filterAll')}</option>
						{#each ACTION_NORMS as n}
							<option value={n}>{i18n.t('actionNorm.' + n)}</option>
						{/each}
					</select>
				</div>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Action List -->
	{#if filteredActions.length === 0}
		<Card.Root>
			<Card.Content class="py-12 text-center">
				<ListChecks class="text-muted-foreground mx-auto mb-3 size-10" />
				<p class="text-muted-foreground text-sm">{i18n.t('actionPlan.noActions')}</p>
			</Card.Content>
		</Card.Root>
	{:else}
		<div class="space-y-3">
			{#each filteredActions as action}
				{@const overdue = isOverdue(action.dueDate, action.status)}
				<Card.Root class={overdue ? 'border-destructive/50 bg-destructive/5' : ''}>
					<Card.Content class="pt-4">
						<div class="flex items-start justify-between gap-4">
							<div class="min-w-0 flex-1">
								<!-- Header row: finding type badge + priority + status -->
								<div class="mb-2 flex flex-wrap items-center gap-2">
									<span class={'rounded-full px-2.5 py-0.5 text-xs font-medium ' + findingTypeColor(action.findingType)}>
										{i18n.t('findingType.' + action.findingType)}
									</span>
									<span class="bg-muted text-muted-foreground rounded-full px-2.5 py-0.5 text-xs font-medium">
										{i18n.t('priorityLabel.' + action.priority)}
									</span>
									<span class="bg-primary/10 text-primary rounded-full px-2.5 py-0.5 text-xs font-medium">
										{i18n.t('actionStatus.' + action.status)}
									</span>
									{#if overdue}
										<span class="bg-destructive text-destructive-foreground flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium">
											<AlertTriangle class="size-3" />
											{i18n.t('actionPlan.overdue')} ({overdueDays(action.dueDate)}d)
										</span>
									{/if}
								</div>

								<!-- Description -->
								<p class="mb-1 text-sm font-medium">{action.description}</p>

								<!-- Details row -->
								<div class="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs">
									{#if action.responsible}
										<span>{i18n.t('actionPlan.responsible')}: {action.responsible}</span>
									{/if}
									{#if action.dueDate}
										<span>{i18n.t('actionPlan.deadline')}: {action.dueDate}</span>
									{/if}
									{#if action.norm}
										<span>{i18n.t('actionPlan.norm')}: {action.norm}</span>
									{/if}
									<span>{i18n.t('actionPlan.auditType')}: {i18n.t('auditTypeLabel.' + action.auditType)}</span>
								</div>

								{#if action.plannedAction}
									<p class="text-muted-foreground mt-2 text-xs">
										<span class="font-medium">{i18n.t('actionPlan.plannedAction')}:</span>
										{action.plannedAction}
									</p>
								{/if}
							</div>

							<!-- Action buttons -->
							<div class="flex shrink-0 gap-1">
								<Button variant="ghost" size="icon" onclick={() => openEditDialog(action)}>
									<Pencil class="size-4" />
								</Button>
								<Button variant="ghost" size="icon" onclick={() => confirmDelete(action.id)}>
									<Trash2 class="text-destructive size-4" />
								</Button>
							</div>
						</div>
					</Card.Content>
				</Card.Root>
			{/each}
		</div>
	{/if}
</div>

<!-- Create/Edit Dialog -->
{#if dialogOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
		<div class="border-border bg-background max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border p-6 shadow-lg">
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-lg font-semibold" style="font-family: var(--font-display)">
					{editingAction ? i18n.t('actionPlan.editAction') : i18n.t('actionPlan.newAction')}
				</h2>
				<Button variant="ghost" size="icon" onclick={() => (dialogOpen = false)}>
					<X class="size-4" />
				</Button>
			</div>

			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<!-- Description -->
				<div class="md:col-span-2">
					<label class="mb-1 block text-sm font-medium" for="form-description">
						{i18n.t('actionPlan.findingDescription')}
					</label>
					<textarea id="form-description" bind:value={formDescription} rows="3" class="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"></textarea>
				</div>

				<!-- Finding Type -->
				<div>
					<label class="mb-1 block text-sm font-medium" for="form-finding-type">
						{i18n.t('actionPlan.findingType')}
					</label>
					<select id="form-finding-type" bind:value={formFindingType} class="border-input bg-background w-full rounded-md border px-3 py-2 text-sm">
						{#each FINDING_TYPES as ft}
							<option value={ft}>{i18n.t('findingType.' + ft)}</option>
						{/each}
					</select>
				</div>

				<!-- Status -->
				<div>
					<label class="mb-1 block text-sm font-medium" for="form-status">
						{i18n.t('actionPlan.status')}
					</label>
					<select id="form-status" bind:value={formStatus} class="border-input bg-background w-full rounded-md border px-3 py-2 text-sm">
						{#each ACTION_STATUSES as s}
							<option value={s}>{i18n.t('actionStatus.' + s)}</option>
						{/each}
					</select>
				</div>

				<!-- Planned Action -->
				<div class="md:col-span-2">
					<label class="mb-1 block text-sm font-medium" for="form-planned-action">
						{i18n.t('actionPlan.plannedAction')}
					</label>
					<textarea id="form-planned-action" bind:value={formPlannedAction} rows="2" class="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"></textarea>
				</div>

				<!-- Responsible -->
				<div>
					<label class="mb-1 block text-sm font-medium" for="form-responsible">
						{i18n.t('actionPlan.responsible')}
					</label>
					<input id="form-responsible" type="text" bind:value={formResponsible} class="border-input bg-background w-full rounded-md border px-3 py-2 text-sm" />
				</div>

				<!-- Priority -->
				<div>
					<label class="mb-1 block text-sm font-medium" for="form-priority">
						{i18n.t('actionPlan.priority')}
					</label>
					<select id="form-priority" bind:value={formPriority} class="border-input bg-background w-full rounded-md border px-3 py-2 text-sm">
						{#each PRIORITIES as p}
							<option value={p}>{i18n.t('priorityLabel.' + p)}</option>
						{/each}
					</select>
				</div>

				<!-- Due Date -->
				<div>
					<label class="mb-1 block text-sm font-medium" for="form-due-date">
						{i18n.t('actionPlan.deadline')}
					</label>
					<input id="form-due-date" type="date" bind:value={formDueDate} class="border-input bg-background w-full rounded-md border px-3 py-2 text-sm" />
				</div>

				<!-- Completion Date -->
				<div>
					<label class="mb-1 block text-sm font-medium" for="form-completion-date">
						{i18n.t('actionPlan.completionDate')}
					</label>
					<input id="form-completion-date" type="date" bind:value={formCompletionDate} class="border-input bg-background w-full rounded-md border px-3 py-2 text-sm" />
				</div>

				<!-- Norm -->
				<div>
					<label class="mb-1 block text-sm font-medium" for="form-norm">
						{i18n.t('actionPlan.norm')}
					</label>
					<select id="form-norm" bind:value={formNorm} class="border-input bg-background w-full rounded-md border px-3 py-2 text-sm">
						<option value="">{i18n.t('actionPlan.filterAll')}</option>
						{#each ACTION_NORMS as n}
							<option value={n}>{i18n.t('actionNorm.' + n)}</option>
						{/each}
					</select>
				</div>

				<!-- Audit Type -->
				<div>
					<label class="mb-1 block text-sm font-medium" for="form-audit-type">
						{i18n.t('actionPlan.auditType')}
					</label>
					<select id="form-audit-type" bind:value={formAuditType} class="border-input bg-background w-full rounded-md border px-3 py-2 text-sm">
						{#each ACTION_AUDIT_TYPES as at}
							<option value={at}>{i18n.t('auditTypeLabel.' + at)}</option>
						{/each}
					</select>
				</div>

				<!-- Evidence/Notes -->
				<div class="md:col-span-2">
					<label class="mb-1 block text-sm font-medium" for="form-evidence">
						{i18n.t('actionPlan.evidenceNotes')}
					</label>
					<textarea id="form-evidence" bind:value={formEvidenceNotes} rows="2" class="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"></textarea>
				</div>
			</div>

			<div class="mt-6 flex justify-end gap-2">
				<Button variant="outline" onclick={() => (dialogOpen = false)}>
					{i18n.t('common.cancel')}
				</Button>
				<Button onclick={handleSaveAction}>
					{i18n.t('common.save')}
				</Button>
			</div>
		</div>
	</div>
{/if}

<!-- Delete confirmation -->
<AlertDialog.Root bind:open={deleteDialogOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>{i18n.t('actionPlan.deleteAction')}</AlertDialog.Title>
			<AlertDialog.Description>{i18n.t('actionPlan.deleteConfirm')}</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>{i18n.t('common.cancel')}</AlertDialog.Cancel>
			<AlertDialog.Action onclick={handleDelete}>{i18n.t('common.confirm')}</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
