<script lang="ts">
	import { getContext } from 'svelte';
	import type { I18nRune } from '$lib/i18n/i18n.svelte';
	import type { AuditNotes, NotizenBlock, NotizenBlockToggles, QhseDokument, Bewertung } from '$lib/types/audit-notes';
	import { BEWERTUNG_TYPES } from '$lib/types/audit-notes';
	import { organisationseinheitOptionen } from '$lib/data/organisationseinheiten';
	import { abteilungBeschreibungen } from '$lib/data/abteilung-beschreibungen';
	import { zusammenfassungBeschreibungen } from '$lib/data/zusammenfassungen';
	import { alleNormkapitel } from '$lib/data/normkapitel';
	import { generateId } from '$lib/utils/plan-generator';
	import * as Card from '$lib/components/ui/card';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import * as Select from '$lib/components/ui/select';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Badge } from '$lib/components/ui/badge';
	import { Switch } from '$lib/components/ui/switch';
	import { toast } from 'svelte-sonner';
	import Save from '@lucide/svelte/icons/save';
	import FileText from '@lucide/svelte/icons/file-text';
	import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
	import Plus from '@lucide/svelte/icons/plus';
	import X from '@lucide/svelte/icons/x';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Copy from '@lucide/svelte/icons/copy';
	import ChevronUp from '@lucide/svelte/icons/chevron-up';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import ChevronsUpDown from '@lucide/svelte/icons/chevrons-up-down';
	import Upload from '@lucide/svelte/icons/upload';

	const i18n = getContext<I18nRune>('i18n');

	// ── State ───────────────────────────────────────────────────
	let notesName = $state('');
	let header = $state<Partial<AuditNotes>>({});
	let logoBase64 = $state<string | undefined>(undefined);
	let logoDateiname = $state<string | undefined>(undefined);
	let blocks = $state<NotizenBlock[]>([]);
	let resetDialogOpen = $state(false);
	let deleteBlockId = $state<string | null>(null);
	let expandedBlocks = $state<Set<string>>(new Set());

	const orgEinheitNamen = organisationseinheitOptionen.map((o) => o.name);

	// ── Logo ────────────────────────────────────────────────────
	let logoInput: HTMLInputElement;

	function handleLogoUpload(e: Event) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file || !file.type.startsWith('image/') || file.size > 500 * 1024) return;
		const reader = new FileReader();
		reader.onload = () => {
			logoBase64 = (reader.result as string).split(',')[1];
			logoDateiname = file.name;
		};
		reader.readAsDataURL(file);
	}

	// ── Block CRUD ──────────────────────────────────────────────
	function defaultToggles(): NotizenBlockToggles {
		return { datum: true, uhrzeit: true, remote: true, dokumenteAnzeigen: true, bewertungAnzeigen: true, notizenAnzeigen: true };
	}

	function createBlock(): NotizenBlock {
		return {
			id: generateId(),
			auditNotesId: '',
			position: blocks.length,
			normkapitel: [],
			qhseDokumente: [],
			bewertungen: [],
			toggles: defaultToggles()
		};
	}

	function addBlock() {
		blocks = [...blocks, createBlock()];
	}

	function duplicateBlock(idx: number) {
		const orig = blocks[idx];
		const copy: NotizenBlock = {
			...orig,
			id: generateId(),
			position: idx + 1,
			toggles: orig.toggles ? { ...orig.toggles } : defaultToggles(),
			normkapitel: [...orig.normkapitel],
			qhseDokumente: orig.qhseDokumente.map((d) => ({ ...d, id: generateId() })),
			bewertungen: orig.bewertungen.map((b) => ({ ...b, id: generateId(), kapitel: [...b.kapitel] }))
		};
		const newBlocks = [...blocks];
		newBlocks.splice(idx + 1, 0, copy);
		blocks = newBlocks.map((b, i) => ({ ...b, position: i }));
	}

	function confirmDeleteBlock(id: string) {
		deleteBlockId = id;
	}

	function doDeleteBlock() {
		if (!deleteBlockId) return;
		blocks = blocks.filter((b) => b.id !== deleteBlockId).map((b, i) => ({ ...b, position: i }));
		deleteBlockId = null;
	}

	function moveBlockUp(idx: number) {
		if (idx <= 0) return;
		const newBlocks = [...blocks];
		[newBlocks[idx - 1], newBlocks[idx]] = [newBlocks[idx], newBlocks[idx - 1]];
		blocks = newBlocks.map((b, i) => ({ ...b, position: i }));
	}

	function moveBlockDown(idx: number) {
		if (idx >= blocks.length - 1) return;
		const newBlocks = [...blocks];
		[newBlocks[idx], newBlocks[idx + 1]] = [newBlocks[idx + 1], newBlocks[idx]];
		blocks = newBlocks.map((b, i) => ({ ...b, position: i }));
	}

	// ── Block field updates ─────────────────────────────────────
	function updateBlock(idx: number, field: string, value: unknown) {
		blocks = blocks.map((b, i) => (i === idx ? { ...b, [field]: value } : b));
	}

	function updateToggle(idx: number, field: string, value: boolean) {
		blocks = blocks.map((b, i) => (i === idx ? { ...b, toggles: { ...(b.toggles ?? defaultToggles()), [field]: value } } : b));
	}

	function handleOrgChange(idx: number, value: string) {
		const block = blocks[idx];
		const updated: Partial<NotizenBlock> = { organisationseinheit: value };
		if (!block.manuellBeschreibung && abteilungBeschreibungen[value]) {
			updated.beschreibung = abteilungBeschreibungen[value];
		}
		if (!block.manuellZusammenfassung && zusammenfassungBeschreibungen[value]) {
			updated.zusammenfassung = zusammenfassungBeschreibungen[value];
		}
		blocks = blocks.map((b, i) => (i === idx ? { ...b, ...updated } : b));
	}

	function setManualEdit(idx: number, field: string) {
		blocks = blocks.map((b, i) => (i === idx ? { ...b, [field]: true } : b));
	}

	// ── QHSE Documents ──────────────────────────────────────────
	function addQhseDoc(blockIdx: number) {
		const doc: QhseDokument = {
			id: generateId(),
			notizenBlockId: blocks[blockIdx].id,
			position: blocks[blockIdx].qhseDokumente.length,
			name: '',
			datum: '',
			notizen: ''
		};
		blocks = blocks.map((b, i) => (i === blockIdx ? { ...b, qhseDokumente: [...b.qhseDokumente, doc] } : b));
	}

	function removeQhseDoc(blockIdx: number, docIdx: number) {
		blocks = blocks.map((b, i) => (i === blockIdx ? { ...b, qhseDokumente: b.qhseDokumente.filter((_: QhseDokument, j: number) => j !== docIdx) } : b));
	}

	function updateQhseDoc(blockIdx: number, docIdx: number, field: string, value: string) {
		blocks = blocks.map((b, i) =>
			i === blockIdx
				? {
						...b,
						qhseDokumente: b.qhseDokumente.map((d: QhseDokument, j: number) => (j === docIdx ? { ...d, [field]: value } : d))
					}
				: b
		);
	}

	// ── Bewertungen ─────────────────────────────────────────────
	function addBewertung(blockIdx: number) {
		const bew: Bewertung = {
			id: generateId(),
			notizenBlockId: blocks[blockIdx].id,
			position: blocks[blockIdx].bewertungen.length,
			typ: 'observation',
			beschreibung: '',
			kapitel: []
		};
		blocks = blocks.map((b, i) => (i === blockIdx ? { ...b, bewertungen: [...b.bewertungen, bew] } : b));
	}

	function removeBewertung(blockIdx: number, bewIdx: number) {
		blocks = blocks.map((b, i) => (i === blockIdx ? { ...b, bewertungen: b.bewertungen.filter((_: Bewertung, j: number) => j !== bewIdx) } : b));
	}

	function updateBewertung(blockIdx: number, bewIdx: number, field: string, value: unknown) {
		blocks = blocks.map((b, i) =>
			i === blockIdx
				? {
						...b,
						bewertungen: b.bewertungen.map((bw: Bewertung, j: number) => (j === bewIdx ? { ...bw, [field]: value } : bw))
					}
				: b
		);
	}

	// ── Norm chapters for block ─────────────────────────────────
	function getAllNormkapitel(): { id: string; titel: string }[] {
		const all: { id: string; titel: string }[] = [];
		for (const chapters of Object.values(alleNormkapitel)) {
			all.push(...chapters);
		}
		return all;
	}

	const allNormkapitel = getAllNormkapitel();

	function toggleExpandBlock(blockId: string) {
		const next = new Set(expandedBlocks);
		if (next.has(blockId)) next.delete(blockId);
		else next.add(blockId);
		expandedBlocks = next;
	}

	// ── Bewertung colors ────────────────────────────────────────
	function getBewertungColor(typ: string): string {
		switch (typ) {
			case 'major_nonconformity':
				return 'bg-red-100 dark:bg-red-950 border-red-300 dark:border-red-800';
			case 'minor_nonconformity':
				return 'bg-orange-100 dark:bg-orange-950 border-orange-300 dark:border-orange-800';
			case 'observation':
				return 'bg-yellow-100 dark:bg-yellow-950 border-yellow-300 dark:border-yellow-800';
			case 'improvement_potential':
				return 'bg-blue-100 dark:bg-blue-950 border-blue-300 dark:border-blue-800';
			case 'positive_finding':
				return 'bg-green-100 dark:bg-green-950 border-green-300 dark:border-green-800';
			default:
				return '';
		}
	}

	// ── Actions ─────────────────────────────────────────────────
	function handleSave() {
		if (!notesName.trim()) {
			toast.error(i18n.t('notesGenerator.notesName') + ' ' + i18n.t('common.required'));
			return;
		}
		toast.success(i18n.t('notesGenerator.savedSuccess'));
	}

	function handleGenerate() {
		toast.success(i18n.t('notesGenerator.generate'));
	}

	function handleReset() {
		notesName = '';
		header = {};
		logoBase64 = undefined;
		logoDateiname = undefined;
		blocks = [];
		resetDialogOpen = false;
		toast.success(i18n.t('common.success'));
	}

	function getBlockTitle(block: NotizenBlock): string {
		return block.organisationseinheit || `Block ${block.position + 1}`;
	}
