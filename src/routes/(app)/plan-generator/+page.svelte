<script lang="ts">
	import { getContext } from 'svelte';
	import type { I18nRune } from '$lib/i18n/i18n.svelte';
	import {
		type AuditplanDaten,
		type AuditTeamMitglied,
		type AuditzeitZeile,
		type TeamRolle,
		teamRolleValues,
		auditartOptionValues,
		auditSpracheValues,
		schichtsystemValues,
		auditmethodeValues,
		ISO_NORMEN,
		createDefaultAuditplanDaten,
		createDefaultBlockNotizen,
		createDefaultManuellBearbeitet
	} from '$lib/types';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Label } from '$lib/components/ui/label';
	import { Switch } from '$lib/components/ui/switch';
	import * as RadioGroup from '$lib/components/ui/radio-group';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import * as Collapsible from '$lib/components/ui/collapsible';
	import { toast } from 'svelte-sonner';
	import SaveIcon from '@lucide/svelte/icons/save';
	import FileTextIcon from '@lucide/svelte/icons/file-text';
	import FileDownIcon from '@lucide/svelte/icons/file-down';
	import StickyNoteIcon from '@lucide/svelte/icons/sticky-note';
	import RotateCcwIcon from '@lucide/svelte/icons/rotate-ccw';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import XIcon from '@lucide/svelte/icons/x';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import UploadIcon from '@lucide/svelte/icons/upload';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import ArrowUpIcon from '@lucide/svelte/icons/arrow-up';
	import ArrowDownIcon from '@lucide/svelte/icons/arrow-down';
	import GripVerticalIcon from '@lucide/svelte/icons/grip-vertical';
	import SearchIcon from '@lucide/svelte/icons/search';

	const i18n = getContext<I18nRune>('i18n');

	let plan: AuditplanDaten = $state(createDefaultAuditplanDaten());
	let resetDialogOpen = $state(false);
	let deleteBlockId = $state<string | null>(null);

	// --- ZN ---
	let znInput = $state('');

	function addZN() {
		const val = znInput.trim();
		if (val && !plan.zertifikatsnummern.includes(val)) {
			plan.zertifikatsnummern = [...plan.zertifikatsnummern, val];
			znInput = '';
		}
	}

	function removeZN(zn: string) {
		plan.zertifikatsnummern = plan.zertifikatsnummern.filter((z) => z !== zn);
	}

	// --- Logo ---
	let fileInput: HTMLInputElement | undefined = $state();

	function handleLogoUpload(e: Event) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = () => {
			plan.logoBase64 = reader.result as string;
			plan.logoDateiname = file.name;
		};
		reader.readAsDataURL(file);
	}

	function removeLogo() {
		plan.logoBase64 = null;
		plan.logoDateiname = null;
		if (fileInput) fileInput.value = '';
	}

	// --- Standorte ---
	function addStandort() {
		plan.grunddaten.standorte = [...plan.grunddaten.standorte, { id: crypto.randomUUID(), name: '' }];
	}

	function removeStandort(id: string) {
		if (plan.grunddaten.standorte.length <= 1) return;
		plan.grunddaten.standorte = plan.grunddaten.standorte.filter((s) => s.id !== id);
	}

	// --- Normgrundlage ---
	let normSearch = $state('');
	let filteredNormen = $derived(ISO_NORMEN.filter((n) => n.label.toLowerCase().includes(normSearch.toLowerCase()) || n.id.toLowerCase().includes(normSearch.toLowerCase())));

	function toggleNorm(id: string) {
		const selected = plan.grunddaten.normgrundlage.ausgewaehlteNormen;
		if (selected.includes(id)) {
			plan.grunddaten.normgrundlage.ausgewaehlteNormen = selected.filter((n) => n !== id);
		} else {
			plan.grunddaten.normgrundlage.ausgewaehlteNormen = [...selected, id];
		}
	}

	// --- Auditart ---
	let auditartSearch = $state('');
	let auditartCustom = $state('');
	let filteredAuditarten = $derived(auditartOptionValues.filter((a) => i18n.t(`plan.auditartOptions.${a}`).toLowerCase().includes(auditartSearch.toLowerCase())));

	function toggleAuditart(art: string) {
		if (plan.auditdetails.auditart.includes(art)) {
			plan.auditdetails.auditart = plan.auditdetails.auditart.filter((a) => a !== art);
		} else {
			plan.auditdetails.auditart = [...plan.auditdetails.auditart, art];
		}
	}

	function addCustomAuditart() {
		const val = auditartCustom.trim();
		if (val && !plan.auditdetails.auditart.includes(val)) {
			plan.auditdetails.auditart = [...plan.auditdetails.auditart, val];
			auditartCustom = '';
		}
	}

	// --- Auditsprachen ---
	let sprachenOpen = $state(false);

	function toggleSprache(lang: string) {
		const langs = plan.auditdetails.auditsprachen as string[];
		if (langs.includes(lang)) {
			plan.auditdetails.auditsprachen = langs.filter((l) => l !== lang) as typeof plan.auditdetails.auditsprachen;
		} else {
			plan.auditdetails.auditsprachen = [...langs, lang] as typeof plan.auditdetails.auditsprachen;
		}
	}

	// --- Audit-Team ---
	function addTeamMember(rolle: TeamRolle) {
		plan.auditTeam = [
			...plan.auditTeam,
			{
				id: crypto.randomUUID(),
				rolle,
				name: '',
				istExtern: false,
				firmenname: ''
			}
		];
	}

	function removeTeamMember(id: string) {
		plan.auditTeam = plan.auditTeam.filter((m) => m.id !== id);
	}

	function getTeamByRole(rolle: TeamRolle): AuditTeamMitglied[] {
		return plan.auditTeam.filter((m) => m.rolle === rolle);
	}

	// --- Revisionen ---
	function addRevision() {
		const nextNum = plan.revisionen.length + 1;
		plan.revisionen = [
			...plan.revisionen,
			{
				id: crypto.randomUUID(),
				nummer: `Rev. ${nextNum}.0`,
				datum: new Date().toISOString().split('T')[0],
				beschreibung: ''
			}
		];
	}

	function removeRevision(id: string) {
		plan.revisionen = plan.revisionen.filter((r) => r.id !== id);
		plan.revisionen = plan.revisionen.map((r, i) => ({
			...r,
			nummer: `Rev. ${i + 1}.0`
		}));
	}

	// --- Auditzeiten ---
	function addAuditzeitenTabelle() {
		plan.auditzeiten = [
			...plan.auditzeiten,
			{
				id: crypto.randomUUID(),
				auditorId: '',
				auditorName: '',
				standortId: '',
				standortName: '',
				zeilen: [],
				gesamtStunden: 0
			}
		];
	}

	function removeAuditzeitenTabelle(id: string) {
		plan.auditzeiten = plan.auditzeiten.filter((t) => t.id !== id);
	}

	function addAuditzeitZeile(tabelleId: string) {
		plan.auditzeiten = plan.auditzeiten.map((t) => {
			if (t.id === tabelleId) {
				return {
					...t,
					zeilen: [...t.zeilen, { id: crypto.randomUUID(), startzeit: '', endzeit: '', aktivitaet: '', stunden: 0 }]
				};
			}
			return t;
		});
	}

	function removeAuditzeitZeile(tabelleId: string, zeileId: string) {
		plan.auditzeiten = plan.auditzeiten.map((t) => {
			if (t.id === tabelleId) {
				const zeilen = t.zeilen.filter((z) => z.id !== zeileId);
				return { ...t, zeilen, gesamtStunden: calcGesamtStunden(zeilen) };
			}
			return t;
		});
	}

	function calcStunden(start: string, end: string): number {
		if (!start || !end) return 0;
		const [sh, sm] = start.split(':').map(Number);
		const [eh, em] = end.split(':').map(Number);
		const diff = (eh * 60 + em - (sh * 60 + sm)) / 60;
		return diff > 0 ? Math.round(diff * 100) / 100 : 0;
	}

	function calcGesamtStunden(zeilen: AuditzeitZeile[]): number {
		return zeilen.reduce((sum, z) => sum + z.stunden, 0);
	}

	function updateAuditzeitZeile(tabelleId: string, zeileId: string, field: string, value: string) {
		plan.auditzeiten = plan.auditzeiten.map((t) => {
			if (t.id === tabelleId) {
				const zeilen = t.zeilen.map((z) => {
					if (z.id === zeileId) {
						const updated = { ...z, [field]: value };
						updated.stunden = calcStunden(updated.startzeit, updated.endzeit);
						return updated;
					}
					return z;
				});
				return { ...t, zeilen, gesamtStunden: calcGesamtStunden(zeilen) };
			}
			return t;
		});
	}

	// --- Audit-Blöcke ---
	function addAuditBlock() {
		const id = Date.now().toString();
		const position = plan.auditBloecke.length;
		plan.auditBloecke = [
			...plan.auditBloecke,
			{
				id,
				zeilen: [
					{
						id: crypto.randomUUID(),
						blockId: id,
						datum: '',
						uhrzeitVon: '',
						uhrzeitBis: '',
						istRemote: false,
						organisationseinheit: '',
						normkapitel: [],
						thema: [],
						elementProzess: [],
						auditor: '',
						gespraechspartner: '',
						datumToggle: true,
						uhrzeitToggle: true,
						remoteToggle: true,
						notizen: createDefaultBlockNotizen(),
						manuellBearbeitet: createDefaultManuellBearbeitet()
					}
				],
				position
			}
		];
	}

	function confirmDeleteBlock() {
		if (!deleteBlockId) return;
		plan.auditBloecke = plan.auditBloecke.filter((b) => b.id !== deleteBlockId).map((b, i) => ({ ...b, position: i }));
		deleteBlockId = null;
	}

	function duplicateBlock(blockId: string) {
		const original = plan.auditBloecke.find((b) => b.id === blockId);
		if (!original) return;
		const newId = Date.now().toString();
		const cloned = {
			...structuredClone(original),
			id: newId,
			position: original.position + 1,
			zeilen: original.zeilen.map((z) => ({
				...structuredClone(z),
				id: crypto.randomUUID(),
				blockId: newId
			}))
		};
		const idx = plan.auditBloecke.findIndex((b) => b.id === blockId);
		const updated = [...plan.auditBloecke];
		updated.splice(idx + 1, 0, cloned);
		plan.auditBloecke = updated.map((b, i) => ({ ...b, position: i }));
	}

	function moveBlock(blockId: string, direction: 'up' | 'down') {
		const idx = plan.auditBloecke.findIndex((b) => b.id === blockId);
		if (idx < 0) return;
		const newIdx = direction === 'up' ? idx - 1 : idx + 1;
		if (newIdx < 0 || newIdx >= plan.auditBloecke.length) return;
		const updated = [...plan.auditBloecke];
		[updated[idx], updated[newIdx]] = [updated[newIdx], updated[idx]];
		plan.auditBloecke = updated.map((b, i) => ({ ...b, position: i }));
	}

	function addBlockZeile(blockId: string) {
		plan.auditBloecke = plan.auditBloecke.map((b) => {
			if (b.id === blockId) {
				return {
					...b,
					zeilen: [
						...b.zeilen,
						{
							id: crypto.randomUUID(),
							blockId,
							datum: '',
							uhrzeitVon: '',
							uhrzeitBis: '',
							istRemote: false,
							organisationseinheit: '',
							normkapitel: [],
							thema: [],
							elementProzess: [],
							auditor: '',
							gespraechspartner: '',
							datumToggle: true,
							uhrzeitToggle: true,
							remoteToggle: true,
							notizen: createDefaultBlockNotizen(),
							manuellBearbeitet: createDefaultManuellBearbeitet()
						}
					]
				};
			}
			return b;
		});
	}

	function removeBlockZeile(blockId: string, zeileId: string) {
		plan.auditBloecke = plan.auditBloecke.map((b) => {
			if (b.id === blockId && b.zeilen.length > 1) {
				return { ...b, zeilen: b.zeilen.filter((z) => z.id !== zeileId) };
			}
			return b;
		});
	}

	// --- Actions ---
	function handleSave() {
		toast.success(i18n.t('plan.saveSuccess'));
	}

	function handleReset() {
		plan = createDefaultAuditplanDaten();
		resetDialogOpen = false;
		toast.success(i18n.t('plan.resetConfirmTitle'));
	}
