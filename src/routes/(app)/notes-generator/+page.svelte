<script lang="ts">
	import { getContext } from 'svelte';
	import { page } from '$app/state';
	import type { I18nRune } from '$lib/i18n/i18n.svelte';
	import { saveNotes, editSavedNotes, getSavedNotesById } from '$lib/rpc/notizen.remote';
	import { generateNotesWordDocument } from '$lib/word/auditnotizen-word';
	import { organisationseinheitOptionen } from '$lib/data/organisationseinheiten';
	import { abteilungBeschreibungen } from '$lib/data/abteilung-beschreibungen';
	import { zusammenfassungBeschreibungen, zusammenfassungDefaultText } from '$lib/data/zusammenfassungen';
	import type { NotizenDaten, NotizenBlock, QHSEDokument, Bewertung, BewertungsTyp } from '$lib/types/notes';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Switch } from '$lib/components/ui/switch';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Label } from '$lib/components/ui/label';
	import { toast } from 'svelte-sonner';
	import Save from '@lucide/svelte/icons/save';
	import FileText from '@lucide/svelte/icons/file-text';
	import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
	import Plus from '@lucide/svelte/icons/plus';
	import X from '@lucide/svelte/icons/x';
	import Upload from '@lucide/svelte/icons/upload';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Copy from '@lucide/svelte/icons/copy';
	import ChevronUp from '@lucide/svelte/icons/chevron-up';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import ChevronsUpDown from '@lucide/svelte/icons/chevrons-up-down';

	const i18n = getContext<I18nRune>('i18n');

	const bewertungsTypen: BewertungsTyp[] = ['major_nonconformity', 'minor_nonconformity', 'observation', 'improvement_potential', 'positive_finding'];

	const bewertungsTypColors: Record<BewertungsTyp, string> = {
		major_nonconformity: 'bg-red-100 dark:bg-red-950 border-red-300 dark:border-red-800',
		minor_nonconformity: 'bg-orange-100 dark:bg-orange-950 border-orange-300 dark:border-orange-800',
		observation: 'bg-yellow-100 dark:bg-yellow-950 border-yellow-300 dark:border-yellow-800',
		improvement_potential: 'bg-blue-100 dark:bg-blue-950 border-blue-300 dark:border-blue-800',
		positive_finding: 'bg-green-100 dark:bg-green-950 border-green-300 dark:border-green-800'
	};

	// Org unit names for datalist
	const orgUnitNames = organisationseinheitOptionen.map((o) => o.name);

	function createEmptyBlock(): NotizenBlock {
		return {
			id: crypto.randomUUID(),
			position: 0,
			datum: '',
			uhrzeitVon: '08:00',
			uhrzeitBis: '17:00',
			istRemote: false,
			organisationseinheit: '',
			normkapitel: [],
			thema: [],
			elementProzess: [],
			auditor: '',
			gespraechspartner: '',
			beschreibung: '',
			vorstellung: i18n.t('notes_generator.vorstellung_default'),
			allgemein: i18n.t('notes_generator.allgemein_default'),
			notizen: '',
			dokumente: '',
			zusammenfassung: '',
			toggles: {
				datum: true,
				uhrzeit: true,
				remote: true,
				dokumenteAnzeigen: true,
				bewertungAnzeigen: true,
				notizenAnzeigen: true
			},
			qhseDokumente: [],
			bewertungen: [],
			manuellBearbeitet: {
				beschreibung: false,
				zusammenfassung: false,
				thema: false,
				normkapitel: false
			}
		};
	}

	function createDefaultData(): NotizenDaten {
		return {
			header: {
				firmaAuftraggeber: '',
				standards: '',
				zertifikat: '',
				auditart: '',
				datumVon: '',
				datumBis: '',
				standorte: '',
				auditor: '',
				seiteVon: '',
				seiteBis: ''
			},
			logoBase64: null,
			logoDateiname: null,
			notizenBloecke: [createEmptyBlock()]
		};
	}

	// State
	let data = $state<NotizenDaten>(createDefaultData());
	let editId = $state<string | null>(null);
	let saving = $state(false);
	let notesOpen = $state<Record<string, boolean>>({});
	let resetDialogOpen = $state(false);
	let deleteBlockId = $state<string | null>(null);
	let deleteQhseInfo = $state<{ blockId: string; docId: string; docName: string } | null>(null);

	// Load if editing
	$effect(() => {
		const id = page.url.searchParams.get('edit');
		if (id) {
			editId = id;
			getSavedNotesById(id).then((result) => {
				if (result && result.daten) {
					try {
						const loaded = JSON.parse(result.daten) as NotizenDaten;
						data = loaded;
					} catch {
						toast.error(i18n.t('notes_generator.save_error'));
					}
				}
			});
		}
	});

	// Logo upload
	let fileInput: HTMLInputElement | undefined = $state();

	function handleLogoUpload(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		if (file.size > 2 * 1024 * 1024) {
			toast.error(i18n.t('validation.fileTooLarge'));
			return;
		}
		const reader = new FileReader();
		reader.onload = () => {
			data.logoBase64 = reader.result as string;
			data.logoDateiname = file.name;
		};
		reader.readAsDataURL(file);
	}

	function removeLogo() {
		data.logoBase64 = null;
		data.logoDateiname = null;
	}

	// Block operations
	function addBlock() {
		const block = createEmptyBlock();
		block.position = data.notizenBloecke.length;
		data.notizenBloecke = [...data.notizenBloecke, block];
	}

	function confirmDeleteBlock(blockId: string) {
		deleteBlockId = blockId;
	}

	function executeDeleteBlock() {
		if (!deleteBlockId) return;
		data.notizenBloecke = data.notizenBloecke.filter((b) => b.id !== deleteBlockId);
		deleteBlockId = null;
	}

	function duplicateBlock(index: number) {
		const block = data.notizenBloecke[index];
		const cloned: NotizenBlock = JSON.parse(JSON.stringify(block));
		cloned.id = crypto.randomUUID();
		cloned.qhseDokumente = cloned.qhseDokumente.map((d) => ({
			...d,
			id: crypto.randomUUID()
		}));
		cloned.bewertungen = cloned.bewertungen.map((b) => ({ ...b, id: crypto.randomUUID() }));
		cloned.position = index + 1;
		data.notizenBloecke = [...data.notizenBloecke.slice(0, index + 1), cloned, ...data.notizenBloecke.slice(index + 1)];
	}

	function moveBlockUp(index: number) {
		if (index === 0) return;
		const arr = [...data.notizenBloecke];
		[arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
		data.notizenBloecke = arr;
	}

	function moveBlockDown(index: number) {
		if (index >= data.notizenBloecke.length - 1) return;
		const arr = [...data.notizenBloecke];
		[arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
		data.notizenBloecke = arr;
	}

	function toggleNotesPanel(blockId: string) {
		notesOpen[blockId] = !notesOpen[blockId];
	}

	// Auto-fill on org unit change
	function onOrgUnitChange(blockIndex: number) {
		const block = data.notizenBloecke[blockIndex];
		const orgUnit = block.organisationseinheit;
		if (!orgUnit) return;

		if (!block.manuellBearbeitet.beschreibung) {
			block.beschreibung = abteilungBeschreibungen[orgUnit] ?? '';
		}
		if (!block.manuellBearbeitet.zusammenfassung) {
			block.zusammenfassung = zusammenfassungBeschreibungen[orgUnit] ?? zusammenfassungDefaultText;
		}
		const orgOption = organisationseinheitOptionen.find((o) => o.name === orgUnit);
		if (orgOption) {
			if (!block.manuellBearbeitet.thema) {
				block.thema = [...orgOption.themen];
			}
		}
	}

	function markManualEdit(blockIndex: number, field: keyof NotizenBlock['manuellBearbeitet']) {
		data.notizenBloecke[blockIndex].manuellBearbeitet[field] = true;
	}

	// QHSE operations
	function addQhseDoc(blockIndex: number) {
		const doc: QHSEDokument = {
			id: crypto.randomUUID(),
			name: '',
			datum: '',
			notizen: ''
		};
		data.notizenBloecke[blockIndex].qhseDokumente = [...data.notizenBloecke[blockIndex].qhseDokumente, doc];
	}

	function confirmDeleteQhse(blockId: string, docId: string, docName: string) {
		deleteQhseInfo = { blockId, docId, docName };
	}

	function executeDeleteQhse() {
		if (!deleteQhseInfo) return;
		const bIdx = data.notizenBloecke.findIndex((b) => b.id === deleteQhseInfo!.blockId);
		if (bIdx >= 0) {
			data.notizenBloecke[bIdx].qhseDokumente = data.notizenBloecke[bIdx].qhseDokumente.filter((d) => d.id !== deleteQhseInfo!.docId);
		}
		deleteQhseInfo = null;
	}

	function moveQhseUp(blockIndex: number, docIndex: number) {
		if (docIndex === 0) return;
		const arr = [...data.notizenBloecke[blockIndex].qhseDokumente];
		[arr[docIndex - 1], arr[docIndex]] = [arr[docIndex], arr[docIndex - 1]];
		data.notizenBloecke[blockIndex].qhseDokumente = arr;
	}

	function moveQhseDown(blockIndex: number, docIndex: number) {
		if (docIndex >= data.notizenBloecke[blockIndex].qhseDokumente.length - 1) return;
		const arr = [...data.notizenBloecke[blockIndex].qhseDokumente];
		[arr[docIndex], arr[docIndex + 1]] = [arr[docIndex + 1], arr[docIndex]];
		data.notizenBloecke[blockIndex].qhseDokumente = arr;
	}

	// Bewertung operations
	function addBewertung(blockIndex: number) {
		const bew: Bewertung = {
			id: crypto.randomUUID(),
			typ: 'observation',
			kapitel: [],
			beschreibung: ''
		};
		data.notizenBloecke[blockIndex].bewertungen = [...data.notizenBloecke[blockIndex].bewertungen, bew];
	}

	function deleteBewertung(blockIndex: number, bewId: string) {
		data.notizenBloecke[blockIndex].bewertungen = data.notizenBloecke[blockIndex].bewertungen.filter((b) => b.id !== bewId);
	}

	// Save
	async function handleSave() {
		saving = true;
		try {
			const name = data.header.firmaAuftraggeber ? `Auditnotizen - ${data.header.firmaAuftraggeber.trim()}` : `Auditnotizen - ${new Date().toLocaleDateString('de-DE')}`;
			const daten = JSON.stringify(data);

			if (editId) {
				await editSavedNotes({ id: editId, data: { name, daten } });
				toast.success(i18n.t('notes_generator.update_success'));
			} else {
				const result = await saveNotes({ name, daten });
				if (result) {
					editId = result.id;
				}
				toast.success(i18n.t('notes_generator.save_success'));
			}
		} catch {
			toast.error(i18n.t('notes_generator.save_error'));
		} finally {
			saving = false;
		}
	}

	function handleReset() {
		data = createDefaultData();
		editId = null;
		notesOpen = {};
		resetDialogOpen = false;
	}

	async function handleGenerate() {
		try {
			await generateNotesWordDocument(data);
			toast.success(i18n.t('common.download'));
		} catch {
			toast.error(i18n.t('notes_generator.save_error'));
		}
	}

	// Input classes
	const inputClass =
		'border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none';
	const textareaClass =
		'border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[60px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none';
</script>

<!-- Sticky Action Bar -->
<div class="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-30 border-b backdrop-blur">
	<div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
		<h1 class="text-xl font-bold" style="font-family: var(--font-display)">
			{i18n.t('notes_generator.title')}
		</h1>
		<div class="flex gap-2">
			<Button variant="destructive" onclick={() => (resetDialogOpen = true)}>
				<RotateCcw class="mr-2 size-4" />
				{i18n.t('notes_generator.reset')}
			</Button>
			<Button variant="outline" onclick={handleGenerate}>
				<FileText class="mr-2 size-4" />
				{i18n.t('notes_generator.generate')}
			</Button>
			<Button onclick={handleSave} disabled={saving}>
				<Save class="mr-2 size-4" />
				{saving ? i18n.t('common.loading') : i18n.t('notes_generator.save')}
			</Button>
		</div>
	</div>
</div>

<div class="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
	<!-- Header Section -->
	<Card.Root>
		<Card.Header>
			<Card.Title>{i18n.t('notes_generator.header_title')}</Card.Title>
		</Card.Header>
		<Card.Content>
			<div class="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
				<!-- Left: Form Fields -->
				<div class="space-y-4">
					<!-- Row 1: Firma + Standards -->
					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div class="space-y-2">
							<Label>{i18n.t('notes_generator.firma')}</Label>
							<input type="text" bind:value={data.header.firmaAuftraggeber} placeholder={i18n.t('notes_generator.firma_placeholder')} class={inputClass} />
						</div>
						<div class="space-y-2">
							<Label>{i18n.t('notes_generator.standards')}</Label>
							<input type="text" bind:value={data.header.standards} placeholder={i18n.t('notes_generator.standards_placeholder')} class={inputClass} />
						</div>
					</div>
					<!-- Row 2: Zertifikat + Auditart -->
					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div class="space-y-2">
							<Label>{i18n.t('notes_generator.zertifikat')}</Label>
							<input type="text" bind:value={data.header.zertifikat} placeholder={i18n.t('notes_generator.zertifikat_placeholder')} class={inputClass} />
						</div>
						<div class="space-y-2">
							<Label>{i18n.t('notes_generator.auditart')}</Label>
							<input type="text" bind:value={data.header.auditart} placeholder={i18n.t('notes_generator.auditart_placeholder')} class={inputClass} />
						</div>
					</div>
					<!-- Row 3: Datum Von/Bis + Standorte -->
					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div class="grid grid-cols-2 gap-2">
							<div class="space-y-2">
								<Label>{i18n.t('notes_generator.datum_von')}</Label>
								<input type="date" bind:value={data.header.datumVon} class={inputClass} />
							</div>
							<div class="space-y-2">
								<Label>{i18n.t('notes_generator.datum_bis')}</Label>
								<input type="date" bind:value={data.header.datumBis} class={inputClass} />
							</div>
						</div>
						<div class="space-y-2">
							<Label>{i18n.t('notes_generator.standorte')}</Label>
							<input type="text" bind:value={data.header.standorte} placeholder={i18n.t('notes_generator.standorte_placeholder')} class={inputClass} />
						</div>
					</div>
					<!-- Row 4: Auditor + Seite Von/Bis -->
					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div class="space-y-2">
							<Label>{i18n.t('notes_generator.auditor')}</Label>
							<input type="text" bind:value={data.header.auditor} placeholder={i18n.t('notes_generator.auditor_placeholder')} class={inputClass} />
						</div>
						<div class="grid grid-cols-2 gap-2">
							<div class="space-y-2">
								<Label>{i18n.t('notes_generator.seite_von')}</Label>
								<input type="text" bind:value={data.header.seiteVon} placeholder="1" class={inputClass} />
							</div>
							<div class="space-y-2">
								<Label>{i18n.t('notes_generator.seite_bis')}</Label>
								<input type="text" bind:value={data.header.seiteBis} placeholder="15" class={inputClass} />
							</div>
						</div>
					</div>
				</div>

				<!-- Right: Logo Upload -->
				<div class="space-y-3">
					<Label>{i18n.t('notes_generator.logo_title')}</Label>
					<input bind:this={fileInput} type="file" accept="image/png,image/jpeg,image/svg+xml" class="hidden" onchange={handleLogoUpload} />
					{#if data.logoBase64}
						<div class="flex flex-col items-center gap-3">
							<div class="border-muted flex h-[150px] max-w-[250px] items-center justify-center rounded-lg border-2 border-dashed p-2">
								<img src={data.logoBase64} alt="Logo" class="max-h-full max-w-full object-contain" />
							</div>
							<Button variant="destructive" size="sm" onclick={removeLogo}>
								<Trash2 class="mr-1 size-4" />
								{i18n.t('notes_generator.logo_remove')}
							</Button>
						</div>
					{:else}
						<div class="border-muted flex h-[150px] max-w-[250px] flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-4">
							<Upload class="text-muted-foreground size-8" />
							<Button variant="outline" size="sm" onclick={() => fileInput?.click()}>
								{i18n.t('notes_generator.logo_upload')}
							</Button>
							<span class="text-muted-foreground text-center text-xs">
								{i18n.t('notes_generator.logo_hint')}
							</span>
						</div>
					{/if}
				</div>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Notizen-Blöcke -->
	<div class="space-y-4">
		<div class="flex items-center justify-between">
			<h2 class="text-xl font-bold" style="font-family: var(--font-display)">
				{i18n.t('notes_generator.bloecke_title')}
			</h2>
			<Button onclick={addBlock}>
				<Plus class="mr-1 size-4" />
				{i18n.t('notes_generator.block_add')}
			</Button>
		</div>

		{#each data.notizenBloecke as block, bIdx (block.id)}
			<Card.Root>
				<Card.Header>
					<div class="flex items-center justify-between">
						<Card.Title>
							{block.organisationseinheit || i18n.t('notes_generator.block_new')}
							<span class="text-muted-foreground ml-2 text-sm font-normal">
								{i18n.t('notes_generator.block_title', { num: bIdx + 1 })}
							</span>
						</Card.Title>
						<div class="flex gap-1">
							<Button variant="ghost" size="sm" onclick={() => moveBlockUp(bIdx)} disabled={bIdx === 0} title={i18n.t('notes_generator.block_move_up')}>
								<ChevronUp class="size-4" />
							</Button>
							<Button
								variant="ghost"
								size="sm"
								onclick={() => moveBlockDown(bIdx)}
								disabled={bIdx === data.notizenBloecke.length - 1}
								title={i18n.t('notes_generator.block_move_down')}
							>
								<ChevronDown class="size-4" />
							</Button>
							<Button variant="ghost" size="sm" onclick={() => duplicateBlock(bIdx)} title={i18n.t('notes_generator.block_duplicate')}>
								<Copy class="size-4" />
							</Button>
							<Button
								variant="ghost"
								size="sm"
								onclick={() => confirmDeleteBlock(block.id)}
								disabled={data.notizenBloecke.length <= 1}
								title={i18n.t('notes_generator.block_delete')}
							>
								<Trash2 class="size-4" />
							</Button>
						</div>
					</div>
				</Card.Header>
				<Card.Content class="space-y-4">
					<!-- Block Fields -->
					<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
						<!-- Datum -->
						<div class="space-y-2">
							<Label>{i18n.t('notes_generator.datum')}</Label>
							<input type="date" bind:value={block.datum} class={inputClass} />
						</div>
						<!-- Uhrzeit Von/Bis -->
						<div class="grid grid-cols-2 gap-2">
							<div class="space-y-2">
								<Label>{i18n.t('notes_generator.uhrzeit_von')}</Label>
								<input type="time" bind:value={block.uhrzeitVon} class={inputClass} />
							</div>
							<div class="space-y-2">
								<Label>{i18n.t('notes_generator.uhrzeit_bis')}</Label>
								<input type="time" bind:value={block.uhrzeitBis} class={inputClass} />
							</div>
						</div>
						<!-- Remote -->
						<div class="flex items-end gap-3 pb-1">
							<label class="flex items-center gap-2">
								<input type="checkbox" bind:checked={block.istRemote} class="size-4 rounded" />
								<span class="text-sm">{i18n.t('notes_generator.remote')}</span>
							</label>
						</div>
					</div>

					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						<!-- Organisationseinheit -->
						<div class="space-y-2">
							<Label>{i18n.t('notes_generator.organisationseinheit')}</Label>
							<input
								type="text"
								bind:value={block.organisationseinheit}
								placeholder={i18n.t('notes_generator.organisationseinheit_placeholder')}
								list="org-units-{bIdx}"
								class={inputClass}
								onchange={() => onOrgUnitChange(bIdx)}
							/>
							<datalist id="org-units-{bIdx}">
								{#each orgUnitNames as name (name)}
									<option value={name}></option>
								{/each}
							</datalist>
						</div>
						<!-- Auditor -->
						<div class="space-y-2">
							<Label>{i18n.t('notes_generator.auditor_field')}</Label>
							<input type="text" bind:value={block.auditor} placeholder={i18n.t('notes_generator.auditor_field_placeholder')} class={inputClass} />
						</div>
					</div>

					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						<!-- Gesprächspartner -->
						<div class="space-y-2">
							<Label>{i18n.t('notes_generator.gespraechspartner')}</Label>
							<input type="text" bind:value={block.gespraechspartner} placeholder={i18n.t('notes_generator.gespraechspartner_placeholder')} class={inputClass} />
						</div>
						<!-- Thema -->
						<div class="space-y-2">
							<Label>{i18n.t('notes_generator.thema')}</Label>
							<input
								type="text"
								value={block.thema.join(', ')}
								placeholder={i18n.t('notes_generator.thema_placeholder')}
								class={inputClass}
								oninput={(e) => {
									const val = (e.target as HTMLInputElement).value;
									block.thema = val
										.split(',')
										.map((s) => s.trim())
										.filter(Boolean);
									markManualEdit(bIdx, 'thema');
								}}
							/>
						</div>
					</div>

					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						<!-- Normkapitel -->
						<div class="space-y-2">
							<Label>{i18n.t('notes_generator.normkapitel')}</Label>
							<input
								type="text"
								value={block.normkapitel.join(', ')}
								placeholder={i18n.t('notes_generator.normkapitel_placeholder')}
								class={inputClass}
								oninput={(e) => {
									const val = (e.target as HTMLInputElement).value;
									block.normkapitel = val
										.split(',')
										.map((s) => s.trim())
										.filter(Boolean);
									markManualEdit(bIdx, 'normkapitel');
								}}
							/>
						</div>
						<!-- Element/Prozess -->
						<div class="space-y-2">
							<Label>{i18n.t('notes_generator.element_prozess')}</Label>
							<input
								type="text"
								value={block.elementProzess.join(', ')}
								placeholder={i18n.t('notes_generator.element_prozess_placeholder')}
								class={inputClass}
								oninput={(e) => {
									const val = (e.target as HTMLInputElement).value;
									block.elementProzess = val
										.split(',')
										.map((s) => s.trim())
										.filter(Boolean);
								}}
							/>
						</div>
					</div>

					<!-- 6 Toggles -->
					<div class="bg-muted/50 rounded-lg p-4">
						<div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
							<label class="flex items-center gap-2">
								<Switch bind:checked={block.toggles.datum} />
								<span class="text-sm">{i18n.t('notes_generator.toggle_datum')}</span>
							</label>
							<label class="flex items-center gap-2">
								<Switch bind:checked={block.toggles.uhrzeit} />
								<span class="text-sm">{i18n.t('notes_generator.toggle_uhrzeit')}</span>
							</label>
							<label class="flex items-center gap-2">
								<Switch bind:checked={block.toggles.remote} />
								<span class="text-sm">{i18n.t('notes_generator.toggle_remote')}</span>
							</label>
							<label class="flex items-center gap-2">
								<Switch bind:checked={block.toggles.dokumenteAnzeigen} />
								<span class="text-sm">{i18n.t('notes_generator.toggle_dokumente')}</span>
							</label>
							<label class="flex items-center gap-2">
								<Switch bind:checked={block.toggles.bewertungAnzeigen} />
								<span class="text-sm">{i18n.t('notes_generator.toggle_bewertung')}</span>
							</label>
							<label class="flex items-center gap-2">
								<Switch bind:checked={block.toggles.notizenAnzeigen} />
								<span class="text-sm">{i18n.t('notes_generator.toggle_notizen')}</span>
							</label>
						</div>
					</div>

					<!-- Notes Panel Toggle -->
					<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
					<div class="cursor-pointer" onclick={() => toggleNotesPanel(block.id)}>
						<div class="hover:bg-muted/50 flex items-center gap-2 rounded-lg px-3 py-2 transition-colors">
							<ChevronsUpDown class="size-4" />
							<span class="text-sm font-medium">
								{notesOpen[block.id] ? i18n.t('notes_generator.notes_hide') : i18n.t('notes_generator.notes_toggle')}
							</span>
						</div>
					</div>

					<!-- Notes Fields (collapsible) -->
					{#if notesOpen[block.id]}
						<div class="space-y-4 pl-2">
							<div class="space-y-2">
								<Label>{i18n.t('notes_generator.beschreibung')}</Label>
								<textarea bind:value={block.beschreibung} class={textareaClass} rows="5" oninput={() => markManualEdit(bIdx, 'beschreibung')}></textarea>
							</div>
							<div class="space-y-2">
								<Label>{i18n.t('notes_generator.vorstellung')}</Label>
								<textarea bind:value={block.vorstellung} class={textareaClass} rows="2"></textarea>
							</div>
							<div class="space-y-2">
								<Label>{i18n.t('notes_generator.allgemein')}</Label>
								<textarea bind:value={block.allgemein} class={textareaClass} rows="2"></textarea>
							</div>
							<div class="space-y-2">
								<Label>{i18n.t('notes_generator.notizen')}</Label>
								<textarea bind:value={block.notizen} class={textareaClass} rows="3"></textarea>
							</div>
							<div class="space-y-2">
								<Label>{i18n.t('notes_generator.dokumente_text')}</Label>
								<textarea bind:value={block.dokumente} class={textareaClass} rows="2"></textarea>
							</div>
							<div class="space-y-2">
								<Label>{i18n.t('notes_generator.zusammenfassung')}</Label>
								<textarea bind:value={block.zusammenfassung} class={textareaClass} rows="6" oninput={() => markManualEdit(bIdx, 'zusammenfassung')}></textarea>
							</div>
						</div>
					{/if}

					<!-- QHSE Dokumente -->
					<div class="space-y-3">
						<div class="flex items-center justify-between">
							<h3 class="text-sm font-semibold">
								{i18n.t('notes_generator.qhse_title')}
							</h3>
							<Button variant="outline" size="sm" onclick={() => addQhseDoc(bIdx)}>
								<Plus class="mr-1 size-4" />
								{i18n.t('notes_generator.qhse_add')}
							</Button>
						</div>
						{#if block.qhseDokumente.length > 0}
							<div class="space-y-2">
								{#each block.qhseDokumente as doc, dIdx (doc.id)}
									<div class="bg-muted/50 flex flex-wrap items-center gap-3 rounded-lg p-3">
										<div class="min-w-[150px] flex-1">
											<input type="text" bind:value={doc.name} placeholder={i18n.t('notes_generator.qhse_name_placeholder')} class={inputClass} />
										</div>
										<div class="w-[140px]">
											<input type="date" bind:value={doc.datum} class={inputClass} />
										</div>
										<div class="min-w-[150px] flex-1">
											<input type="text" bind:value={doc.notizen} placeholder={i18n.t('notes_generator.qhse_notizen_placeholder')} class={inputClass} />
										</div>
										<div class="flex gap-1">
											<Button variant="ghost" size="sm" onclick={() => moveQhseUp(bIdx, dIdx)} disabled={dIdx === 0}>
												<ChevronUp class="size-4" />
											</Button>
											<Button variant="ghost" size="sm" onclick={() => moveQhseDown(bIdx, dIdx)} disabled={dIdx === block.qhseDokumente.length - 1}>
												<ChevronDown class="size-4" />
											</Button>
											<Button variant="ghost" size="sm" onclick={() => confirmDeleteQhse(block.id, doc.id, doc.name)}>
												<Trash2 class="size-4" />
											</Button>
										</div>
									</div>
								{/each}
							</div>
						{/if}
					</div>

					<!-- Bewertungen -->
					<div class="space-y-3">
						<div class="flex items-center justify-between">
							<h3 class="text-sm font-semibold">
								{i18n.t('notes_generator.bewertungen_title')}
							</h3>
							<Button variant="outline" size="sm" onclick={() => addBewertung(bIdx)}>
								<Plus class="mr-1 size-4" />
								{i18n.t('notes_generator.bewertung_add')}
							</Button>
						</div>
						{#if block.bewertungen.length > 0}
							<div class="space-y-3">
								{#each block.bewertungen as bew (bew.id)}
									<div class={`rounded-lg border p-4 ${bewertungsTypColors[bew.typ]}`}>
										<div class="mb-3 flex items-center justify-between">
											<div class="flex items-center gap-3">
												<select bind:value={bew.typ} class={inputClass} style="width: auto;">
													{#each bewertungsTypen as typ (typ)}
														<option value={typ}>
															{i18n.t(`notes_generator.bewertung_${typ}`)}
														</option>
													{/each}
												</select>
											</div>
											<Button variant="ghost" size="sm" onclick={() => deleteBewertung(bIdx, bew.id)}>
												<X class="size-4" />
											</Button>
										</div>
										<div class="grid grid-cols-1 gap-3 md:grid-cols-2">
											<div class="space-y-2">
												<Label>{i18n.t('notes_generator.bewertung_kapitel')}</Label>
												<input
													type="text"
													value={bew.kapitel.join(', ')}
													placeholder={i18n.t('notes_generator.bewertung_kapitel_placeholder')}
													class={inputClass}
													oninput={(e) => {
														const val = (e.target as HTMLInputElement).value;
														bew.kapitel = val
															.split(',')
															.map((s) => s.trim())
															.filter(Boolean);
													}}
												/>
											</div>
											<div class="space-y-2">
												<Label>{i18n.t('notes_generator.bewertung_beschreibung')}</Label>
												<textarea bind:value={bew.beschreibung} placeholder={i18n.t('notes_generator.bewertung_beschreibung_placeholder')} class={textareaClass} rows="2"
												></textarea>
											</div>
										</div>
									</div>
								{/each}
							</div>
						{/if}
					</div>
				</Card.Content>
			</Card.Root>
		{/each}
	</div>
</div>

<!-- Reset AlertDialog -->
<AlertDialog.Root bind:open={resetDialogOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>{i18n.t('notes_generator.reset')}</AlertDialog.Title>
			<AlertDialog.Description>
				{i18n.t('notes_generator.reset_confirm')}
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>{i18n.t('common.cancel')}</AlertDialog.Cancel>
			<AlertDialog.Action onclick={handleReset}>
				{i18n.t('notes_generator.reset')}
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>

<!-- Delete Block AlertDialog -->
<AlertDialog.Root
	open={deleteBlockId !== null}
	onOpenChange={(v) => {
		if (!v) deleteBlockId = null;
	}}
>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>{i18n.t('notes_generator.block_delete')}</AlertDialog.Title>
			<AlertDialog.Description>
				{i18n.t('notes_generator.block_delete_confirm')}
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>{i18n.t('common.cancel')}</AlertDialog.Cancel>
			<AlertDialog.Action onclick={executeDeleteBlock}>
				{i18n.t('common.delete')}
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>

<!-- Delete QHSE AlertDialog -->
<AlertDialog.Root
	open={deleteQhseInfo !== null}
	onOpenChange={(v) => {
		if (!v) deleteQhseInfo = null;
	}}
>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>{i18n.t('common.delete')}</AlertDialog.Title>
			<AlertDialog.Description>
				{i18n.t('notes_generator.qhse_delete_confirm', {
					name: deleteQhseInfo?.docName ?? ''
				})}
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>{i18n.t('common.cancel')}</AlertDialog.Cancel>
			<AlertDialog.Action onclick={executeDeleteQhse}>
				{i18n.t('common.delete')}
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
