<script lang="ts">
	import { getContext } from 'svelte';
	import type { I18nRune } from '$lib/i18n/i18n.svelte';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Label } from '$lib/components/ui/label';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import SaveIcon from '@lucide/svelte/icons/save';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import { getActions, addAction, editAction, deleteAction } from '$lib/rpc/massnahmen.remote';
	import { findingTypes, actionStatuses, priorities, normOptions, auditTypeOptions, type ActionFormData, type FindingType } from '$lib/types/action';
	import type { Action } from '$lib/types/action';

	const i18n = getContext<I18nRune>('i18n');

	const INPUT_CLASS =
		'border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none';
	const TEXTAREA_CLASS =
		'border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[60px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none';

	const FINDING_COLOR_MAP: Record<FindingType, string> = {
		major_nonconformity: 'border-l-4 border-l-red-500',
		minor_nonconformity: 'border-l-4 border-l-orange-500',
		recommendation: 'border-l-4 border-l-yellow-500',
		improvement_potential: 'border-l-4 border-l-blue-500',
		positive_finding: 'border-l-4 border-l-green-500',
		observation: 'border-l-4 border-l-gray-500',
		note: 'border-l-4 border-l-sky-500'
	};

	// --- State ---
	let allActions = $state<Action[]>([]);
	let loading = $state(true);
	let savingIds = $state<Set<string>>(new Set());
	let deleteTargetId = $state<string | null>(null);
	let showNewForm = $state(false);

	// Filter state
	let filterFeststellungsart = $state<string>('all');
	let filterStatus = $state<string>('all');
	let filterAudittyp = $state<string>('all');
	let filterVerantwortlicher = $state<string>('all');
	let filterPrioritaet = $state<string>('all');
	let filterNorm = $state<string>('all');

	// New action draft
	let newDraft = $state<ActionFormData>({
		feststellungsbeschreibung: '',
		feststellungsart: 'observation',
		geplanterMassnahme: '',
		status: 'open',
		verantwortlicher: '',
		prioritaet: undefined,
		frist: '',
		abschlussdatum: '',
		norm: undefined,
		nachweiseNotizen: '',
		audittyp: undefined
	});
	let savingNew = $state(false);

	// Editable drafts map: id -> ActionFormData
	let drafts = $state<Record<string, ActionFormData>>({});

	$effect(() => {
		loadActions();
	});

	async function loadActions() {
		loading = true;
		try {
			const result = await getActions();
			allActions = result as Action[];
			// Initialise drafts for each action
			const newDrafts: Record<string, ActionFormData> = {};
			for (const a of allActions) {
				newDrafts[a.id] = {
					feststellungsbeschreibung: a.feststellungsbeschreibung,
					feststellungsart: a.feststellungsart,
					geplanterMassnahme: a.geplanterMassnahme,
					status: a.status,
					verantwortlicher: a.verantwortlicher ?? '',
					prioritaet: a.prioritaet ?? undefined,
					frist: a.frist,
					abschlussdatum: a.abschlussdatum ?? '',
					norm: a.norm ?? undefined,
					nachweiseNotizen: a.nachweiseNotizen ?? '',
					audittyp: a.audittyp ?? undefined
				};
			}
			drafts = newDrafts;
		} finally {
			loading = false;
		}
	}

	// Derived: unique Verantwortliche for filter
	let uniqueVerantwortliche = $derived([...new Set(allActions.map((a) => a.verantwortlicher).filter(Boolean))] as string[]);

	// Today string for overdue check
	const todayStr = new Date().toISOString().slice(0, 10);

	function isOverdue(action: Action): boolean {
		return !!action.frist && action.frist < todayStr && action.status !== 'completed';
	}

	// Filtered list
	let filteredActions = $derived(
		allActions.filter((a) => {
			if (filterFeststellungsart !== 'all' && a.feststellungsart !== filterFeststellungsart) return false;
			if (filterStatus !== 'all' && a.status !== filterStatus) return false;
			if (filterAudittyp !== 'all' && (a.audittyp ?? '') !== filterAudittyp) return false;
			if (filterVerantwortlicher !== 'all' && (a.verantwortlicher ?? '') !== filterVerantwortlicher) return false;
			if (filterPrioritaet !== 'all' && (a.prioritaet ?? '') !== filterPrioritaet) return false;
			if (filterNorm !== 'all' && (a.norm ?? '') !== filterNorm) return false;
			return true;
		})
	);

	async function handleSave(id: string) {
		const data = drafts[id];
		if (!data) return;
		savingIds = new Set([...savingIds, id]);
		try {
			await editAction({ id, data });
			const idx = allActions.findIndex((a) => a.id === id);
			if (idx >= 0) {
				allActions[idx] = { ...allActions[idx], ...data, updatedAt: new Date() };
			}
			toast.success(i18n.t('action_plan.save_success'));
		} catch {
			toast.error(i18n.t('action_plan.save_error'));
		} finally {
			savingIds = new Set([...savingIds].filter((x) => x !== id));
		}
	}

	async function handleDelete() {
		if (!deleteTargetId) return;
		const id = deleteTargetId;
		deleteTargetId = null;
		try {
			await deleteAction(id);
			allActions = allActions.filter((a) => a.id !== id);
			const newDrafts = { ...drafts };
			delete newDrafts[id];
			drafts = newDrafts;
			toast.success(i18n.t('action_plan.delete_success'));
		} catch {
			toast.error(i18n.t('action_plan.save_error'));
		}
	}

	async function handleAddNew() {
		if (!newDraft.feststellungsbeschreibung || !newDraft.geplanterMassnahme || !newDraft.frist) return;
		savingNew = true;
		try {
			const result = (await addAction(newDraft)) as Action;
			allActions = [result, ...allActions];
			drafts = {
				[result.id]: { ...newDraft },
				...drafts
			};
			newDraft = {
				feststellungsbeschreibung: '',
				feststellungsart: 'observation',
				geplanterMassnahme: '',
				status: 'open',
				verantwortlicher: '',
				prioritaet: undefined,
				frist: '',
				abschlussdatum: '',
				norm: undefined,
				nachweiseNotizen: '',
				audittyp: undefined
			};
			showNewForm = false;
			toast.success(i18n.t('action_plan.save_success'));
		} catch {
			toast.error(i18n.t('action_plan.save_error'));
		} finally {
			savingNew = false;
		}
	}
