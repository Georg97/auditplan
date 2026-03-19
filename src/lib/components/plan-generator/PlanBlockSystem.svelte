<script lang="ts">
	import { getContext } from 'svelte';
	import type { I18nRune } from '$lib/i18n/i18n.svelte';
	import type { AuditPlanBlock, AuditPlanBlockZeile } from '$lib/types/audit-plan';
	import { createEmptyBlock, createEmptyZeile, duplicateBlock, moveBlock, reindexBlocks } from '$lib/utils/plan-generator';
	import { organisationseinheitOptionen } from '$lib/data/organisationseinheiten';
	import { abteilungBeschreibungen } from '$lib/data/abteilung-beschreibungen';
	import { zusammenfassungBeschreibungen } from '$lib/data/zusammenfassungen';
	import { alleNormkapitel } from '$lib/data/normkapitel';
	import { applyAutoPopulation } from '$lib/utils/plan-generator';
	import * as Card from '$lib/components/ui/card';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Badge } from '$lib/components/ui/badge';
	import { Switch } from '$lib/components/ui/switch';
	import Plus from '@lucide/svelte/icons/plus';
	import X from '@lucide/svelte/icons/x';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Copy from '@lucide/svelte/icons/copy';
	import ChevronUp from '@lucide/svelte/icons/chevron-up';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import ChevronsUpDown from '@lucide/svelte/icons/chevrons-up-down';

	const i18n = getContext<I18nRune>('i18n');

	let {
		blocks = $bindable<AuditPlanBlock[]>([]),
		selectedNorms = []
	}: {
		blocks: AuditPlanBlock[];
		selectedNorms: string[];
	} = $props();

	let deleteBlockId = $state<string | null>(null);
	let expandedNotes = $state<Set<string>>(new Set());

	const orgEinheitNamen = $derived(organisationseinheitOptionen.map((o) => o.name));

	// ── Block Operations ────────────────────────────────────────
	function addBlock() {
		blocks = [...blocks, createEmptyBlock('', blocks.length)];
	}

	function confirmDeleteBlock(blockId: string) {
		deleteBlockId = blockId;
	}

	function doDeleteBlock() {
		if (!deleteBlockId) return;
		blocks = reindexBlocks(blocks.filter((b) => b.id !== deleteBlockId));
		deleteBlockId = null;
	}

	function doDuplicateBlock(idx: number) {
		const copy = duplicateBlock(blocks[idx], idx + 1);
		const newBlocks = [...blocks];
		newBlocks.splice(idx + 1, 0, copy);
		blocks = reindexBlocks(newBlocks);
	}

	function doMoveUp(idx: number) {
		if (idx <= 0) return;
		blocks = moveBlock(blocks, idx, idx - 1);
	}

	function doMoveDown(idx: number) {
		if (idx >= blocks.length - 1) return;
		blocks = moveBlock(blocks, idx, idx + 1);
	}

	// ── Zeile Operations ────────────────────────────────────────
	function addZeile(blockIdx: number) {
		const block = blocks[blockIdx];
		const newZeile = createEmptyZeile(block.id, block.zeilen.length);
		blocks = blocks.map((b, i) => (i === blockIdx ? { ...b, zeilen: [...b.zeilen, newZeile] } : b));
	}

	function removeZeile(blockIdx: number, zeileIdx: number) {
		blocks = blocks.map((b, i) => (i === blockIdx ? { ...b, zeilen: b.zeilen.filter((_: AuditPlanBlockZeile, j: number) => j !== zeileIdx) } : b));
	}

	function updateZeile(blockIdx: number, zeileIdx: number, field: string, value: unknown) {
		blocks = blocks.map((b, i) =>
			i === blockIdx
				? {
						...b,
						zeilen: b.zeilen.map((z: AuditPlanBlockZeile, j: number) => (j === zeileIdx ? { ...z, [field]: value } : z))
					}
				: b
		);
	}

	function handleOrgEinheitChange(blockIdx: number, zeileIdx: number, value: string) {
		const zeile = blocks[blockIdx].zeilen[zeileIdx];
		const maps = {
			beschreibungen: abteilungBeschreibungen,
			zusammenfassungen: zusammenfassungBeschreibungen
		};
		const updated = applyAutoPopulation(zeile, value, maps);
		blocks = blocks.map((b, i) =>
			i === blockIdx
				? {
						...b,
						zeilen: b.zeilen.map((z: AuditPlanBlockZeile, j: number) => (j === zeileIdx ? updated : z))
					}
				: b
		);
	}

	// ── Toggle Operations ───────────────────────────────────────
	function updateToggle(blockIdx: number, zeileIdx: number, toggleField: string, value: boolean) {
		blocks = blocks.map((b, i) =>
			i === blockIdx
				? {
						...b,
						zeilen: b.zeilen.map((z: AuditPlanBlockZeile, j: number) =>
							j === zeileIdx ? { ...z, toggles: { ...(z.toggles ?? { datumToggle: true, uhrzeitToggle: true, remoteToggle: true }), [toggleField]: value } } : z
						)
					}
				: b
		);
	}

	// ── Notes Operations ────────────────────────────────────────
	function toggleNotes(zeileId: string) {
		const next = new Set(expandedNotes);
		if (next.has(zeileId)) {
			next.delete(zeileId);
		} else {
			next.add(zeileId);
		}
		expandedNotes = next;
	}

	function updateNote(blockIdx: number, zeileIdx: number, field: string, value: string) {
		blocks = blocks.map((b, i) =>
			i === blockIdx
				? {
						...b,
						zeilen: b.zeilen.map((z: AuditPlanBlockZeile, j: number) =>
							j === zeileIdx
								? {
										...z,
										notizen: { ...(z.notizen ?? {}), [field]: value },
										[`manuellBearbeitet${field.charAt(0).toUpperCase()}${field.slice(1)}`]: true
									}
								: z
						)
					}
				: b
		);
	}

	// ── Normkapitel for org unit ─────────────────────────────────
	function getNormkapitelForOrg(orgEinheit: string): { id: string; titel: string }[] {
		if (!orgEinheit) return [];
		const allChapters: { id: string; titel: string }[] = [];
		for (const norm of selectedNorms) {
			const chapters = alleNormkapitel[norm];
			if (chapters) {
				allChapters.push(...chapters);
			}
		}
		return allChapters;
	}

	function getBlockTitle(block: AuditPlanBlock): string {
		const firstZeile = block.zeilen[0];
		if (firstZeile?.organisationseinheit) return firstZeile.organisationseinheit;
		return `Block ${block.position + 1}`;
	}
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<h2 class="text-lg font-semibold" style="font-family: var(--font-display)">
			{i18n.t('planGenerator.blocks')}
		</h2>
		<Button onclick={addBlock}>
			<Plus class="mr-1.5 size-4" />
			{i18n.t('planGenerator.addBlock')}
		</Button>
	</div>

	{#each blocks as block, blockIdx}
		<Card.Root class="border-l-brand border-l-4">
			<Card.Header>
				<div class="flex items-center justify-between">
					<Card.Title class="text-base">{getBlockTitle(block)}</Card.Title>
					<div class="flex items-center gap-1">
						<Button variant="ghost" size="icon" onclick={() => doMoveUp(blockIdx)} disabled={blockIdx === 0}>
							<ChevronUp class="size-4" />
						</Button>
						<Button variant="ghost" size="icon" onclick={() => doMoveDown(blockIdx)} disabled={blockIdx === blocks.length - 1}>
							<ChevronDown class="size-4" />
						</Button>
						<Button variant="ghost" size="icon" onclick={() => doDuplicateBlock(blockIdx)}>
							<Copy class="size-4" />
						</Button>
						<Button variant="ghost" size="icon" onclick={() => confirmDeleteBlock(block.id)}>
							<Trash2 class="text-destructive size-4" />
						</Button>
					</div>
				</div>
			</Card.Header>
			<Card.Content class="space-y-3">
				{#each block.zeilen as zeile, zeileIdx}
					<div class="bg-muted/30 rounded-lg border p-3">
						<!-- Row main fields -->
						<div class="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-6">
							<div class="space-y-1">
								<label class="text-muted-foreground text-xs">{i18n.t('planGenerator.rowDate')}</label>
								<Input type="date" value={zeile.datum ?? ''} onchange={(e) => updateZeile(blockIdx, zeileIdx, 'datum', (e.target as HTMLInputElement).value)} />
							</div>
							<div class="space-y-1">
								<label class="text-muted-foreground text-xs">{i18n.t('planGenerator.rowTimeFrom')}</label>
								<Input type="time" value={zeile.uhrzeitVon ?? ''} onchange={(e) => updateZeile(blockIdx, zeileIdx, 'uhrzeitVon', (e.target as HTMLInputElement).value)} />
							</div>
							<div class="space-y-1">
								<label class="text-muted-foreground text-xs">{i18n.t('planGenerator.rowTimeTo')}</label>
								<Input type="time" value={zeile.uhrzeitBis ?? ''} onchange={(e) => updateZeile(blockIdx, zeileIdx, 'uhrzeitBis', (e.target as HTMLInputElement).value)} />
							</div>
							<div class="flex items-end gap-2 pb-1">
								<Checkbox checked={zeile.istRemote ?? false} onCheckedChange={(checked) => updateZeile(blockIdx, zeileIdx, 'istRemote', checked === true)} />
								<span class="text-xs">{i18n.t('planGenerator.rowRemote')}</span>
							</div>
							<div class="space-y-1">
								<label class="text-muted-foreground text-xs">{i18n.t('planGenerator.rowAuditor')}</label>
								<Input value={zeile.auditor ?? ''} onchange={(e) => updateZeile(blockIdx, zeileIdx, 'auditor', (e.target as HTMLInputElement).value)} />
							</div>
							<div class="space-y-1">
								<label class="text-muted-foreground text-xs">{i18n.t('planGenerator.rowContactPerson')}</label>
								<Input value={zeile.gespraechspartner ?? ''} onchange={(e) => updateZeile(blockIdx, zeileIdx, 'gespraechspartner', (e.target as HTMLInputElement).value)} />
							</div>
						</div>

						<!-- Org unit + multiselects -->
						<div class="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4">
							<div class="space-y-1">
								<label class="text-muted-foreground text-xs">{i18n.t('planGenerator.rowOrgUnit')}</label>
								<Input
									value={zeile.organisationseinheit ?? ''}
									list="org-einheiten-list"
									onchange={(e) => handleOrgEinheitChange(blockIdx, zeileIdx, (e.target as HTMLInputElement).value)}
								/>
							</div>
							<div class="space-y-1">
								<label class="text-muted-foreground text-xs">{i18n.t('planGenerator.rowNormChapters')}</label>
								<div class="flex flex-wrap gap-1">
									{#each zeile.normkapitel as kap}
										<Badge variant="outline" class="gap-1 text-xs">
											{kap}
											<button
												class="hover:text-destructive"
												onclick={() => {
													updateZeile(
														blockIdx,
														zeileIdx,
														'normkapitel',
														zeile.normkapitel.filter((k: string) => k !== kap)
													);
												}}
											>
												<X class="size-2.5" />
											</button>
										</Badge>
									{/each}
								</div>
								<select
									class="border-input bg-background text-foreground w-full rounded-md border px-2 py-1 text-xs"
									onchange={(e) => {
										const val = (e.target as HTMLSelectElement).value;
										if (val && !zeile.normkapitel.includes(val)) {
											updateZeile(blockIdx, zeileIdx, 'normkapitel', [...zeile.normkapitel, val]);
										}
										(e.target as HTMLSelectElement).value = '';
									}}
								>
									<option value="">{i18n.t('planGenerator.rowNormChapters')}...</option>
									{#each getNormkapitelForOrg(zeile.organisationseinheit ?? '') as kap}
										<option value={kap.id}>{kap.id} {kap.titel}</option>
									{/each}
								</select>
							</div>
							<div class="space-y-1">
								<label class="text-muted-foreground text-xs">{i18n.t('planGenerator.rowTopics')}</label>
								<div class="flex flex-wrap gap-1">
									{#each zeile.themen as thema}
										<Badge variant="outline" class="gap-1 text-xs">
											{thema}
											<button
												class="hover:text-destructive"
												onclick={() => {
													updateZeile(
														blockIdx,
														zeileIdx,
														'themen',
														zeile.themen.filter((t: string) => t !== thema)
													);
												}}
											>
												<X class="size-2.5" />
											</button>
										</Badge>
									{/each}
								</div>
								<Input
									placeholder={i18n.t('planGenerator.rowTopics')}
									onkeydown={(e) => {
										if (e.key === 'Enter') {
											e.preventDefault();
											const val = (e.target as HTMLInputElement).value.trim();
											if (val && !zeile.themen.includes(val)) {
												updateZeile(blockIdx, zeileIdx, 'themen', [...zeile.themen, val]);
												(e.target as HTMLInputElement).value = '';
											}
										}
									}}
								/>
							</div>
							<div class="space-y-1">
								<label class="text-muted-foreground text-xs">{i18n.t('planGenerator.rowElements')}</label>
								<div class="flex flex-wrap gap-1">
									{#each zeile.elemente as element}
										<Badge variant="outline" class="gap-1 text-xs">
											{element}
											<button
												class="hover:text-destructive"
												onclick={() => {
													updateZeile(
														blockIdx,
														zeileIdx,
														'elemente',
														zeile.elemente.filter((el: string) => el !== element)
													);
												}}
											>
												<X class="size-2.5" />
											</button>
										</Badge>
									{/each}
								</div>
								<Input
									placeholder={i18n.t('planGenerator.rowElements')}
									onkeydown={(e) => {
										if (e.key === 'Enter') {
											e.preventDefault();
											const val = (e.target as HTMLInputElement).value.trim();
											if (val && !zeile.elemente.includes(val)) {
												updateZeile(blockIdx, zeileIdx, 'elemente', [...zeile.elemente, val]);
												(e.target as HTMLInputElement).value = '';
											}
										}
									}}
								/>
							</div>
						</div>

						<!-- Toggles -->
						<div class="mt-2 flex flex-wrap gap-4 border-t pt-2">
							<div class="flex items-center gap-1.5">
								<Switch checked={zeile.toggles?.datumToggle ?? true} onCheckedChange={(checked) => updateToggle(blockIdx, zeileIdx, 'datumToggle', checked)} class="scale-75" />
								<span class="text-muted-foreground text-xs">{i18n.t('planGenerator.toggleDate')}</span>
							</div>
							<div class="flex items-center gap-1.5">
								<Switch checked={zeile.toggles?.uhrzeitToggle ?? true} onCheckedChange={(checked) => updateToggle(blockIdx, zeileIdx, 'uhrzeitToggle', checked)} class="scale-75" />
								<span class="text-muted-foreground text-xs">{i18n.t('planGenerator.toggleTime')}</span>
							</div>
							<div class="flex items-center gap-1.5">
								<Switch checked={zeile.toggles?.remoteToggle ?? true} onCheckedChange={(checked) => updateToggle(blockIdx, zeileIdx, 'remoteToggle', checked)} class="scale-75" />
								<span class="text-muted-foreground text-xs">{i18n.t('planGenerator.toggleRemote')}</span>
							</div>
							<Button variant="ghost" size="sm" class="ml-auto" onclick={() => toggleNotes(zeile.id)}>
								<ChevronsUpDown class="mr-1 size-3" />
								{i18n.t('planGenerator.rowNotes')}
							</Button>
							<Button variant="ghost" size="icon" onclick={() => removeZeile(blockIdx, zeileIdx)} disabled={block.zeilen.length <= 1}>
								<X class="size-4" />
							</Button>
						</div>

						<!-- Collapsible notes -->
						{#if expandedNotes.has(zeile.id)}
							<div class="mt-2 grid grid-cols-1 gap-2 border-t pt-2 md:grid-cols-2">
								<div class="space-y-1">
									<label class="text-muted-foreground text-xs">{i18n.t('planGenerator.noteDescription')}</label>
									<Textarea
										value={zeile.notizen?.beschreibung ?? ''}
										rows={2}
										onchange={(e) => updateNote(blockIdx, zeileIdx, 'beschreibung', (e.target as HTMLInputElement).value)}
									/>
								</div>
								<div class="space-y-1">
									<label class="text-muted-foreground text-xs">{i18n.t('planGenerator.noteIntroduction')}</label>
									<Textarea
										value={zeile.notizen?.vorstellung ?? ''}
										rows={2}
										onchange={(e) => updateNote(blockIdx, zeileIdx, 'vorstellung', (e.target as HTMLInputElement).value)}
									/>
								</div>
								<div class="space-y-1">
									<label class="text-muted-foreground text-xs">{i18n.t('planGenerator.noteGeneral')}</label>
									<Textarea value={zeile.notizen?.allgemein ?? ''} rows={2} onchange={(e) => updateNote(blockIdx, zeileIdx, 'allgemein', (e.target as HTMLInputElement).value)} />
								</div>
								<div class="space-y-1">
									<label class="text-muted-foreground text-xs">{i18n.t('planGenerator.noteNotes')}</label>
									<Textarea value={zeile.notizen?.notizen ?? ''} rows={2} onchange={(e) => updateNote(blockIdx, zeileIdx, 'notizen', (e.target as HTMLInputElement).value)} />
								</div>
								<div class="space-y-1">
									<label class="text-muted-foreground text-xs">{i18n.t('planGenerator.noteDocuments')}</label>
									<Textarea value={zeile.notizen?.dokumente ?? ''} rows={2} onchange={(e) => updateNote(blockIdx, zeileIdx, 'dokumente', (e.target as HTMLInputElement).value)} />
								</div>
								<div class="space-y-1">
									<label class="text-muted-foreground text-xs">{i18n.t('planGenerator.noteSummary')}</label>
									<Textarea
										value={zeile.notizen?.zusammenfassung ?? ''}
										rows={2}
										onchange={(e) => updateNote(blockIdx, zeileIdx, 'zusammenfassung', (e.target as HTMLInputElement).value)}
									/>
								</div>
							</div>
						{/if}
					</div>
				{/each}

				<Button variant="outline" size="sm" onclick={() => addZeile(blockIdx)}>
					<Plus class="mr-1 size-4" />
					{i18n.t('planGenerator.addRow')}
				</Button>
			</Card.Content>
		</Card.Root>
	{/each}

	{#if blocks.length === 0}
		<div class="text-muted-foreground flex flex-col items-center gap-2 py-12 text-center">
			<p>{i18n.t('planGenerator.blocks')}</p>
			<Button variant="outline" onclick={addBlock}>
				<Plus class="mr-1.5 size-4" />
				{i18n.t('planGenerator.addBlock')}
			</Button>
		</div>
	{/if}
</div>

<!-- Datalist for org units -->
<datalist id="org-einheiten-list">
	{#each orgEinheitNamen as name}
		<option value={name}></option>
	{/each}
</datalist>

<!-- Delete confirmation dialog -->
<AlertDialog.Root
	open={deleteBlockId !== null}
	onOpenChange={(open) => {
		if (!open) deleteBlockId = null;
	}}
>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>{i18n.t('planGenerator.deleteBlock')}</AlertDialog.Title>
			<AlertDialog.Description>{i18n.t('planGenerator.deleteBlockConfirm')}</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel
				onclick={() => {
					deleteBlockId = null;
				}}>{i18n.t('common.cancel')}</AlertDialog.Cancel
			>
			<AlertDialog.Action onclick={doDeleteBlock}>{i18n.t('common.confirm')}</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