</script>

<div class="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
	<!-- Action bar -->
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-2xl font-bold" style="font-family: var(--font-display)">
			{i18n.t('notesGenerator.title')}
		</h1>
		<div class="flex flex-wrap gap-2">
			<Button onclick={handleSave}>
				<Save class="mr-1.5 size-4" />
				{i18n.t('notesGenerator.save')}
			</Button>
			<Button variant="outline" onclick={handleGenerate}>
				<FileText class="mr-1.5 size-4" />
				{i18n.t('notesGenerator.generate')}
			</Button>
			<Button
				variant="destructive"
				onclick={() => {
					resetDialogOpen = true;
				}}
			>
				<RotateCcw class="mr-1.5 size-4" />
				{i18n.t('notesGenerator.resetForm')}
			</Button>
		</div>
	</div>

	<!-- Header -->
	<Card.Root class="mb-6">
		<Card.Header>
			<Card.Title>{i18n.t('notesGenerator.notesName')}</Card.Title>
		</Card.Header>
		<Card.Content class="space-y-4">
			<Input bind:value={notesName} placeholder={i18n.t('notesGenerator.notesNamePlaceholder')} />

			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div class="space-y-2">
					<label class="text-sm font-medium">{i18n.t('notesGenerator.company')}</label>
					<Input
						value={header.firma ?? ''}
						placeholder={i18n.t('notesGenerator.companyPlaceholder')}
						onchange={(e) => {
							header = { ...header, firma: (e.target as HTMLInputElement).value };
						}}
					/>
				</div>
				<div class="space-y-2">
					<label class="text-sm font-medium">{i18n.t('notesGenerator.standards')}</label>
					<Input
						value={header.standards ?? ''}
						placeholder={i18n.t('notesGenerator.standardsPlaceholder')}
						onchange={(e) => {
							header = { ...header, standards: (e.target as HTMLInputElement).value };
						}}
					/>
				</div>
				<div class="space-y-2">
					<label class="text-sm font-medium">{i18n.t('notesGenerator.certificate')}</label>
					<Input
						value={header.zertifikat ?? ''}
						placeholder={i18n.t('notesGenerator.certificatePlaceholder')}
						onchange={(e) => {
							header = { ...header, zertifikat: (e.target as HTMLInputElement).value };
						}}
					/>
				</div>
				<div class="space-y-2">
					<label class="text-sm font-medium">{i18n.t('notesGenerator.auditType')}</label>
					<Input
						value={header.auditart ?? ''}
						placeholder={i18n.t('notesGenerator.auditTypePlaceholder')}
						onchange={(e) => {
							header = { ...header, auditart: (e.target as HTMLInputElement).value };
						}}
					/>
				</div>
				<div class="space-y-2">
					<label class="text-sm font-medium">{i18n.t('notesGenerator.dateFrom')}</label>
					<Input
						type="date"
						value={header.datumVon ?? ''}
						onchange={(e) => {
							header = { ...header, datumVon: (e.target as HTMLInputElement).value };
						}}
					/>
				</div>
				<div class="space-y-2">
					<label class="text-sm font-medium">{i18n.t('notesGenerator.dateTo')}</label>
					<Input
						type="date"
						value={header.datumBis ?? ''}
						onchange={(e) => {
							header = { ...header, datumBis: (e.target as HTMLInputElement).value };
						}}
					/>
				</div>
				<div class="space-y-2">
					<label class="text-sm font-medium">{i18n.t('notesGenerator.location')}</label>
					<Input
						value={header.standort ?? ''}
						placeholder={i18n.t('notesGenerator.locationPlaceholder')}
						onchange={(e) => {
							header = { ...header, standort: (e.target as HTMLInputElement).value };
						}}
					/>
				</div>
				<div class="space-y-2">
					<label class="text-sm font-medium">{i18n.t('notesGenerator.auditor')}</label>
					<Input
						value={header.auditor ?? ''}
						placeholder={i18n.t('notesGenerator.auditorPlaceholder')}
						onchange={(e) => {
							header = { ...header, auditor: (e.target as HTMLInputElement).value };
						}}
					/>
				</div>
				<div class="space-y-2">
					<label class="text-sm font-medium">{i18n.t('notesGenerator.pageFrom')}</label>
					<Input
						value={header.seiteVon ?? ''}
						onchange={(e) => {
							header = { ...header, seiteVon: (e.target as HTMLInputElement).value };
						}}
					/>
				</div>
				<div class="space-y-2">
					<label class="text-sm font-medium">{i18n.t('notesGenerator.pageTo')}</label>
					<Input
						value={header.seiteBis ?? ''}
						onchange={(e) => {
							header = { ...header, seiteBis: (e.target as HTMLInputElement).value };
						}}
					/>
				</div>
			</div>

			<!-- Logo -->
			<div class="space-y-2">
				<label class="text-sm font-medium">{i18n.t('notesGenerator.logo')}</label>
				{#if logoBase64}
					<div class="flex items-center gap-3">
						<img src="data:image/png;base64,{logoBase64}" alt={logoDateiname ?? 'Logo'} class="h-16 rounded border object-contain" />
						<span class="text-muted-foreground text-sm">{logoDateiname}</span>
						<Button
							variant="ghost"
							size="sm"
							onclick={() => {
								logoBase64 = undefined;
								logoDateiname = undefined;
							}}
						>
							<Trash2 class="size-4" />
						</Button>
					</div>
				{:else}
					<Button variant="outline" size="sm" onclick={() => logoInput?.click()}>
						<Upload class="mr-1.5 size-4" />
						{i18n.t('notesGenerator.uploadLogo')}
					</Button>
				{/if}
				<input bind:this={logoInput} type="file" accept="image/png,image/jpeg,image/svg+xml" class="hidden" onchange={handleLogoUpload} />
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Blocks -->
	<div class="space-y-4">
		<div class="flex items-center justify-between">
			<h2 class="text-lg font-semibold" style="font-family: var(--font-display)">
				{i18n.t('notesGenerator.blocks')}
			</h2>
			<Button onclick={addBlock}>
				<Plus class="mr-1.5 size-4" />
				{i18n.t('notesGenerator.addBlock')}
			</Button>
		</div>

		{#each blocks as block, blockIdx}
			<Card.Root class="border-l-brand border-l-4">
				<Card.Header>
					<div class="flex items-center justify-between">
						<Card.Title class="text-base">{getBlockTitle(block)}</Card.Title>
						<div class="flex items-center gap-1">
							<Button variant="ghost" size="icon" onclick={() => moveBlockUp(blockIdx)} disabled={blockIdx === 0}>
								<ChevronUp class="size-4" />
							</Button>
							<Button variant="ghost" size="icon" onclick={() => moveBlockDown(blockIdx)} disabled={blockIdx === blocks.length - 1}>
								<ChevronDown class="size-4" />
							</Button>
							<Button variant="ghost" size="icon" onclick={() => duplicateBlock(blockIdx)}>
								<Copy class="size-4" />
							</Button>
							<Button variant="ghost" size="icon" onclick={() => confirmDeleteBlock(block.id)}>
								<Trash2 class="text-destructive size-4" />
							</Button>
						</div>
					</div>
				</Card.Header>
				<Card.Content class="space-y-4">
					<!-- Main fields -->
					<div class="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-6">
						<div class="space-y-1">
							<label class="text-muted-foreground text-xs">{i18n.t('notesGenerator.blockDate')}</label>
							<Input type="date" value={block.datum ?? ''} onchange={(e) => updateBlock(blockIdx, 'datum', (e.target as HTMLInputElement).value)} />
						</div>
						<div class="space-y-1">
							<label class="text-muted-foreground text-xs">{i18n.t('notesGenerator.blockTimeFrom')}</label>
							<Input type="time" value={block.uhrzeitVon ?? ''} onchange={(e) => updateBlock(blockIdx, 'uhrzeitVon', (e.target as HTMLInputElement).value)} />
						</div>
						<div class="space-y-1">
							<label class="text-muted-foreground text-xs">{i18n.t('notesGenerator.blockTimeTo')}</label>
							<Input type="time" value={block.uhrzeitBis ?? ''} onchange={(e) => updateBlock(blockIdx, 'uhrzeitBis', (e.target as HTMLInputElement).value)} />
						</div>
						<div class="flex items-end gap-2 pb-1">
							<Checkbox checked={block.istRemote ?? false} onCheckedChange={(checked) => updateBlock(blockIdx, 'istRemote', checked === true)} />
							<span class="text-xs">{i18n.t('notesGenerator.blockRemote')}</span>
						</div>
						<div class="space-y-1">
							<label class="text-muted-foreground text-xs">{i18n.t('notesGenerator.blockAuditor')}</label>
							<Input value={block.auditor ?? ''} onchange={(e) => updateBlock(blockIdx, 'auditor', (e.target as HTMLInputElement).value)} />
						</div>
						<div class="space-y-1">
							<label class="text-muted-foreground text-xs">{i18n.t('notesGenerator.blockContactPerson')}</label>
							<Input value={block.gespraechspartner ?? ''} onchange={(e) => updateBlock(blockIdx, 'gespraechspartner', (e.target as HTMLInputElement).value)} />
						</div>
					</div>

					<!-- Org unit + Normkapitel -->
					<div class="grid grid-cols-1 gap-2 md:grid-cols-2">
						<div class="space-y-1">
							<label class="text-muted-foreground text-xs">{i18n.t('notesGenerator.blockOrgUnit')}</label>
							<Input value={block.organisationseinheit ?? ''} list="notes-org-list" onchange={(e) => handleOrgChange(blockIdx, (e.target as HTMLInputElement).value)} />
						</div>
						<div class="space-y-1">
							<label class="text-muted-foreground text-xs">{i18n.t('notesGenerator.blockNormChapters')}</label>
							<div class="flex flex-wrap gap-1">
								{#each block.normkapitel as kap}
									<Badge variant="outline" class="gap-1 text-xs">
										{kap}
										<button
											class="hover:text-destructive"
											onclick={() =>
												updateBlock(
													blockIdx,
													'normkapitel',
													block.normkapitel.filter((k: string) => k !== kap)
												)}
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
									if (val && !block.normkapitel.includes(val)) {
										updateBlock(blockIdx, 'normkapitel', [...block.normkapitel, val]);
									}
									(e.target as HTMLSelectElement).value = '';
								}}
							>
								<option value="">{i18n.t('notesGenerator.blockNormChapters')}...</option>
								{#each allNormkapitel as kap}
									<option value={kap.id}>{kap.id} {kap.titel}</option>
								{/each}
							</select>
						</div>
					</div>

					<!-- 6 Toggles -->
					<div class="flex flex-wrap gap-4 border-t pt-2">
						<div class="flex items-center gap-1.5">
							<Switch checked={block.toggles?.datum ?? true} onCheckedChange={(v) => updateToggle(blockIdx, 'datum', v)} class="scale-75" />
							<span class="text-muted-foreground text-xs">{i18n.t('notesGenerator.toggleDate')}</span>
						</div>
						<div class="flex items-center gap-1.5">
							<Switch checked={block.toggles?.uhrzeit ?? true} onCheckedChange={(v) => updateToggle(blockIdx, 'uhrzeit', v)} class="scale-75" />
							<span class="text-muted-foreground text-xs">{i18n.t('notesGenerator.toggleTime')}</span>
						</div>
						<div class="flex items-center gap-1.5">
							<Switch checked={block.toggles?.remote ?? true} onCheckedChange={(v) => updateToggle(blockIdx, 'remote', v)} class="scale-75" />
							<span class="text-muted-foreground text-xs">{i18n.t('notesGenerator.toggleRemote')}</span>
						</div>
						<div class="flex items-center gap-1.5">
							<Switch checked={block.toggles?.dokumenteAnzeigen ?? true} onCheckedChange={(v) => updateToggle(blockIdx, 'dokumenteAnzeigen', v)} class="scale-75" />
							<span class="text-muted-foreground text-xs">{i18n.t('notesGenerator.toggleDocuments')}</span>
						</div>
						<div class="flex items-center gap-1.5">
							<Switch checked={block.toggles?.bewertungAnzeigen ?? true} onCheckedChange={(v) => updateToggle(blockIdx, 'bewertungAnzeigen', v)} class="scale-75" />
							<span class="text-muted-foreground text-xs">{i18n.t('notesGenerator.toggleAssessment')}</span>
						</div>
						<div class="flex items-center gap-1.5">
							<Switch checked={block.toggles?.notizenAnzeigen ?? true} onCheckedChange={(v) => updateToggle(blockIdx, 'notizenAnzeigen', v)} class="scale-75" />
							<span class="text-muted-foreground text-xs">{i18n.t('notesGenerator.toggleNotes')}</span>
						</div>
						<Button variant="ghost" size="sm" class="ml-auto" onclick={() => toggleExpandBlock(block.id)}>
							<ChevronsUpDown class="mr-1 size-3" />
							{i18n.t('notesGenerator.blockNotes')}
						</Button>
					</div>

					<!-- Collapsible notes section -->
					{#if expandedBlocks.has(block.id)}
						<div class="grid grid-cols-1 gap-2 border-t pt-2 md:grid-cols-2">
							<div class="space-y-1">
								<label class="text-muted-foreground text-xs">{i18n.t('notesGenerator.blockDescription')}</label>
								<Textarea
									value={block.beschreibung ?? ''}
									rows={2}
									onchange={(e) => {
										updateBlock(blockIdx, 'beschreibung', (e.target as HTMLInputElement).value);
										setManualEdit(blockIdx, 'manuellBeschreibung');
									}}
								/>
							</div>
							<div class="space-y-1">
								<label class="text-muted-foreground text-xs">{i18n.t('notesGenerator.blockIntroduction')}</label>
								<Textarea value={block.vorstellung ?? ''} rows={2} onchange={(e) => updateBlock(blockIdx, 'vorstellung', (e.target as HTMLInputElement).value)} />
							</div>
							<div class="space-y-1">
								<label class="text-muted-foreground text-xs">{i18n.t('notesGenerator.blockGeneral')}</label>
								<Textarea value={block.allgemein ?? ''} rows={2} onchange={(e) => updateBlock(blockIdx, 'allgemein', (e.target as HTMLInputElement).value)} />
							</div>
							<div class="space-y-1">
								<label class="text-muted-foreground text-xs">{i18n.t('notesGenerator.blockNotes')}</label>
								<Textarea value={block.notizen ?? ''} rows={2} onchange={(e) => updateBlock(blockIdx, 'notizen', (e.target as HTMLInputElement).value)} />
							</div>
							<div class="space-y-1">
								<label class="text-muted-foreground text-xs">{i18n.t('notesGenerator.blockDocuments')}</label>
								<Textarea value={block.dokumente ?? ''} rows={2} onchange={(e) => updateBlock(blockIdx, 'dokumente', (e.target as HTMLInputElement).value)} />
							</div>
							<div class="space-y-1">
								<label class="text-muted-foreground text-xs">{i18n.t('notesGenerator.blockSummary')}</label>
								<Textarea
									value={block.zusammenfassung ?? ''}
									rows={2}
									onchange={(e) => {
										updateBlock(blockIdx, 'zusammenfassung', (e.target as HTMLInputElement).value);
										setManualEdit(blockIdx, 'manuellZusammenfassung');
									}}
								/>
							</div>
						</div>
					{/if}

					<!-- QHSE Documents -->
					<div class="border-t pt-3">
						<div class="mb-2 flex items-center justify-between">
							<span class="text-sm font-medium">{i18n.t('notesGenerator.qhseDocuments')}</span>
							<Button variant="ghost" size="sm" onclick={() => addQhseDoc(blockIdx)}>
								<Plus class="mr-1 size-4" />
								{i18n.t('notesGenerator.addQhseDocument')}
							</Button>
						</div>
						{#each block.qhseDokumente as doc, docIdx}
							<div class="mb-2 flex items-center gap-2">
								<Input
									value={doc.name ?? ''}
									placeholder={i18n.t('notesGenerator.qhseDocName')}
									class="flex-1"
									onchange={(e) => updateQhseDoc(blockIdx, docIdx, 'name', (e.target as HTMLInputElement).value)}
								/>
								<Input type="date" value={doc.datum ?? ''} class="w-36" onchange={(e) => updateQhseDoc(blockIdx, docIdx, 'datum', (e.target as HTMLInputElement).value)} />
								<Input
									value={doc.notizen ?? ''}
									placeholder={i18n.t('notesGenerator.qhseDocNotes')}
									class="flex-1"
									onchange={(e) => updateQhseDoc(blockIdx, docIdx, 'notizen', (e.target as HTMLInputElement).value)}
								/>
								<Button variant="ghost" size="icon" onclick={() => removeQhseDoc(blockIdx, docIdx)}>
									<X class="size-4" />
								</Button>
							</div>
						{/each}
					</div>

					<!-- Bewertungen -->
					<div class="border-t pt-3">
						<div class="mb-2 flex items-center justify-between">
							<span class="text-sm font-medium">{i18n.t('notesGenerator.assessments')}</span>
							<Button variant="ghost" size="sm" onclick={() => addBewertung(blockIdx)}>
								<Plus class="mr-1 size-4" />
								{i18n.t('notesGenerator.addAssessment')}
							</Button>
						</div>
						{#each block.bewertungen as bew, bewIdx}
							<div class="mb-2 rounded-lg border p-3 {getBewertungColor(bew.typ ?? 'observation')}">
								<div class="mb-2 flex items-center gap-2">
									<Select.Root type="single" value={bew.typ ?? 'observation'} onValueChange={(val) => updateBewertung(blockIdx, bewIdx, 'typ', val)}>
										<Select.Trigger class="w-48">
											{i18n.t(`findingType.${bew.typ ?? 'observation'}`)}
										</Select.Trigger>
										<Select.Content>
											{#each BEWERTUNG_TYPES as typ}
												<Select.Item value={typ} label={i18n.t(`findingType.${typ}`)}>
													{i18n.t(`findingType.${typ}`)}
												</Select.Item>
											{/each}
										</Select.Content>
									</Select.Root>
									<div class="flex flex-1 flex-wrap gap-1">
										{#each bew.kapitel as kap}
											<Badge variant="outline" class="gap-1 text-xs">
												{kap}
												<button
													class="hover:text-destructive"
													onclick={() =>
														updateBewertung(
															blockIdx,
															bewIdx,
															'kapitel',
															bew.kapitel.filter((k: string) => k !== kap)
														)}
												>
													<X class="size-2.5" />
												</button>
											</Badge>
										{/each}
									</div>
									<Button variant="ghost" size="icon" onclick={() => removeBewertung(blockIdx, bewIdx)}>
										<X class="size-4" />
									</Button>
								</div>
								<Textarea
									value={bew.beschreibung ?? ''}
									placeholder={i18n.t('notesGenerator.assessmentDescription')}
									rows={2}
									onchange={(e) => updateBewertung(blockIdx, bewIdx, 'beschreibung', (e.target as HTMLInputElement).value)}
								/>
							</div>
						{/each}
					</div>
				</Card.Content>
			</Card.Root>
		{/each}

		{#if blocks.length === 0}
			<div class="text-muted-foreground flex flex-col items-center gap-2 py-12 text-center">
				<p>{i18n.t('notesGenerator.blocks')}</p>
				<Button variant="outline" onclick={addBlock}>
					<Plus class="mr-1.5 size-4" />
					{i18n.t('notesGenerator.addBlock')}
				</Button>
			</div>
		{/if}
	</div>
</div>

<!-- Datalist for org units -->
<datalist id="notes-org-list">
	{#each orgEinheitNamen as name}
		<option value={name}></option>
	{/each}
</datalist>

<!-- Delete block dialog -->
<AlertDialog.Root
	open={deleteBlockId !== null}
	onOpenChange={(open) => {
		if (!open) deleteBlockId = null;
	}}
>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>{i18n.t('notesGenerator.deleteBlock')}</AlertDialog.Title>
			<AlertDialog.Description>{i18n.t('notesGenerator.deleteBlockConfirm')}</AlertDialog.Description>
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

<!-- Reset dialog -->
<AlertDialog.Root bind:open={resetDialogOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>{i18n.t('notesGenerator.resetForm')}</AlertDialog.Title>
			<AlertDialog.Description>{i18n.t('notesGenerator.resetConfirm')}</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>{i18n.t('common.cancel')}</AlertDialog.Cancel>
			<AlertDialog.Action onclick={handleReset}>{i18n.t('common.confirm')}</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