</script>

<div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
	<!-- Header -->
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-2xl font-bold" style="font-family: var(--font-display)">
			{i18n.t('action_plan.title')}
		</h1>
		<Button onclick={() => (showNewForm = !showNewForm)}>
			<PlusIcon class="mr-2 h-4 w-4" />
			{i18n.t('action_plan.add_new')}
		</Button>
	</div>

	<!-- New Action Form -->
	{#if showNewForm}
		<div class="bg-card mb-6 rounded-lg border border-blue-300 p-5 shadow-sm dark:border-blue-700">
			<h2 class="mb-4 text-base font-semibold" style="font-family: var(--font-display)">
				{i18n.t('action_plan.add_new')}
			</h2>
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<!-- Feststellungsbeschreibung -->
				<div class="md:col-span-2">
					<Label class="mb-1 block text-sm font-medium">
						{i18n.t('action_plan.feststellungsbeschreibung')} *
					</Label>
					<textarea class={TEXTAREA_CLASS} bind:value={newDraft.feststellungsbeschreibung} placeholder={i18n.t('action_plan.feststellungsbeschreibung')}></textarea>
				</div>
				<!-- Feststellungsart -->
				<div>
					<Label class="mb-1 block text-sm font-medium">
						{i18n.t('action_plan.feststellungsart')}
					</Label>
					<select class={INPUT_CLASS} bind:value={newDraft.feststellungsart}>
						{#each findingTypes as ft (ft)}
							<option value={ft}>{i18n.t(`action_plan.finding_${ft}`)}</option>
						{/each}
					</select>
				</div>
				<!-- Audittyp -->
				<div>
					<Label class="mb-1 block text-sm font-medium">
						{i18n.t('action_plan.audittyp')}
					</Label>
					<select class={INPUT_CLASS} bind:value={newDraft.audittyp}>
						<option value={undefined}>{i18n.t('action_plan.filter_all')}</option>
						{#each auditTypeOptions as at (at)}
							<option value={at}>{i18n.t(`action_plan.audittype_${at}`)}</option>
						{/each}
					</select>
				</div>
				<!-- Geplante Maßnahme -->
				<div class="md:col-span-2">
					<Label class="mb-1 block text-sm font-medium">
						{i18n.t('action_plan.geplante_massnahme')} *
					</Label>
					<textarea class={TEXTAREA_CLASS} bind:value={newDraft.geplanterMassnahme} placeholder={i18n.t('action_plan.geplante_massnahme')}></textarea>
				</div>
				<!-- Status -->
				<div>
					<Label class="mb-1 block text-sm font-medium">{i18n.t('action_plan.status')}</Label>
					<select class={INPUT_CLASS} bind:value={newDraft.status}>
						{#each actionStatuses as s (s)}
							<option value={s}>{i18n.t(`action_plan.status_${s}`)}</option>
						{/each}
					</select>
				</div>
				<!-- Verantwortlicher -->
				<div>
					<Label class="mb-1 block text-sm font-medium">
						{i18n.t('action_plan.verantwortlicher')}
					</Label>
					<input type="text" class={INPUT_CLASS} bind:value={newDraft.verantwortlicher} placeholder={i18n.t('action_plan.verantwortlicher')} />
				</div>
				<!-- Priorität -->
				<div>
					<Label class="mb-1 block text-sm font-medium">{i18n.t('action_plan.prioritaet')}</Label>
					<select class={INPUT_CLASS} bind:value={newDraft.prioritaet}>
						<option value={undefined}>{i18n.t('action_plan.filter_all')}</option>
						{#each priorities as p (p)}
							<option value={p}>{i18n.t(`action_plan.priority_${p}`)}</option>
						{/each}
					</select>
				</div>
				<!-- Frist -->
				<div>
					<Label class="mb-1 block text-sm font-medium">{i18n.t('action_plan.frist')} *</Label>
					<input type="date" class={INPUT_CLASS} bind:value={newDraft.frist} />
				</div>
				<!-- Abschlussdatum -->
				<div>
					<Label class="mb-1 block text-sm font-medium">
						{i18n.t('action_plan.abschlussdatum')}
					</Label>
					<input type="date" class={INPUT_CLASS} bind:value={newDraft.abschlussdatum} />
				</div>
				<!-- Norm -->
				<div>
					<Label class="mb-1 block text-sm font-medium">{i18n.t('action_plan.norm')}</Label>
					<select class={INPUT_CLASS} bind:value={newDraft.norm}>
						<option value={undefined}>{i18n.t('action_plan.filter_all')}</option>
						{#each normOptions.filter((n) => n !== 'all') as n (n)}
							<option value={n}>{n}</option>
						{/each}
					</select>
				</div>
				<!-- Nachweise / Notizen -->
				<div class="md:col-span-2">
					<Label class="mb-1 block text-sm font-medium">{i18n.t('action_plan.nachweise')}</Label>
					<textarea class={TEXTAREA_CLASS} bind:value={newDraft.nachweiseNotizen} placeholder={i18n.t('action_plan.nachweise')}></textarea>
				</div>
			</div>
			<div class="mt-4 flex gap-2">
				<Button onclick={handleAddNew} disabled={savingNew}>
					<SaveIcon class="mr-2 h-4 w-4" />
					{i18n.t('action_plan.save')}
				</Button>
				<Button variant="outline" onclick={() => (showNewForm = false)}>
					{i18n.t('common.cancel')}
				</Button>
			</div>
		</div>
	{/if}

	<!-- Filter Bar -->
	<div class="bg-card mb-6 rounded-lg border p-4 shadow-sm">
		<div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
			<!-- Row 1 -->
			<div>
				<Label class="text-muted-foreground mb-1 block text-xs font-medium">
					{i18n.t('action_plan.feststellungsart')}
				</Label>
				<select class={INPUT_CLASS} bind:value={filterFeststellungsart}>
					<option value="all">{i18n.t('action_plan.filter_all')}</option>
					{#each findingTypes as ft (ft)}
						<option value={ft}>{i18n.t(`action_plan.finding_${ft}`)}</option>
					{/each}
				</select>
			</div>
			<div>
				<Label class="text-muted-foreground mb-1 block text-xs font-medium">
					{i18n.t('action_plan.status')}
				</Label>
				<select class={INPUT_CLASS} bind:value={filterStatus}>
					<option value="all">{i18n.t('action_plan.filter_all')}</option>
					{#each actionStatuses as s (s)}
						<option value={s}>{i18n.t(`action_plan.status_${s}`)}</option>
					{/each}
				</select>
			</div>
			<div>
				<Label class="text-muted-foreground mb-1 block text-xs font-medium">
					{i18n.t('action_plan.audittyp')}
				</Label>
				<select class={INPUT_CLASS} bind:value={filterAudittyp}>
					<option value="all">{i18n.t('action_plan.filter_all')}</option>
					{#each auditTypeOptions as at (at)}
						<option value={at}>{i18n.t(`action_plan.audittype_${at}`)}</option>
					{/each}
				</select>
			</div>
			<!-- Row 2 -->
			<div>
				<Label class="text-muted-foreground mb-1 block text-xs font-medium">
					{i18n.t('action_plan.verantwortlicher')}
				</Label>
				<select class={INPUT_CLASS} bind:value={filterVerantwortlicher}>
					<option value="all">{i18n.t('action_plan.filter_all')}</option>
					{#each uniqueVerantwortliche as v (v)}
						<option value={v}>{v}</option>
					{/each}
				</select>
			</div>
			<div>
				<Label class="text-muted-foreground mb-1 block text-xs font-medium">
					{i18n.t('action_plan.prioritaet')}
				</Label>
				<select class={INPUT_CLASS} bind:value={filterPrioritaet}>
					<option value="all">{i18n.t('action_plan.filter_all')}</option>
					{#each priorities as p (p)}
						<option value={p}>{i18n.t(`action_plan.priority_${p}`)}</option>
					{/each}
				</select>
			</div>
			<div>
				<Label class="text-muted-foreground mb-1 block text-xs font-medium">
					{i18n.t('action_plan.norm')}
				</Label>
				<select class={INPUT_CLASS} bind:value={filterNorm}>
					<option value="all">{i18n.t('action_plan.filter_all')}</option>
					{#each normOptions.filter((n) => n !== 'all') as n (n)}
						<option value={n}>{n}</option>
					{/each}
				</select>
			</div>
		</div>
	</div>

	<!-- Action Cards -->
	{#if loading}
		<div class="text-muted-foreground py-12 text-center text-sm">{i18n.t('common.loading')}</div>
	{:else if filteredActions.length === 0}
		<div class="text-muted-foreground py-12 text-center text-sm">
			{i18n.t('action_plan.no_actions')}
		</div>
	{:else}
		<div class="flex flex-col gap-4">
			{#each filteredActions as action (action.id)}
				{@const draft = drafts[action.id]}
				{@const overdue = isOverdue(action)}
				{@const colorClass = FINDING_COLOR_MAP[draft?.feststellungsart ?? action.feststellungsart] ?? ''}
				<div class="bg-card rounded-lg border shadow-sm {colorClass} {overdue ? 'ring-2 ring-red-500' : ''}">
					<div class="p-5">
						{#if overdue}
							<div class="mb-3 flex items-center gap-1 text-xs font-semibold text-red-500">
								<span>⚠</span>
								<span>{i18n.t('action_plan.overdue')}</span>
							</div>
						{/if}
						{#if draft}
							<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
								<!-- Feststellungsbeschreibung -->
								<div class="md:col-span-2">
									<Label class="mb-1 block text-sm font-medium">
										{i18n.t('action_plan.feststellungsbeschreibung')}
									</Label>
									<textarea class={TEXTAREA_CLASS} bind:value={draft.feststellungsbeschreibung}></textarea>
								</div>
								<!-- Feststellungsart -->
								<div>
									<Label class="mb-1 block text-sm font-medium">
										{i18n.t('action_plan.feststellungsart')}
									</Label>
									<select class={INPUT_CLASS} bind:value={draft.feststellungsart}>
										{#each findingTypes as ft (ft)}
											<option value={ft}>{i18n.t(`action_plan.finding_${ft}`)}</option>
										{/each}
									</select>
								</div>
								<!-- Audittyp -->
								<div>
									<Label class="mb-1 block text-sm font-medium">
										{i18n.t('action_plan.audittyp')}
									</Label>
									<select class={INPUT_CLASS} bind:value={draft.audittyp}>
										<option value={undefined}>{i18n.t('action_plan.filter_all')}</option>
										{#each auditTypeOptions as at (at)}
											<option value={at}>{i18n.t(`action_plan.audittype_${at}`)}</option>
										{/each}
									</select>
								</div>
								<!-- Geplante Maßnahme -->
								<div class="md:col-span-2">
									<Label class="mb-1 block text-sm font-medium">
										{i18n.t('action_plan.geplante_massnahme')}
									</Label>
									<textarea class={TEXTAREA_CLASS} bind:value={draft.geplanterMassnahme}></textarea>
								</div>
								<!-- Status -->
								<div>
									<Label class="mb-1 block text-sm font-medium">
										{i18n.t('action_plan.status')}
									</Label>
									<select class={INPUT_CLASS} bind:value={draft.status}>
										{#each actionStatuses as s (s)}
											<option value={s}>{i18n.t(`action_plan.status_${s}`)}</option>
										{/each}
									</select>
								</div>
								<!-- Verantwortlicher -->
								<div>
									<Label class="mb-1 block text-sm font-medium">
										{i18n.t('action_plan.verantwortlicher')}
									</Label>
									<input type="text" class={INPUT_CLASS} bind:value={draft.verantwortlicher} placeholder={i18n.t('action_plan.verantwortlicher')} />
								</div>
								<!-- Priorität -->
								<div>
									<Label class="mb-1 block text-sm font-medium">
										{i18n.t('action_plan.prioritaet')}
									</Label>
									<select class={INPUT_CLASS} bind:value={draft.prioritaet}>
										<option value={undefined}>{i18n.t('action_plan.filter_all')}</option>
										{#each priorities as p (p)}
											<option value={p}>{i18n.t(`action_plan.priority_${p}`)}</option>
										{/each}
									</select>
								</div>
								<!-- Frist -->
								<div>
									<Label class="mb-1 block text-sm font-medium">
										{i18n.t('action_plan.frist')}
									</Label>
									<input type="date" class={INPUT_CLASS} bind:value={draft.frist} />
								</div>
								<!-- Abschlussdatum -->
								<div>
									<Label class="mb-1 block text-sm font-medium">
										{i18n.t('action_plan.abschlussdatum')}
									</Label>
									<input type="date" class={INPUT_CLASS} bind:value={draft.abschlussdatum} />
								</div>
								<!-- Norm -->
								<div>
									<Label class="mb-1 block text-sm font-medium">
										{i18n.t('action_plan.norm')}
									</Label>
									<select class={INPUT_CLASS} bind:value={draft.norm}>
										<option value={undefined}>{i18n.t('action_plan.filter_all')}</option>
										{#each normOptions.filter((n) => n !== 'all') as n (n)}
											<option value={n}>{n}</option>
										{/each}
									</select>
								</div>
								<!-- Nachweise / Notizen -->
								<div class="md:col-span-2">
									<Label class="mb-1 block text-sm font-medium">
										{i18n.t('action_plan.nachweise')}
									</Label>
									<textarea class={TEXTAREA_CLASS} bind:value={draft.nachweiseNotizen}></textarea>
								</div>
							</div>
							<!-- Card Actions -->
							<div class="mt-4 flex gap-2">
								<Button size="sm" onclick={() => handleSave(action.id)} disabled={savingIds.has(action.id)}>
									<SaveIcon class="mr-2 h-4 w-4" />
									{i18n.t('action_plan.save')}
								</Button>
								<Button size="sm" variant="destructive" onclick={() => (deleteTargetId = action.id)}>
									<Trash2Icon class="mr-2 h-4 w-4" />
									{i18n.t('common.delete')}
								</Button>
							</div>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<!-- Delete Confirmation Dialog -->
<AlertDialog.Root
	open={deleteTargetId !== null}
	onOpenChange={(open) => {
		if (!open) deleteTargetId = null;
	}}
>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>{i18n.t('action_plan.delete_confirm')}</AlertDialog.Title>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel onclick={() => (deleteTargetId = null)}>
				{i18n.t('common.cancel')}
			</AlertDialog.Cancel>
			<AlertDialog.Action onclick={handleDelete}>
				{i18n.t('common.delete')}
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