</script>

<!-- Fixed Action Bar -->
<div class="bg-card/95 sticky top-0 z-40 border-b backdrop-blur-sm">
	<div class="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-3 sm:px-6 lg:px-8">
		<Button onclick={handleSave} class="gap-2">
			<SaveIcon class="size-4" />
			{i18n.t('plan.save')}
		</Button>
		<Button variant="outline" class="gap-2">
			<FileTextIcon class="size-4" />
			{i18n.t('plan.generateWord')}
		</Button>
		<Button variant="outline" class="gap-2">
			<FileDownIcon class="size-4" />
			{i18n.t('plan.generatePdf')}
		</Button>
		<Button variant="outline" class="gap-2">
			<StickyNoteIcon class="size-4" />
			{i18n.t('plan.generateNotes')}
		</Button>
		<div class="flex-1"></div>
		<AlertDialog.Root bind:open={resetDialogOpen}>
			<AlertDialog.Trigger>
				{#snippet child({ props })}
					<Button variant="destructive" class="gap-2" {...props}>
						<RotateCcwIcon class="size-4" />
						{i18n.t('plan.resetForm')}
					</Button>
				{/snippet}
			</AlertDialog.Trigger>
			<AlertDialog.Portal>
				<AlertDialog.Overlay />
				<AlertDialog.Content>
					<AlertDialog.Header>
						<AlertDialog.Title>{i18n.t('plan.resetConfirmTitle')}</AlertDialog.Title>
						<AlertDialog.Description>{i18n.t('plan.resetConfirmDescription')}</AlertDialog.Description>
					</AlertDialog.Header>
					<AlertDialog.Footer>
						<AlertDialog.Cancel>{i18n.t('common.cancel')}</AlertDialog.Cancel>
						<AlertDialog.Action onclick={handleReset}>{i18n.t('common.confirm')}</AlertDialog.Action>
					</AlertDialog.Footer>
				</AlertDialog.Content>
			</AlertDialog.Portal>
		</AlertDialog.Root>
	</div>
</div>

<div class="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
	<h1 class="animate-fade-up text-3xl font-bold tracking-tight" style="font-family: var(--font-display)">
		{i18n.t('plan.title')}
	</h1>

	<!-- 01: ZN-Verwaltung -->
	<Card.Root class="animate-fade-up overflow-hidden" style="animation-delay: 50ms">
		<Card.Header>
			<Card.Title class="flex items-center gap-3" style="font-family: var(--font-display)">
				<span class="bg-brand/10 text-brand inline-flex size-8 items-center justify-center rounded-lg text-sm font-bold">01</span>
				{i18n.t('plan.znTitle')}
			</Card.Title>
		</Card.Header>
		<Card.Content>
			<div class="flex items-center gap-2">
				<input
					type="text"
					bind:value={znInput}
					placeholder={i18n.t('plan.znPlaceholder')}
					class="bg-background border-input focus:ring-ring flex h-9 flex-1 rounded-md border px-3 text-sm focus:ring-2 focus:outline-none"
					onkeydown={(e: KeyboardEvent) => e.key === 'Enter' && (e.preventDefault(), addZN())}
				/>
				<Button size="sm" onclick={addZN} class="gap-1">
					<PlusIcon class="size-4" />
					{i18n.t('plan.znAdd')}
				</Button>
			</div>
			{#if plan.zertifikatsnummern.length > 0}
				<div class="mt-3 flex flex-wrap gap-2">
					{#each plan.zertifikatsnummern as zn (zn)}
						<Badge variant="secondary" class="gap-1 px-3 py-1.5">
							{zn}
							<button onclick={() => removeZN(zn)} class="hover:bg-muted -mr-1 ml-1 inline-flex size-4 items-center justify-center rounded-full">
								<XIcon class="size-3" />
							</button>
						</Badge>
					{/each}
				</div>
			{/if}
		</Card.Content>
	</Card.Root>

	<!-- 02: Logo -->
	<Card.Root class="animate-fade-up overflow-hidden" style="animation-delay: 100ms">
		<Card.Header>
			<Card.Title class="flex items-center gap-3" style="font-family: var(--font-display)">
				<span class="bg-brand/10 text-brand inline-flex size-8 items-center justify-center rounded-lg text-sm font-bold">02</span>
				{i18n.t('plan.logoTitle')}
			</Card.Title>
		</Card.Header>
		<Card.Content>
			<input bind:this={fileInput} type="file" accept="image/*" onchange={handleLogoUpload} class="hidden" />
			{#if plan.logoBase64}
				<div class="border-muted flex flex-col items-start gap-3">
					<div class="border-muted bg-muted/30 flex h-[150px] items-center justify-center overflow-hidden rounded-lg border border-dashed p-2">
						<img src={plan.logoBase64} alt={plan.logoDateiname ?? 'Logo'} class="max-h-full max-w-full object-contain" />
					</div>
					<Button variant="outline" size="sm" onclick={removeLogo} class="gap-2">
						<Trash2Icon class="size-4" />
						{i18n.t('plan.logoRemove')}
					</Button>
				</div>
			{:else}
				<button
					onclick={() => fileInput?.click()}
					class="border-muted hover:border-brand/50 hover:bg-muted/50 flex h-[150px] w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed transition-colors"
				>
					<UploadIcon class="text-muted-foreground size-8" />
					<span class="text-muted-foreground text-sm">{i18n.t('plan.logoUpload')}</span>
				</button>
			{/if}
		</Card.Content>
	</Card.Root>

	<!-- 03: Grunddaten -->
	<Card.Root class="animate-fade-up overflow-hidden" style="animation-delay: 150ms">
		<Card.Header>
			<Card.Title class="flex items-center gap-3" style="font-family: var(--font-display)">
				<span class="bg-brand/10 text-brand inline-flex size-8 items-center justify-center rounded-lg text-sm font-bold">03</span>
				{i18n.t('plan.basicData')}
			</Card.Title>
		</Card.Header>
		<Card.Content class="space-y-6">
			<!-- Auftraggeber -->
			<div class="space-y-2">
				<Label>{i18n.t('plan.client')}</Label>
				<textarea
					bind:value={plan.grunddaten.auftraggeber}
					rows={4}
					placeholder={i18n.t('plan.placeholders.client')}
					class="bg-background border-input focus:ring-ring w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
				></textarea>
			</div>

			<!-- Standorte -->
			<div class="space-y-2">
				<Label>{i18n.t('plan.locations')}</Label>
				<div class="space-y-2">
					{#each plan.grunddaten.standorte as standort, i (standort.id)}
						<div class="flex items-center gap-2">
							<input
								type="text"
								bind:value={plan.grunddaten.standorte[i].name}
								placeholder={i18n.t('plan.placeholders.location')}
								class="bg-background border-input focus:ring-ring flex h-9 flex-1 rounded-md border px-3 text-sm focus:ring-2 focus:outline-none"
							/>
							{#if plan.grunddaten.standorte.length > 1}
								<Button variant="ghost" size="icon" onclick={() => removeStandort(standort.id)}>
									<Trash2Icon class="text-muted-foreground size-4" />
								</Button>
							{/if}
						</div>
					{/each}
				</div>
				<Button variant="outline" size="sm" onclick={addStandort} class="gap-1">
					<PlusIcon class="size-4" />
					{i18n.t('plan.addLocation')}
				</Button>
			</div>

			<!-- Geltungsbereich -->
			<div class="space-y-2">
				<Label>{i18n.t('plan.scope')}</Label>
				<textarea
					bind:value={plan.grunddaten.geltungsbereich}
					rows={3}
					placeholder={i18n.t('plan.placeholders.scope')}
					class="bg-background border-input focus:ring-ring w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
				></textarea>
			</div>

			<!-- Normgrundlage -->
			<div class="space-y-3">
				<Label>{i18n.t('plan.normBasis')}</Label>
				<div class="relative">
					<SearchIcon class="text-muted-foreground pointer-events-none absolute top-2.5 left-3 size-4" />
					<input
						type="text"
						bind:value={normSearch}
						placeholder={i18n.t('plan.normSearch')}
						class="bg-background border-input focus:ring-ring flex h-9 w-full rounded-md border py-1 pr-3 pl-9 text-sm focus:ring-2 focus:outline-none"
					/>
				</div>
				<div class="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
					{#each filteredNormen as norm (norm.id)}
						<label class="hover:bg-muted/50 flex cursor-pointer items-center gap-2 rounded-md border p-3 transition-colors">
							<Checkbox checked={plan.grunddaten.normgrundlage.ausgewaehlteNormen.includes(norm.id)} onCheckedChange={() => toggleNorm(norm.id)} />
							<span class="text-sm">{norm.label}</span>
						</label>
					{/each}
				</div>
				{#if plan.grunddaten.normgrundlage.ausgewaehlteNormen.includes('andere')}
					<input
						type="text"
						bind:value={plan.grunddaten.normgrundlage.freitext}
						placeholder={i18n.t('plan.normOtherPlaceholder')}
						class="bg-background border-input focus:ring-ring flex h-9 w-full rounded-md border px-3 text-sm focus:ring-2 focus:outline-none"
					/>
				{/if}
				{#if plan.grunddaten.normgrundlage.ausgewaehlteNormen.length > 0}
					<div class="flex flex-wrap gap-2">
						{#each plan.grunddaten.normgrundlage.ausgewaehlteNormen as normId (normId)}
							{@const norm = ISO_NORMEN.find((n) => n.id === normId)}
							<Badge variant="outline" class="gap-1">
								{norm?.label ?? normId}
								<button onclick={() => toggleNorm(normId)} class="hover:bg-muted -mr-1 ml-1 inline-flex size-4 items-center justify-center rounded-full">
									<XIcon class="size-3" />
								</button>
							</Badge>
						{/each}
					</div>
				{/if}
			</div>
		</Card.Content>
	</Card.Root>

	<!-- 04: Auditdetails -->
	<Card.Root class="animate-fade-up overflow-hidden" style="animation-delay: 200ms">
		<Card.Header>
			<Card.Title class="flex items-center gap-3" style="font-family: var(--font-display)">
				<span class="bg-brand/10 text-brand inline-flex size-8 items-center justify-center rounded-lg text-sm font-bold">04</span>
				{i18n.t('plan.auditDetails')}
			</Card.Title>
		</Card.Header>
		<Card.Content class="space-y-6">
			<!-- Auditart -->
			<div class="space-y-3">
				<Label>{i18n.t('plan.auditType')}</Label>
				<div class="relative">
					<SearchIcon class="text-muted-foreground pointer-events-none absolute top-2.5 left-3 size-4" />
					<input
						type="text"
						bind:value={auditartSearch}
						placeholder={i18n.t('plan.auditTypeSearch')}
						class="bg-background border-input focus:ring-ring flex h-9 w-full rounded-md border py-1 pr-3 pl-9 text-sm focus:ring-2 focus:outline-none"
					/>
				</div>
				<div class="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
					{#each filteredAuditarten as art (art)}
						<label class="hover:bg-muted/50 flex cursor-pointer items-center gap-2 rounded-md border p-3 transition-colors">
							<Checkbox checked={plan.auditdetails.auditart.includes(art)} onCheckedChange={() => toggleAuditart(art)} />
							<span class="text-sm">{i18n.t(`plan.auditartOptions.${art}`)}</span>
						</label>
					{/each}
				</div>
				<!-- Custom Auditart -->
				<div class="flex items-center gap-2">
					<input
						type="text"
						bind:value={auditartCustom}
						placeholder={i18n.t('plan.auditTypeCustom')}
						class="bg-background border-input focus:ring-ring flex h-9 flex-1 rounded-md border px-3 text-sm focus:ring-2 focus:outline-none"
						onkeydown={(e: KeyboardEvent) => e.key === 'Enter' && (e.preventDefault(), addCustomAuditart())}
					/>
					<Button size="sm" variant="outline" onclick={addCustomAuditart}>
						<PlusIcon class="size-4" />
					</Button>
				</div>
				{#if plan.auditdetails.auditart.length > 0}
					<div class="flex flex-wrap gap-2">
						{#each plan.auditdetails.auditart as art (art)}
							<Badge variant="secondary" class="gap-1">
								{auditartOptionValues.includes(art as (typeof auditartOptionValues)[number]) ? i18n.t(`plan.auditartOptions.${art}`) : art}
								<button onclick={() => toggleAuditart(art)} class="hover:bg-muted -mr-1 ml-1 inline-flex size-4 items-center justify-center rounded-full">
									<XIcon class="size-3" />
								</button>
							</Badge>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Beauftragter -->
			<div class="space-y-2">
				<Label>{i18n.t('plan.commissioner')}</Label>
				<input
					type="text"
					bind:value={plan.auditdetails.beauftragter}
					placeholder={i18n.t('plan.placeholders.commissioner')}
					class="bg-background border-input focus:ring-ring flex h-9 w-full rounded-md border px-3 text-sm focus:ring-2 focus:outline-none"
				/>
			</div>

			<!-- Auditziel -->
			<div class="space-y-2">
				<div class="flex items-center justify-between">
					<Label>{i18n.t('plan.auditGoal')}</Label>
					<label class="flex items-center gap-2">
						<Checkbox
							checked={plan.auditdetails.auditzielEditierbar}
							onCheckedChange={(checked) => {
								plan.auditdetails.auditzielEditierbar = !!checked;
							}}
						/>
						<span class="text-muted-foreground text-sm">{i18n.t('plan.auditGoalEditable')}</span>
					</label>
				</div>
				<textarea
					bind:value={plan.auditdetails.auditziel}
					rows={4}
					placeholder={i18n.t('plan.placeholders.auditGoal')}
					readonly={!plan.auditdetails.auditzielEditierbar}
					class="bg-background border-input focus:ring-ring w-full rounded-md border px-3 py-2 text-sm transition-colors focus:ring-2 focus:outline-none {!plan.auditdetails
						.auditzielEditierbar
						? 'bg-muted cursor-not-allowed opacity-70'
						: ''}"
				></textarea>
			</div>

			<!-- Auditsprachen -->
			<div class="space-y-2">
				<Label>{i18n.t('plan.auditLanguages')}</Label>
				<Collapsible.Root bind:open={sprachenOpen}>
					<Collapsible.Trigger>
						{#snippet child({ props })}
							<button {...props} class="border-input hover:bg-muted/50 flex h-9 w-full items-center justify-between rounded-md border px-3 text-sm">
								<span class="text-muted-foreground">
									{plan.auditdetails.auditsprachen.length > 0
										? plan.auditdetails.auditsprachen.map((l) => i18n.t(`plan.languageOptions.${l}`)).join(', ')
										: i18n.t('plan.auditLanguages')}
								</span>
								<ChevronDownIcon class="size-4 transition-transform {sprachenOpen ? 'rotate-180' : ''}" />
							</button>
						{/snippet}
					</Collapsible.Trigger>
					<Collapsible.Content>
						<div class="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
							{#each auditSpracheValues as lang (lang)}
								<label class="hover:bg-muted/50 flex cursor-pointer items-center gap-2 rounded-md border p-2 transition-colors">
									<Checkbox checked={plan.auditdetails.auditsprachen.includes(lang)} onCheckedChange={() => toggleSprache(lang)} />
									<span class="text-sm">{i18n.t(`plan.languageOptions.${lang}`)}</span>
								</label>
							{/each}
						</div>
					</Collapsible.Content>
				</Collapsible.Root>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- 05: Audit-Team -->
	<Card.Root class="animate-fade-up overflow-hidden" style="animation-delay: 250ms">
		<Card.Header>
			<Card.Title class="flex items-center gap-3" style="font-family: var(--font-display)">
				<span class="bg-brand/10 text-brand inline-flex size-8 items-center justify-center rounded-lg text-sm font-bold">05</span>
				{i18n.t('plan.teamSection')}
			</Card.Title>
		</Card.Header>
		<Card.Content class="space-y-6">
			{#each teamRolleValues as rolle (rolle)}
				{@const members = getTeamByRole(rolle)}
				<div class="space-y-3">
					<div class="flex items-center justify-between">
						<h3 class="text-sm font-semibold">{i18n.t(`plan.teamRoles.${rolle}`)}</h3>
						<Button variant="outline" size="sm" onclick={() => addTeamMember(rolle)} class="gap-1">
							<PlusIcon class="size-3" />
							{i18n.t('plan.teamAddMember')}
						</Button>
					</div>
					{#each members as member (member.id)}
						{@const memberIdx = plan.auditTeam.findIndex((m) => m.id === member.id)}
						<div class="bg-muted/30 space-y-3 rounded-lg border p-3">
							<div class="flex items-start gap-2">
								<textarea
									bind:value={plan.auditTeam[memberIdx].name}
									rows={2}
									placeholder={i18n.t('plan.placeholders.teamName')}
									class="bg-background border-input focus:ring-ring flex-1 rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
								></textarea>
								<Button variant="ghost" size="icon" onclick={() => removeTeamMember(member.id)}>
									<Trash2Icon class="text-muted-foreground size-4" />
								</Button>
							</div>
							<div class="flex items-center gap-4">
								<label class="flex items-center gap-2">
									<Checkbox
										checked={plan.auditTeam[memberIdx].istExtern}
										onCheckedChange={(checked) => {
											plan.auditTeam[memberIdx].istExtern = !!checked;
										}}
									/>
									<span class="text-sm">{i18n.t('plan.teamExternal')}</span>
								</label>
								{#if plan.auditTeam[memberIdx].istExtern}
									<input
										type="text"
										bind:value={plan.auditTeam[memberIdx].firmenname}
										placeholder={i18n.t('plan.placeholders.teamCompany')}
										class="bg-background border-input focus:ring-ring flex h-9 flex-1 rounded-md border px-3 text-sm focus:ring-2 focus:outline-none"
									/>
								{/if}
							</div>
						</div>
					{/each}
					{#if members.length === 0}
						<p class="text-muted-foreground py-2 text-center text-sm">{i18n.t('common.noResults')}</p>
					{/if}
				</div>
				{#if rolle !== 'experts'}
					<div class="border-border border-t"></div>
				{/if}
			{/each}
		</Card.Content>
	</Card.Root>

	<!-- 06: Betriebsorganisation -->
	<Card.Root class="animate-fade-up overflow-hidden" style="animation-delay: 300ms">
		<Card.Header>
			<Card.Title class="flex items-center gap-3" style="font-family: var(--font-display)">
				<span class="bg-brand/10 text-brand inline-flex size-8 items-center justify-center rounded-lg text-sm font-bold">06</span>
				{i18n.t('plan.operations')}
			</Card.Title>
		</Card.Header>
		<Card.Content class="space-y-6">
			<!-- Schichtsystem -->
			<div class="space-y-3">
				<Label>{i18n.t('plan.shiftSystem')}</Label>
				<RadioGroup.Root bind:value={plan.betriebsorganisation.schichtsystem}>
					<div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
						{#each schichtsystemValues as shift (shift)}
							<label class="hover:bg-muted/50 flex cursor-pointer items-center gap-2 rounded-md border p-3 transition-colors">
								<RadioGroup.Item value={shift} />
								<span class="text-sm">{i18n.t(`plan.shifts.${shift}`)}</span>
							</label>
						{/each}
					</div>
				</RadioGroup.Root>
				{#if plan.betriebsorganisation.schichtsystem === 'other'}
					<input
						type="text"
						bind:value={plan.betriebsorganisation.schichtsystemFreitext}
						placeholder={i18n.t('plan.shiftOtherPlaceholder')}
						class="bg-background border-input focus:ring-ring flex h-9 w-full rounded-md border px-3 text-sm focus:ring-2 focus:outline-none"
					/>
				{/if}
			</div>

			<!-- Schichtübergaben -->
			<div class="space-y-2">
				<Label>{i18n.t('plan.shiftHandovers')}</Label>
				<input
					type="text"
					bind:value={plan.betriebsorganisation.schichtuebergaben}
					placeholder={i18n.t('plan.placeholders.shiftHandovers')}
					class="bg-background border-input focus:ring-ring flex h-9 w-full rounded-md border px-3 text-sm focus:ring-2 focus:outline-none"
				/>
			</div>

			<!-- Bemerkung -->
			<div class="space-y-2">
				<Label>{i18n.t('plan.remark')}</Label>
				<input
					type="text"
					bind:value={plan.betriebsorganisation.bemerkung}
					placeholder={i18n.t('plan.placeholders.remark')}
					class="bg-background border-input focus:ring-ring flex h-9 w-full rounded-md border px-3 text-sm focus:ring-2 focus:outline-none"
				/>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- 07: Auditmethode -->
	<Card.Root class="animate-fade-up overflow-hidden" style="animation-delay: 350ms">
		<Card.Header>
			<Card.Title class="flex items-center gap-3" style="font-family: var(--font-display)">
				<span class="bg-brand/10 text-brand inline-flex size-8 items-center justify-center rounded-lg text-sm font-bold">07</span>
				{i18n.t('plan.auditMethod')}
			</Card.Title>
		</Card.Header>
		<Card.Content class="space-y-6">
			<!-- Methode -->
			<div class="space-y-3">
				<RadioGroup.Root bind:value={plan.auditmethode.methode}>
					<div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
						{#each auditmethodeValues as method (method)}
							<label class="hover:bg-muted/50 flex cursor-pointer items-center gap-2 rounded-md border p-3 transition-colors">
								<RadioGroup.Item value={method} />
								<span class="text-sm">{i18n.t(`plan.methods.${method}`)}</span>
							</label>
						{/each}
					</div>
				</RadioGroup.Root>
			</div>

			<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
				<div class="space-y-2">
					<Label>{i18n.t('plan.iktTechnology')}</Label>
					<input
						type="text"
						bind:value={plan.auditmethode.iktTechnik}
						placeholder={i18n.t('plan.placeholders.iktTechnology')}
						class="bg-background border-input focus:ring-ring flex h-9 w-full rounded-md border px-3 text-sm focus:ring-2 focus:outline-none"
					/>
				</div>
				<div class="space-y-2">
					<Label>{i18n.t('plan.iktTestDate')}</Label>
					<input
						type="date"
						bind:value={plan.auditmethode.iktTestdatum}
						class="bg-background border-input focus:ring-ring flex h-9 w-full rounded-md border px-3 text-sm focus:ring-2 focus:outline-none"
					/>
				</div>
			</div>

			<label class="flex items-center gap-2">
				<Checkbox
					checked={plan.auditmethode.testLetztesAudit}
					onCheckedChange={(checked) => {
						plan.auditmethode.testLetztesAudit = !!checked;
					}}
				/>
				<span class="text-sm">{i18n.t('plan.iktLastAudit')}</span>
			</label>

			<div class="space-y-2">
				<Label>{i18n.t('plan.host')}</Label>
				<input
					type="text"
					bind:value={plan.auditmethode.gastgeber}
					placeholder={i18n.t('plan.placeholders.host')}
					class="bg-background border-input focus:ring-ring flex h-9 w-full rounded-md border px-3 text-sm focus:ring-2 focus:outline-none"
				/>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- 08: Revisionen -->
	<Card.Root class="animate-fade-up overflow-hidden" style="animation-delay: 400ms">
		<Card.Header>
			<Card.Title class="flex items-center gap-3" style="font-family: var(--font-display)">
				<span class="bg-brand/10 text-brand inline-flex size-8 items-center justify-center rounded-lg text-sm font-bold">08</span>
				{i18n.t('plan.revisions')}
			</Card.Title>
		</Card.Header>
		<Card.Content class="space-y-4">
			{#each plan.revisionen as rev, i (rev.id)}
				<div class="bg-muted/30 space-y-3 rounded-lg border p-4">
					<div class="flex items-center justify-between">
						<span class="text-sm font-semibold">{rev.nummer}</span>
						<Button variant="ghost" size="icon" onclick={() => removeRevision(rev.id)}>
							<Trash2Icon class="text-muted-foreground size-4" />
						</Button>
					</div>
					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div class="space-y-2">
							<Label>{i18n.t('plan.revisionDate')}</Label>
							<input
								type="date"
								bind:value={plan.revisionen[i].datum}
								class="bg-background border-input focus:ring-ring flex h-9 w-full rounded-md border px-3 text-sm focus:ring-2 focus:outline-none"
							/>
						</div>
						<div class="space-y-2">
							<Label>{i18n.t('plan.revisionDescription')}</Label>
							<textarea
								bind:value={plan.revisionen[i].beschreibung}
								rows={2}
								placeholder={i18n.t('plan.placeholders.revisionDescription')}
								class="bg-background border-input focus:ring-ring w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
							></textarea>
						</div>
					</div>
				</div>
			{/each}
			<Button variant="outline" size="sm" onclick={addRevision} class="gap-1">
				<PlusIcon class="size-4" />
				{i18n.t('plan.addRevision')}
			</Button>

			<div class="border-border mt-4 space-y-4 border-t pt-4">
				<div class="space-y-2">
					<Label>{i18n.t('plan.revisionMeta.locationDate')}</Label>
					<input
						type="text"
						bind:value={plan.revisionMeta.ortDatum}
						placeholder={i18n.t('plan.placeholders.locationDate')}
						class="bg-background border-input focus:ring-ring flex h-9 w-full rounded-md border px-3 text-sm focus:ring-2 focus:outline-none"
					/>
				</div>
				<div class="space-y-2">
					<Label>{i18n.t('plan.revisionMeta.changeDuringAudit')}</Label>
					<textarea
						bind:value={plan.revisionMeta.aenderungWaehrendAudit}
						rows={2}
						placeholder={i18n.t('plan.placeholders.changeDuringAudit')}
						class="bg-background border-input focus:ring-ring w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
					></textarea>
				</div>
				<div class="space-y-2">
					<Label>{i18n.t('plan.revisionMeta.comments')}</Label>
					<textarea
						bind:value={plan.revisionMeta.kommentare}
						rows={2}
						placeholder={i18n.t('plan.placeholders.comments')}
						class="bg-background border-input focus:ring-ring w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
					></textarea>
				</div>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- 09: Auditzeiten -->
	<Card.Root class="animate-fade-up overflow-hidden" style="animation-delay: 450ms">
		<Card.Header>
			<Card.Title class="flex items-center gap-3" style="font-family: var(--font-display)">
				<span class="bg-brand/10 text-brand inline-flex size-8 items-center justify-center rounded-lg text-sm font-bold">09</span>
				{i18n.t('plan.auditTimes')}
			</Card.Title>
		</Card.Header>
		<Card.Content class="space-y-4">
			{#each plan.auditzeiten as tabelle, ti (tabelle.id)}
				<div class="bg-muted/30 space-y-3 rounded-lg border p-4">
					<div class="flex items-center justify-between">
						<div class="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
							<div class="space-y-1">
								<Label class="text-xs">{i18n.t('plan.auditTimeAuditor')}</Label>
								<input
									type="text"
									bind:value={plan.auditzeiten[ti].auditorName}
									class="bg-background border-input focus:ring-ring flex h-9 w-full rounded-md border px-3 text-sm focus:ring-2 focus:outline-none"
								/>
							</div>
							<div class="space-y-1">
								<Label class="text-xs">{i18n.t('plan.auditTimeLocation')}</Label>
								<input
									type="text"
									bind:value={plan.auditzeiten[ti].standortName}
									class="bg-background border-input focus:ring-ring flex h-9 w-full rounded-md border px-3 text-sm focus:ring-2 focus:outline-none"
								/>
							</div>
						</div>
						<Button variant="ghost" size="icon" onclick={() => removeAuditzeitenTabelle(tabelle.id)} class="ml-2">
							<Trash2Icon class="text-muted-foreground size-4" />
						</Button>
					</div>

					<!-- Time rows table -->
					<div class="overflow-x-auto">
						<table class="w-full text-sm">
							<thead>
								<tr class="border-b">
									<th class="px-2 py-1.5 text-left font-medium">{i18n.t('plan.auditTimeStart')}</th>
									<th class="px-2 py-1.5 text-left font-medium">{i18n.t('plan.auditTimeEnd')}</th>
									<th class="px-2 py-1.5 text-left font-medium">{i18n.t('plan.auditTimeActivity')}</th>
									<th class="px-2 py-1.5 text-right font-medium">{i18n.t('plan.auditTimeHours')}</th>
									<th class="w-10"></th>
								</tr>
							</thead>
							<tbody>
								{#each tabelle.zeilen as zeile (zeile.id)}
									<tr class="border-b last:border-0">
										<td class="px-2 py-1">
											<input
												type="time"
												value={zeile.startzeit}
												onchange={(e) => updateAuditzeitZeile(tabelle.id, zeile.id, 'startzeit', (e.target as HTMLInputElement).value)}
												class="bg-background border-input focus:ring-ring h-8 rounded-md border px-2 text-sm focus:ring-2 focus:outline-none"
											/>
										</td>
										<td class="px-2 py-1">
											<input
												type="time"
												value={zeile.endzeit}
												onchange={(e) => updateAuditzeitZeile(tabelle.id, zeile.id, 'endzeit', (e.target as HTMLInputElement).value)}
												class="bg-background border-input focus:ring-ring h-8 rounded-md border px-2 text-sm focus:ring-2 focus:outline-none"
											/>
										</td>
										<td class="px-2 py-1">
											<input
												type="text"
												value={zeile.aktivitaet}
												onchange={(e) => updateAuditzeitZeile(tabelle.id, zeile.id, 'aktivitaet', (e.target as HTMLInputElement).value)}
												placeholder={i18n.t('plan.placeholders.activity')}
												class="bg-background border-input focus:ring-ring h-8 w-full rounded-md border px-2 text-sm focus:ring-2 focus:outline-none"
											/>
										</td>
										<td class="px-2 py-1 text-right font-mono text-xs">
											{zeile.stunden.toFixed(2)}
										</td>
										<td class="px-1 py-1">
											<Button variant="ghost" size="icon" class="size-7" onclick={() => removeAuditzeitZeile(tabelle.id, zeile.id)}>
												<XIcon class="size-3" />
											</Button>
										</td>
									</tr>
								{/each}
							</tbody>
							<tfoot>
								<tr class="border-t font-semibold">
									<td colspan={3} class="px-2 py-1.5">{i18n.t('plan.auditTimeTotal')}</td>
									<td class="px-2 py-1.5 text-right font-mono">{tabelle.gesamtStunden.toFixed(2)}</td>
									<td></td>
								</tr>
							</tfoot>
						</table>
					</div>
					<Button variant="outline" size="sm" onclick={() => addAuditzeitZeile(tabelle.id)} class="gap-1">
						<PlusIcon class="size-3" />
						{i18n.t('plan.addAuditTimeRow')}
					</Button>
				</div>
			{/each}
			<Button variant="outline" size="sm" onclick={addAuditzeitenTabelle} class="gap-1">
				<PlusIcon class="size-4" />
				{i18n.t('plan.addAuditTimeTable')}
			</Button>
		</Card.Content>
	</Card.Root>

	<!-- 10: Audit-Blöcke -->
	<Card.Root class="animate-fade-up overflow-hidden" style="animation-delay: 500ms">
		<Card.Header>
			<Card.Title class="flex items-center gap-3" style="font-family: var(--font-display)">
				<span class="bg-brand/10 text-brand inline-flex size-8 items-center justify-center rounded-lg text-sm font-bold">10</span>
				{i18n.t('plan.blocks')}
			</Card.Title>
		</Card.Header>
		<Card.Content class="space-y-4">
			{#each plan.auditBloecke as block, bi (block.id)}
				<div class="rounded-lg border-2 border-dashed">
					<!-- Block header -->
					<div class="bg-muted/50 flex items-center gap-2 rounded-t-lg border-b px-4 py-2">
						<GripVerticalIcon class="text-muted-foreground size-5 cursor-grab" />
						<span class="flex-1 text-sm font-semibold">
							{i18n.t('plan.blocks')} #{bi + 1}
							{#if block.zeilen[0]?.organisationseinheit}
								— {block.zeilen[0].organisationseinheit}
							{/if}
						</span>
						<div class="flex items-center gap-1">
							<Button variant="ghost" size="icon" class="size-7" onclick={() => moveBlock(block.id, 'up')} disabled={bi === 0}>
								<ArrowUpIcon class="size-4" />
							</Button>
							<Button variant="ghost" size="icon" class="size-7" onclick={() => moveBlock(block.id, 'down')} disabled={bi === plan.auditBloecke.length - 1}>
								<ArrowDownIcon class="size-4" />
							</Button>
							<Button variant="ghost" size="icon" class="size-7" onclick={() => duplicateBlock(block.id)}>
								<CopyIcon class="size-4" />
							</Button>
							<Button variant="ghost" size="icon" class="size-7" onclick={() => (deleteBlockId = block.id)}>
								<Trash2Icon class="text-destructive size-4" />
							</Button>
						</div>
					</div>

					<!-- Block zeilen -->
					<div class="space-y-4 p-4">
						{#each block.zeilen as zeile, _zi (zeile.id)}
							{@const zeileIdx = plan.auditBloecke[bi].zeilen.findIndex((z) => z.id === zeile.id)}
							<div class="bg-card space-y-3 rounded-lg border p-4 shadow-sm">
								<!-- Row header with remove button -->
								<div class="flex items-center justify-between">
									<span class="text-muted-foreground text-xs font-medium tracking-wider uppercase">
										{i18n.t('plan.blockFields.department')}: {zeile.organisationseinheit || '—'}
									</span>
									{#if block.zeilen.length > 1}
										<Button variant="ghost" size="icon" class="size-6" onclick={() => removeBlockZeile(block.id, zeile.id)}>
											<XIcon class="size-3" />
										</Button>
									{/if}
								</div>

								<!-- Main fields grid -->
								<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
									<!-- Datum + Toggle -->
									<div class="space-y-1">
										<div class="flex items-center justify-between">
											<Label class="text-xs">{i18n.t('plan.blockFields.date')}</Label>
											<Switch
												checked={plan.auditBloecke[bi].zeilen[zeileIdx].datumToggle}
												onCheckedChange={(checked) => {
													plan.auditBloecke[bi].zeilen[zeileIdx].datumToggle = !!checked;
												}}
											/>
										</div>
										<input
											type="date"
											bind:value={plan.auditBloecke[bi].zeilen[zeileIdx].datum}
											class="bg-background border-input focus:ring-ring flex h-9 w-full rounded-md border px-3 text-sm focus:ring-2 focus:outline-none"
										/>
									</div>

									<!-- Uhrzeit Von + Toggle -->
									<div class="space-y-1">
										<div class="flex items-center justify-between">
											<Label class="text-xs">{i18n.t('plan.blockFields.timeFrom')}</Label>
											<Switch
												checked={plan.auditBloecke[bi].zeilen[zeileIdx].uhrzeitToggle}
												onCheckedChange={(checked) => {
													plan.auditBloecke[bi].zeilen[zeileIdx].uhrzeitToggle = !!checked;
												}}
											/>
										</div>
										<input
											type="time"
											bind:value={plan.auditBloecke[bi].zeilen[zeileIdx].uhrzeitVon}
											class="bg-background border-input focus:ring-ring flex h-9 w-full rounded-md border px-3 text-sm focus:ring-2 focus:outline-none"
										/>
									</div>

									<!-- Uhrzeit Bis -->
									<div class="space-y-1">
										<Label class="text-xs">{i18n.t('plan.blockFields.timeTo')}</Label>
										<input
											type="time"
											bind:value={plan.auditBloecke[bi].zeilen[zeileIdx].uhrzeitBis}
											class="bg-background border-input focus:ring-ring flex h-9 w-full rounded-md border px-3 text-sm focus:ring-2 focus:outline-none"
										/>
									</div>

									<!-- Remote + Toggle -->
									<div class="space-y-1">
										<div class="flex items-center justify-between">
											<Label class="text-xs">{i18n.t('plan.blockFields.remote')}</Label>
											<Switch
												checked={plan.auditBloecke[bi].zeilen[zeileIdx].remoteToggle}
												onCheckedChange={(checked) => {
													plan.auditBloecke[bi].zeilen[zeileIdx].remoteToggle = !!checked;
												}}
											/>
										</div>
										<label class="flex items-center gap-2 pt-1">
											<Checkbox
												checked={plan.auditBloecke[bi].zeilen[zeileIdx].istRemote}
												onCheckedChange={(checked) => {
													plan.auditBloecke[bi].zeilen[zeileIdx].istRemote = !!checked;
												}}
											/>
											<span class="text-sm">Remote</span>
										</label>
									</div>

									<!-- Organisationseinheit -->
									<div class="space-y-1">
										<Label class="text-xs">{i18n.t('plan.blockFields.department')}</Label>
										<input
											type="text"
											bind:value={plan.auditBloecke[bi].zeilen[zeileIdx].organisationseinheit}
											placeholder={i18n.t('plan.blockFields.department')}
											class="bg-background border-input focus:ring-ring flex h-9 w-full rounded-md border px-3 text-sm focus:ring-2 focus:outline-none"
											list="org-einheiten"
										/>
									</div>

									<!-- Auditor -->
									<div class="space-y-1">
										<Label class="text-xs">{i18n.t('plan.blockFields.auditor')}</Label>
										<input
											type="text"
											bind:value={plan.auditBloecke[bi].zeilen[zeileIdx].auditor}
											placeholder={i18n.t('plan.blockFields.auditor')}
											class="bg-background border-input focus:ring-ring flex h-9 w-full rounded-md border px-3 text-sm focus:ring-2 focus:outline-none"
										/>
									</div>

									<!-- Gesprächspartner -->
									<div class="space-y-1 sm:col-span-2 lg:col-span-1">
										<Label class="text-xs">{i18n.t('plan.blockFields.interviewee')}</Label>
										<input
											type="text"
											bind:value={plan.auditBloecke[bi].zeilen[zeileIdx].gespraechspartner}
											placeholder={i18n.t('plan.blockFields.interviewee')}
											class="bg-background border-input focus:ring-ring flex h-9 w-full rounded-md border px-3 text-sm focus:ring-2 focus:outline-none"
										/>
									</div>
								</div>

								<!-- Notizen-Panel -->
								<Collapsible.Root>
									<Collapsible.Trigger>
										{#snippet child({ props })}
											<button {...props} class="text-muted-foreground hover:text-foreground mt-1 flex items-center gap-1 text-xs transition-colors">
												<ChevronDownIcon class="size-3" />
												{i18n.t('plan.blockNotes.title')}
											</button>
										{/snippet}
									</Collapsible.Trigger>
									<Collapsible.Content>
										<div class="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
											<div class="space-y-1">
												<Label class="text-xs">{i18n.t('plan.blockNotes.description')}</Label>
												<textarea
													bind:value={plan.auditBloecke[bi].zeilen[zeileIdx].notizen.beschreibung}
													rows={5}
													class="bg-background border-input focus:ring-ring w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
												></textarea>
											</div>
											<div class="space-y-1">
												<Label class="text-xs">{i18n.t('plan.blockNotes.summary')}</Label>
												<textarea
													bind:value={plan.auditBloecke[bi].zeilen[zeileIdx].notizen.zusammenfassung}
													rows={5}
													class="bg-background border-input focus:ring-ring w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
												></textarea>
											</div>
											<div class="space-y-1">
												<Label class="text-xs">{i18n.t('plan.blockNotes.introduction')}</Label>
												<textarea
													bind:value={plan.auditBloecke[bi].zeilen[zeileIdx].notizen.vorstellung}
													rows={2}
													class="bg-background border-input focus:ring-ring w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
												></textarea>
											</div>
											<div class="space-y-1">
												<Label class="text-xs">{i18n.t('plan.blockNotes.general')}</Label>
												<textarea
													bind:value={plan.auditBloecke[bi].zeilen[zeileIdx].notizen.allgemein}
													rows={2}
													class="bg-background border-input focus:ring-ring w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
												></textarea>
											</div>
											<div class="space-y-1">
												<Label class="text-xs">{i18n.t('plan.blockNotes.notes')}</Label>
												<textarea
													bind:value={plan.auditBloecke[bi].zeilen[zeileIdx].notizen.notizen}
													rows={3}
													class="bg-background border-input focus:ring-ring w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
												></textarea>
											</div>
											<div class="space-y-1">
												<Label class="text-xs">{i18n.t('plan.blockNotes.documents')}</Label>
												<textarea
													bind:value={plan.auditBloecke[bi].zeilen[zeileIdx].notizen.dokumente}
													rows={2}
													class="bg-background border-input focus:ring-ring w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
												></textarea>
											</div>
										</div>
									</Collapsible.Content>
								</Collapsible.Root>
							</div>
						{/each}
						<Button variant="outline" size="sm" onclick={() => addBlockZeile(block.id)} class="gap-1">
							<PlusIcon class="size-3" />
							{i18n.t('plan.blockAddRow')}
						</Button>
					</div>
				</div>
			{/each}
			<Button variant="outline" onclick={addAuditBlock} class="w-full gap-2">
				<PlusIcon class="size-4" />
				{i18n.t('plan.addBlock')}
			</Button>
		</Card.Content>
	</Card.Root>

	<!-- 11: Hinweise und Verteiler -->
	<Card.Root class="animate-fade-up overflow-hidden" style="animation-delay: 550ms">
		<Card.Header>
			<Card.Title class="flex items-center gap-3" style="font-family: var(--font-display)">
				<span class="bg-brand/10 text-brand inline-flex size-8 items-center justify-center rounded-lg text-sm font-bold">11</span>
				{i18n.t('plan.hintsDistribution')}
			</Card.Title>
		</Card.Header>
		<Card.Content class="space-y-4">
			<!-- Info Box -->
			<div class="bg-brand/5 border-brand/20 text-foreground rounded-lg border p-4 text-sm">
				{plan.hinweiseVerteiler.infoText || i18n.t('plan.hintsDistribution')}
			</div>

			<!-- Verteiler -->
			<div class="space-y-2">
				<Label>{i18n.t('plan.distribution')}</Label>
				<textarea
					bind:value={plan.hinweiseVerteiler.verteiler}
					rows={3}
					placeholder={i18n.t('plan.placeholders.distribution')}
					class="bg-background border-input focus:ring-ring w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
				></textarea>
			</div>

			<!-- Distribution checkboxes -->
			<div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
				<label class="flex items-center gap-2">
					<Checkbox
						checked={plan.hinweiseVerteiler.verteilungOptionen.auditteam}
						onCheckedChange={(checked) => {
							plan.hinweiseVerteiler.verteilungOptionen.auditteam = !!checked;
						}}
					/>
					<span class="text-sm">{i18n.t('plan.distributionOptions.auditteam')}</span>
				</label>
				<label class="flex items-center gap-2">
					<Checkbox
						checked={plan.hinweiseVerteiler.verteilungOptionen.geschaeftsfuehrung}
						onCheckedChange={(checked) => {
							plan.hinweiseVerteiler.verteilungOptionen.geschaeftsfuehrung = !!checked;
						}}
					/>
					<span class="text-sm">{i18n.t('plan.distributionOptions.management')}</span>
				</label>
				<label class="flex items-center gap-2">
					<Checkbox
						checked={plan.hinweiseVerteiler.verteilungOptionen.fachabteilungen}
						onCheckedChange={(checked) => {
							plan.hinweiseVerteiler.verteilungOptionen.fachabteilungen = !!checked;
						}}
					/>
					<span class="text-sm">{i18n.t('plan.distributionOptions.departments')}</span>
				</label>
				<label class="flex items-center gap-2">
					<Checkbox
						checked={plan.hinweiseVerteiler.verteilungOptionen.extern}
						onCheckedChange={(checked) => {
							plan.hinweiseVerteiler.verteilungOptionen.extern = !!checked;
						}}
					/>
					<span class="text-sm">{i18n.t('plan.distributionOptions.external')}</span>
				</label>
			</div>
		</Card.Content>
	</Card.Root>
</div>

<!-- Datalist for Organisationseinheiten -->
<datalist id="org-einheiten">
	<option value="Geschäftsführung"></option>
	<option value="Qualitätsmanagement"></option>
	<option value="Umweltmanagement"></option>
	<option value="Arbeitssicherheit"></option>
	<option value="Produktion"></option>
	<option value="Logistik"></option>
	<option value="Einkauf"></option>
	<option value="Vertrieb"></option>
	<option value="Marketing"></option>
	<option value="Personal / HR"></option>
	<option value="Finanzen / Buchhaltung"></option>
	<option value="IT / EDV"></option>
	<option value="Forschung & Entwicklung"></option>
	<option value="Konstruktion"></option>
	<option value="Instandhaltung"></option>
	<option value="Lager / Warenannahme"></option>
	<option value="Versand"></option>
	<option value="Kundendienst"></option>
	<option value="Rechtsabteilung"></option>
	<option value="Facility Management"></option>
	<option value="Energiemanagement"></option>
	<option value="Informationssicherheit"></option>
	<option value="Datenschutz"></option>
	<option value="Ausbildung"></option>
	<option value="Projektmanagement"></option>
	<option value="Unternehmenskommunikation"></option>
</datalist>

<!-- Delete Block AlertDialog -->
<AlertDialog.Root
	open={deleteBlockId !== null}
	onOpenChange={(open) => {
		if (!open) deleteBlockId = null;
	}}
>
	<AlertDialog.Portal>
		<AlertDialog.Overlay />
		<AlertDialog.Content>
			<AlertDialog.Header>
				<AlertDialog.Title>{i18n.t('plan.blockDelete')}</AlertDialog.Title>
				<AlertDialog.Description>{i18n.t('plan.blockDeleteConfirm')}</AlertDialog.Description>
			</AlertDialog.Header>
			<AlertDialog.Footer>
				<AlertDialog.Cancel onclick={() => (deleteBlockId = null)}>{i18n.t('common.cancel')}</AlertDialog.Cancel>
				<AlertDialog.Action onclick={confirmDeleteBlock}>{i18n.t('common.confirm')}</AlertDialog.Action>
			</AlertDialog.Footer>
		</AlertDialog.Content>
	</AlertDialog.Portal>
</AlertDialog.Root>
