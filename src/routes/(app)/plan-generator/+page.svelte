<script lang="ts">
	import { getContext } from 'svelte';
	import { page } from '$app/state';
	import type { I18nRune } from '$lib/i18n/i18n.svelte';
	import { savePlan, editSavedPlan, getSavedPlanById } from '$lib/rpc/plaene.remote';
	import { generatePlanWordDocument } from '$lib/word/auditplan-word';
	import FileText from '@lucide/svelte/icons/file-text';
	import { getAuditors } from '$lib/rpc/auditoren.remote';
	import { organisationseinheitOptionen } from '$lib/data/organisationseinheiten';
	import { abteilungBeschreibungen } from '$lib/data/abteilung-beschreibungen';
	import { zusammenfassungBeschreibungen, zusammenfassungDefaultText } from '$lib/data/zusammenfassungen';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import * as RadioGroup from '$lib/components/ui/radio-group';
	// Native <select> used for single-value selects (bits-ui Select expects string[])
	import { Badge } from '$lib/components/ui/badge';
	import { Label } from '$lib/components/ui/label';
	import { toast } from 'svelte-sonner';
	import Save from '@lucide/svelte/icons/save';
	import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
	import Plus from '@lucide/svelte/icons/plus';
	import X from '@lucide/svelte/icons/x';
	import Upload from '@lucide/svelte/icons/upload';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Copy from '@lucide/svelte/icons/copy';
	import ChevronUp from '@lucide/svelte/icons/chevron-up';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import ChevronsUpDown from '@lucide/svelte/icons/chevrons-up-down';
	import Info from '@lucide/svelte/icons/info';

	const i18n = getContext<I18nRune>('i18n');

	// Types
	interface TeamMember {
		name: string;
		extern: boolean;
		company: string;
	}

	interface AuditRow {
		datum: string;
		zeitVon: string;
		zeitBis: string;
		remote: boolean;
		organisationseinheit: string;
		auditor: string;
		gespraechspartner: string;
	}

	interface BlockNotes {
		abteilungsbeschreibung: string;
		zusammenfassung: string;
		normkapitel: string;
		themen: string;
		kommentar: string;
		themenListe: string[];
	}

	interface AuditBlock {
		rows: AuditRow[];
		notes: BlockNotes;
		notesOpen: boolean;
	}

	interface Revision {
		nummer: string;
		datum: string;
		beschreibung: string;
	}

	interface PlanData {
		znNummern: string[];
		logo: string;
		auftraggeber: string;
		standorte: string[];
		geltungsbereich: string;
		normgrundlage: string[];
		auditart: string;
		beauftragter: string;
		auditziel: string;
		auditzielEditable: boolean;
		auditsprachen: string;
		team: {
			lead_auditor: TeamMember[];
			auditors: TeamMember[];
			trainees: TeamMember[];
			experts: TeamMember[];
		};
		schichtsystem: string;
		schichtuebergaben: string;
		bemerkung: string;
		auditmethode: string;
		iktTechnik: string;
		iktTestdatum: string;
		iktTest: boolean;
		gastgeber: string;
		revisionen: Revision[];
		bloecke: AuditBlock[];
		verteiler: string;
		checkVertraulich: boolean;
		checkDatenschutz: boolean;
		checkIktGetestet: boolean;
		checkPlanVersendet: boolean;
	}

	// Default auditziel text
	const DEFAULT_AUDITZIEL =
		'Bewertung der Wirksamkeit des Managementsystems und seiner Konformität mit den Anforderungen der zugrunde liegenden Norm(en). Überprüfung der Fähigkeit des Managementsystems, die anwendbaren gesetzlichen und behördlichen Anforderungen sowie die vertraglichen Anforderungen zu erfüllen. Bewertung der kontinuierlichen Verbesserung und der Erreichung der festgelegten Ziele.';

	function createEmptyRow(): AuditRow {
		return {
			datum: '',
			zeitVon: '08:00',
			zeitBis: '17:00',
			remote: false,
			organisationseinheit: '',
			auditor: '',
			gespraechspartner: ''
		};
	}

	function createEmptyBlock(): AuditBlock {
		return {
			rows: [createEmptyRow()],
			notes: {
				abteilungsbeschreibung: '',
				zusammenfassung: '',
				normkapitel: '',
				themen: '',
				kommentar: '',
				themenListe: []
			},
			notesOpen: false
		};
	}

	function createEmptyTeamMember(): TeamMember {
		return { name: '', extern: false, company: '' };
	}

	function createDefaultPlan(): PlanData {
		return {
			znNummern: [],
			logo: '',
			auftraggeber: '',
			standorte: [''],
			geltungsbereich: '',
			normgrundlage: [],
			auditart: '',
			beauftragter: '',
			auditziel: DEFAULT_AUDITZIEL,
			auditzielEditable: false,
			auditsprachen: 'deutsch',
			team: {
				lead_auditor: [createEmptyTeamMember()],
				auditors: [createEmptyTeamMember()],
				trainees: [],
				experts: []
			},
			schichtsystem: 'keine',
			schichtuebergaben: '',
			bemerkung: '',
			auditmethode: 'vor_ort',
			iktTechnik: '',
			iktTestdatum: '',
			iktTest: false,
			gastgeber: '',
			revisionen: [],
			bloecke: [createEmptyBlock()],
			verteiler: '',
			checkVertraulich: false,
			checkDatenschutz: false,
			checkIktGetestet: false,
			checkPlanVersendet: false
		};
	}

	// State
	let plan = $state<PlanData>(createDefaultPlan());
	let editId = $state<string | null>(null);
	let saving = $state(false);
	let znInput = $state('');
	let auditorList = $state<{ id: string; name: string | null }[]>([]);

	// Load auditors
	$effect(() => {
		getAuditors().then((list) => {
			auditorList = list;
		});
	});

	// Load plan if editing
	$effect(() => {
		const id = page.url.searchParams.get('edit');
		if (id) {
			editId = id;
			getSavedPlanById(id).then((result) => {
				if (result && result.daten) {
					try {
						const loaded = JSON.parse(result.daten) as PlanData;
						plan = loaded;
					} catch {
						toast.error(i18n.t('plan_generator.save_error'));
					}
				}
			});
		}
	});

	// Derived: all org unit names for datalist
	const orgUnitNames = $derived(organisationseinheitOptionen.map((o) => o.name));

	// Norm options
	const normOptions = ['ISO 9001', 'ISO 14001', 'ISO 45001', 'ISO 50001', 'ISO 27001'];

	const auditartOptions = ['erst', 'ueberwachung1', 'ueberwachung2', 'rezertifizierung', 'sonder', 'voraudit', 'transferaudit', 'erweiterung'];

	const sprachOptions = [
		{ value: 'deutsch', key: 'sprache_deutsch' },
		{ value: 'englisch', key: 'sprache_englisch' },
		{ value: 'franzoesisch', key: 'sprache_franzoesisch' },
		{ value: 'spanisch', key: 'sprache_spanisch' },
		{ value: 'italienisch', key: 'sprache_italienisch' }
	];

	const schichtOptions = [
		{ value: 'keine', key: 'schicht_keine' },
		{ value: '1', key: 'schicht_1' },
		{ value: '2', key: 'schicht_2' },
		{ value: '3', key: 'schicht_3' },
		{ value: 'konti', key: 'schicht_konti' }
	];

	const teamRoles = ['lead_auditor', 'auditors', 'trainees', 'experts'] as const;

	// Actions
	function addZn() {
		const val = znInput.trim();
		if (val && !plan.znNummern.includes(val)) {
			plan.znNummern = [...plan.znNummern, val];
			znInput = '';
		}
	}

	function removeZn(zn: string) {
		plan.znNummern = plan.znNummern.filter((z) => z !== zn);
	}

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
			plan.logo = reader.result as string;
		};
		reader.readAsDataURL(file);
	}

	function removeLogo() {
		plan.logo = '';
	}

	function addStandort() {
		plan.standorte = [...plan.standorte, ''];
	}

	function removeStandort(index: number) {
		plan.standorte = plan.standorte.filter((_, i) => i !== index);
	}

	function toggleNorm(norm: string) {
		if (plan.normgrundlage.includes(norm)) {
			plan.normgrundlage = plan.normgrundlage.filter((n) => n !== norm);
		} else {
			plan.normgrundlage = [...plan.normgrundlage, norm];
		}
	}

	function addTeamMember(role: (typeof teamRoles)[number]) {
		plan.team[role] = [...plan.team[role], createEmptyTeamMember()];
	}

	function removeTeamMember(role: (typeof teamRoles)[number], index: number) {
		plan.team[role] = plan.team[role].filter((_, i) => i !== index);
	}

	function addRevision() {
		const num = plan.revisionen.length + 1;
		plan.revisionen = [
			...plan.revisionen,
			{
				nummer: `Rev. ${num}.0`,
				datum: new Date().toISOString().slice(0, 10),
				beschreibung: ''
			}
		];
	}

	function removeRevision(index: number) {
		plan.revisionen = plan.revisionen.filter((_, i) => i !== index);
	}

	// Block operations
	function addBlock() {
		plan.bloecke = [...plan.bloecke, createEmptyBlock()];
	}

	function deleteBlock(index: number) {
		if (plan.bloecke.length <= 1) return;
		plan.bloecke = plan.bloecke.filter((_, i) => i !== index);
	}

	function duplicateBlock(index: number) {
		const block = plan.bloecke[index];
		const cloned: AuditBlock = JSON.parse(JSON.stringify(block));
		cloned.notesOpen = false;
		plan.bloecke = [...plan.bloecke.slice(0, index + 1), cloned, ...plan.bloecke.slice(index + 1)];
	}

	function moveBlockUp(index: number) {
		if (index === 0) return;
		const arr = [...plan.bloecke];
		[arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
		plan.bloecke = arr;
	}

	function moveBlockDown(index: number) {
		if (index >= plan.bloecke.length - 1) return;
		const arr = [...plan.bloecke];
		[arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
		plan.bloecke = arr;
	}

	function addRow(blockIndex: number) {
		plan.bloecke[blockIndex].rows = [...plan.bloecke[blockIndex].rows, createEmptyRow()];
	}

	function deleteRow(blockIndex: number, rowIndex: number) {
		if (plan.bloecke[blockIndex].rows.length <= 1) return;
		plan.bloecke[blockIndex].rows = plan.bloecke[blockIndex].rows.filter((_, i) => i !== rowIndex);
	}

	function toggleNotes(blockIndex: number) {
		plan.bloecke[blockIndex].notesOpen = !plan.bloecke[blockIndex].notesOpen;
	}

	// Auto-fill notes based on organisationseinheit
	function onOrgUnitChange(blockIndex: number, rowIndex: number) {
		const orgUnit = plan.bloecke[blockIndex].rows[rowIndex].organisationseinheit;
		if (orgUnit && rowIndex === 0) {
			const notes = plan.bloecke[blockIndex].notes;
			if (!notes.abteilungsbeschreibung) {
				notes.abteilungsbeschreibung = abteilungBeschreibungen[orgUnit] ?? '';
			}
			if (!notes.zusammenfassung) {
				notes.zusammenfassung = zusammenfassungBeschreibungen[orgUnit] ?? zusammenfassungDefaultText;
			}
			// Auto-fill themen
			const orgOption = organisationseinheitOptionen.find((o) => o.name === orgUnit);
			if (orgOption && notes.themenListe.length === 0) {
				notes.themenListe = [...orgOption.themen];
				notes.themen = orgOption.themen.join(', ');
			}
		}
	}

	// Save
	async function handleSave() {
		saving = true;
		try {
			const name = plan.auftraggeber ? `Auditplan - ${plan.auftraggeber.split('\n')[0].trim()}` : `Auditplan - ${new Date().toLocaleDateString('de-DE')}`;
			const daten = JSON.stringify(plan);

			if (editId) {
				await editSavedPlan({ id: editId, data: { name, daten } });
				toast.success(i18n.t('plan_generator.update_success'));
			} else {
				const result = await savePlan({ name, daten });
				if (result) {
					editId = result.id;
				}
				toast.success(i18n.t('plan_generator.save_success'));
			}
		} catch {
			toast.error(i18n.t('plan_generator.save_error'));
		} finally {
			saving = false;
		}
	}

	function handleReset() {
		plan = createDefaultPlan();
		editId = null;
		znInput = '';
	}

	async function handleWordExport() {
		try {
			await generatePlanWordDocument(plan, plan.logo || undefined);
			toast.success(i18n.t('common.download'));
		} catch {
			toast.error(i18n.t('plan_generator.save_error'));
		}
	}

	// File input ref
	let fileInput: HTMLInputElement | undefined = $state();
</script>

<!-- Sticky Action Bar -->
<div class="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-30 border-b backdrop-blur">
	<div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
		<h1 class="text-xl font-bold" style="font-family: var(--font-display)">
			{i18n.t('plan_generator.title')}
		</h1>
		<div class="flex gap-2">
			<Button variant="outline" onclick={handleReset}>
				<RotateCcw class="mr-2 size-4" />
				{i18n.t('plan_generator.reset')}
			</Button>
			<Button variant="outline" onclick={handleWordExport}>
				<FileText class="mr-2 size-4" />
				Word-Export
			</Button>
			<Button onclick={handleSave} disabled={saving}>
				<Save class="mr-2 size-4" />
				{saving ? i18n.t('common.loading') : i18n.t('plan_generator.save')}
			</Button>
		</div>
	</div>
</div>

<div class="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
	<!-- 1. ZN-Verwaltung -->
	<Card.Root>
		<Card.Header>
			<Card.Title>{i18n.t('plan_generator.zn_title')}</Card.Title>
		</Card.Header>
		<Card.Content>
			<div class="flex gap-2">
				<input
					type="text"
					bind:value={znInput}
					placeholder={i18n.t('plan_generator.zn_placeholder')}
					class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 flex-1 rounded-md border px-3 py-1 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
					onkeydown={(e) => {
						if (e.key === 'Enter') {
							e.preventDefault();
							addZn();
						}
					}}
				/>
				<Button size="sm" onclick={addZn}>
					<Plus class="mr-1 size-4" />
					{i18n.t('plan_generator.zn_add')}
				</Button>
			</div>
			{#if plan.znNummern.length > 0}
				<div class="mt-3 flex flex-wrap gap-2">
					{#each plan.znNummern as zn (zn)}
						<Badge variant="secondary" class="gap-1 pr-1">
							{zn}
							<button type="button" class="hover:bg-muted ml-1 rounded-full p-0.5" onclick={() => removeZn(zn)}>
								<X class="size-3" />
							</button>
						</Badge>
					{/each}
				</div>
			{/if}
		</Card.Content>
	</Card.Root>

	<!-- 2. Logo Upload -->
	<Card.Root>
		<Card.Header>
			<Card.Title>{i18n.t('plan_generator.logo_title')}</Card.Title>
		</Card.Header>
		<Card.Content>
			<input bind:this={fileInput} type="file" accept="image/png,image/jpeg,image/svg+xml" class="hidden" onchange={handleLogoUpload} />
			{#if plan.logo}
				<div class="flex items-start gap-4">
					<img src={plan.logo} alt="Logo" class="bg-muted h-24 rounded-md border object-contain" />
					<Button variant="destructive" size="sm" onclick={removeLogo}>
						<Trash2 class="mr-1 size-4" />
						{i18n.t('plan_generator.logo_remove')}
					</Button>
				</div>
			{:else}
				<div class="flex items-center gap-4">
					<Button variant="outline" onclick={() => fileInput?.click()}>
						<Upload class="mr-2 size-4" />
						{i18n.t('plan_generator.logo_upload')}
					</Button>
					<span class="text-muted-foreground text-sm">
						{i18n.t('plan_generator.logo_hint')}
					</span>
				</div>
			{/if}
		</Card.Content>
	</Card.Root>

	<!-- 3. Grunddaten -->
	<Card.Root>
		<Card.Header>
			<Card.Title>{i18n.t('plan_generator.grunddaten_title')}</Card.Title>
		</Card.Header>
		<Card.Content class="space-y-4">
			<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
				<!-- Auftraggeber -->
				<div class="space-y-2">
					<Label>{i18n.t('plan_generator.auftraggeber')}</Label>
					<textarea
						bind:value={plan.auftraggeber}
						placeholder={i18n.t('plan_generator.auftraggeber_placeholder')}
						class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
						rows="3"
					></textarea>
				</div>

				<!-- Geltungsbereich -->
				<div class="space-y-2">
					<Label>{i18n.t('plan_generator.geltungsbereich')}</Label>
					<textarea
						bind:value={plan.geltungsbereich}
						placeholder={i18n.t('plan_generator.geltungsbereich_placeholder')}
						class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
						rows="3"
					></textarea>
				</div>
			</div>

			<!-- Standorte -->
			<div class="space-y-2">
				<div class="flex items-center justify-between">
					<Label>{i18n.t('plan_generator.standorte')}</Label>
					<Button variant="outline" size="sm" onclick={addStandort}>
						<Plus class="mr-1 size-4" />
						{i18n.t('plan_generator.standort_add')}
					</Button>
				</div>
				<div class="space-y-2">
					{#each plan.standorte as _, idx (idx)}
						<div class="flex gap-2">
							<input
								type="text"
								bind:value={plan.standorte[idx]}
								placeholder={i18n.t('plan_generator.standort_placeholder')}
								class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 flex-1 rounded-md border px-3 py-1 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
							/>
							{#if plan.standorte.length > 1}
								<Button variant="ghost" size="sm" onclick={() => removeStandort(idx)}>
									<X class="size-4" />
								</Button>
							{/if}
						</div>
					{/each}
				</div>
			</div>

			<!-- Normgrundlage -->
			<div class="space-y-2">
				<Label>{i18n.t('plan_generator.normgrundlage')}</Label>
				<div class="flex flex-wrap gap-4">
					{#each normOptions as norm (norm)}
						<label class="flex cursor-pointer items-center gap-2">
							<Checkbox checked={plan.normgrundlage.includes(norm)} onCheckedChange={() => toggleNorm(norm)} />
							<span class="text-sm">{norm}</span>
						</label>
					{/each}
				</div>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- 4. Auditdetails -->
	<Card.Root>
		<Card.Header>
			<Card.Title>{i18n.t('plan_generator.auditdetails_title')}</Card.Title>
		</Card.Header>
		<Card.Content class="space-y-4">
			<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
				<!-- Auditart -->
				<div class="space-y-2">
					<Label>{i18n.t('plan_generator.auditart')}</Label>
					<select
						bind:value={plan.auditart}
						class="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
					>
						<option value="">{i18n.t('plan_generator.auditart')}</option>
						{#each auditartOptions as opt (opt)}
							<option value={opt}>{i18n.t(`plan_generator.auditart_${opt}`)}</option>
						{/each}
					</select>
				</div>

				<!-- Beauftragter -->
				<div class="space-y-2">
					<Label>{i18n.t('plan_generator.beauftragter')}</Label>
					<input
						type="text"
						bind:value={plan.beauftragter}
						placeholder={i18n.t('plan_generator.beauftragter_placeholder')}
						class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
					/>
				</div>

				<!-- Auditsprachen -->
				<div class="space-y-2">
					<Label>{i18n.t('plan_generator.auditsprachen')}</Label>
					<select
						bind:value={plan.auditsprachen}
						class="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
					>
						{#each sprachOptions as opt (opt.value)}
							<option value={opt.value}>{i18n.t(`plan_generator.${opt.key}`)}</option>
						{/each}
					</select>
				</div>
			</div>

			<!-- Auditziel -->
			<div class="space-y-2">
				<div class="flex items-center gap-4">
					<Label>{i18n.t('plan_generator.auditziel')}</Label>
					<label class="flex cursor-pointer items-center gap-2">
						<Checkbox
							checked={plan.auditzielEditable}
							onCheckedChange={(v) => {
								plan.auditzielEditable = v === true;
							}}
						/>
						<span class="text-muted-foreground text-sm">
							{i18n.t('plan_generator.auditziel_edit')}
						</span>
					</label>
				</div>
				<textarea
					bind:value={plan.auditziel}
					readonly={!plan.auditzielEditable}
					class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-50"
					class:opacity-60={!plan.auditzielEditable}
					rows="3"
				></textarea>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- 5. Audit-Team -->
	<Card.Root>
		<Card.Header>
			<Card.Title>{i18n.t('plan_generator.team_title')}</Card.Title>
		</Card.Header>
		<Card.Content class="space-y-6">
			{#each teamRoles as role (role)}
				<div class="space-y-3">
					<div class="flex items-center justify-between">
						<Label class="text-base font-semibold">
							{i18n.t(`plan_generator.team_${role}`)}
						</Label>
						<Button variant="outline" size="sm" onclick={() => addTeamMember(role)}>
							<Plus class="mr-1 size-4" />
							{i18n.t('plan_generator.team_add')}
						</Button>
					</div>
					{#each plan.team[role] as member, mIdx (mIdx)}
						<div class="bg-muted/50 flex flex-wrap items-center gap-3 rounded-lg p-3">
							<div class="min-w-[200px] flex-1">
								<input
									type="text"
									bind:value={member.name}
									placeholder={i18n.t('plan_generator.team_name_placeholder')}
									class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
								/>
							</div>
							<label class="flex items-center gap-2">
								<Checkbox
									checked={member.extern}
									onCheckedChange={(v) => {
										member.extern = v === true;
									}}
								/>
								<span class="text-sm">{i18n.t('plan_generator.team_extern')}</span>
							</label>
							{#if member.extern}
								<div class="min-w-[150px] flex-1">
									<input
										type="text"
										bind:value={member.company}
										placeholder={i18n.t('plan_generator.team_company_placeholder')}
										class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
									/>
								</div>
							{/if}
							<Button variant="ghost" size="sm" onclick={() => removeTeamMember(role, mIdx)}>
								<X class="size-4" />
							</Button>
						</div>
					{/each}
				</div>
			{/each}
		</Card.Content>
	</Card.Root>

	<!-- 6. Betriebsorganisation -->
	<Card.Root>
		<Card.Header>
			<Card.Title>{i18n.t('plan_generator.betriebsorg_title')}</Card.Title>
		</Card.Header>
		<Card.Content class="space-y-4">
			<div class="space-y-2">
				<Label>{i18n.t('plan_generator.schichtsystem')}</Label>
				<RadioGroup.Root bind:value={plan.schichtsystem} class="flex flex-wrap gap-4">
					{#each schichtOptions as opt (opt.value)}
						<div class="flex items-center gap-2">
							<RadioGroup.Item value={opt.value} />
							<Label class="cursor-pointer font-normal">
								{i18n.t(`plan_generator.${opt.key}`)}
							</Label>
						</div>
					{/each}
				</RadioGroup.Root>
			</div>

			<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
				<div class="space-y-2">
					<Label>{i18n.t('plan_generator.schichtuebergaben')}</Label>
					<textarea
						bind:value={plan.schichtuebergaben}
						placeholder={i18n.t('plan_generator.schichtuebergaben_placeholder')}
						class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[60px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
						rows="2"
					></textarea>
				</div>
				<div class="space-y-2">
					<Label>{i18n.t('plan_generator.bemerkung')}</Label>
					<textarea
						bind:value={plan.bemerkung}
						placeholder={i18n.t('plan_generator.bemerkung_placeholder')}
						class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[60px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
						rows="2"
					></textarea>
				</div>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- 7. Auditmethode -->
	<Card.Root>
		<Card.Header>
			<Card.Title>{i18n.t('plan_generator.auditmethode_title')}</Card.Title>
		</Card.Header>
		<Card.Content class="space-y-4">
			<div class="space-y-2">
				<RadioGroup.Root bind:value={plan.auditmethode} class="flex flex-wrap gap-4">
					<div class="flex items-center gap-2">
						<RadioGroup.Item value="vor_ort" />
						<Label class="cursor-pointer font-normal">
							{i18n.t('plan_generator.methode_vor_ort')}
						</Label>
					</div>
					<div class="flex items-center gap-2">
						<RadioGroup.Item value="remote" />
						<Label class="cursor-pointer font-normal">
							{i18n.t('plan_generator.methode_remote')}
						</Label>
					</div>
					<div class="flex items-center gap-2">
						<RadioGroup.Item value="hybrid" />
						<Label class="cursor-pointer font-normal">
							{i18n.t('plan_generator.methode_hybrid')}
						</Label>
					</div>
				</RadioGroup.Root>
			</div>

			{#if plan.auditmethode === 'remote' || plan.auditmethode === 'hybrid'}
				<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
					<div class="space-y-2">
						<Label>{i18n.t('plan_generator.ikt_technik')}</Label>
						<input
							type="text"
							bind:value={plan.iktTechnik}
							placeholder={i18n.t('plan_generator.ikt_technik_placeholder')}
							class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
						/>
					</div>
					<div class="space-y-2">
						<Label>{i18n.t('plan_generator.ikt_testdatum')}</Label>
						<input
							type="date"
							bind:value={plan.iktTestdatum}
							class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
						/>
					</div>
					<div class="flex items-center gap-2">
						<Checkbox
							checked={plan.iktTest}
							onCheckedChange={(v) => {
								plan.iktTest = v === true;
							}}
						/>
						<Label class="cursor-pointer font-normal">
							{i18n.t('plan_generator.ikt_test')}
						</Label>
					</div>
					<div class="space-y-2">
						<Label>{i18n.t('plan_generator.gastgeber')}</Label>
						<input
							type="text"
							bind:value={plan.gastgeber}
							placeholder={i18n.t('plan_generator.gastgeber_placeholder')}
							class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
						/>
					</div>
				</div>
			{/if}
		</Card.Content>
	</Card.Root>

	<!-- 8. Revisionen -->
	<Card.Root>
		<Card.Header>
			<div class="flex items-center justify-between">
				<Card.Title>{i18n.t('plan_generator.revisionen_title')}</Card.Title>
				<Button variant="outline" size="sm" onclick={addRevision}>
					<Plus class="mr-1 size-4" />
					{i18n.t('plan_generator.revision_add')}
				</Button>
			</div>
		</Card.Header>
		<Card.Content>
			{#if plan.revisionen.length === 0}
				<p class="text-muted-foreground text-sm">{i18n.t('common.no_data')}</p>
			{:else}
				<div class="space-y-3">
					{#each plan.revisionen as rev, rIdx (rIdx)}
						<div class="bg-muted/50 flex flex-wrap items-center gap-3 rounded-lg p-3">
							<span class="text-sm font-medium">{rev.nummer}</span>
							<input
								type="date"
								bind:value={rev.datum}
								class="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-9 rounded-md border px-3 py-1 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
							/>
							<div class="flex-1">
								<input
									type="text"
									bind:value={rev.beschreibung}
									placeholder={i18n.t('plan_generator.revision_beschreibung_placeholder')}
									class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
								/>
							</div>
							<Button variant="ghost" size="sm" onclick={() => removeRevision(rIdx)}>
								<X class="size-4" />
							</Button>
						</div>
					{/each}
				</div>
			{/if}
		</Card.Content>
	</Card.Root>

	<!-- 9. Audit-Blöcke -->
	<div class="space-y-4">
		<div class="flex items-center justify-between">
			<h2 class="text-xl font-bold" style="font-family: var(--font-display)">
				{i18n.t('plan_generator.bloecke_title')}
			</h2>
			<Button onclick={addBlock}>
				<Plus class="mr-1 size-4" />
				{i18n.t('plan_generator.block_add')}
			</Button>
		</div>

		{#each plan.bloecke as block, bIdx (bIdx)}
			<Card.Root>
				<Card.Header>
					<div class="flex items-center justify-between">
						<Card.Title>
							{i18n.t('plan_generator.block_title', { num: bIdx + 1 })}
						</Card.Title>
						<div class="flex gap-1">
							<Button variant="ghost" size="sm" onclick={() => moveBlockUp(bIdx)} disabled={bIdx === 0} title={i18n.t('plan_generator.block_move_up')}>
								<ChevronUp class="size-4" />
							</Button>
							<Button variant="ghost" size="sm" onclick={() => moveBlockDown(bIdx)} disabled={bIdx === plan.bloecke.length - 1} title={i18n.t('plan_generator.block_move_down')}>
								<ChevronDown class="size-4" />
							</Button>
							<Button variant="ghost" size="sm" onclick={() => duplicateBlock(bIdx)} title={i18n.t('plan_generator.block_duplicate')}>
								<Copy class="size-4" />
							</Button>
							<Button variant="ghost" size="sm" onclick={() => deleteBlock(bIdx)} disabled={plan.bloecke.length <= 1} title={i18n.t('plan_generator.block_delete')}>
								<Trash2 class="size-4" />
							</Button>
						</div>
					</div>
				</Card.Header>
				<Card.Content class="space-y-3">
					<!-- Rows -->
					<div class="overflow-x-auto">
						<table class="w-full text-sm">
							<thead>
								<tr class="border-b">
									<th class="px-2 py-1 text-left font-medium">{i18n.t('plan_generator.row_datum')}</th>
									<th class="px-2 py-1 text-left font-medium">{i18n.t('plan_generator.row_zeit_von')}</th>
									<th class="px-2 py-1 text-left font-medium">{i18n.t('plan_generator.row_zeit_bis')}</th>
									<th class="px-2 py-1 text-center font-medium">{i18n.t('plan_generator.row_remote')}</th>
									<th class="px-2 py-1 text-left font-medium">{i18n.t('plan_generator.row_organisationseinheit')}</th>
									<th class="px-2 py-1 text-left font-medium">{i18n.t('plan_generator.row_auditor')}</th>
									<th class="px-2 py-1 text-left font-medium">{i18n.t('plan_generator.row_gespraechspartner')}</th>
									<th class="px-2 py-1"></th>
								</tr>
							</thead>
							<tbody>
								{#each block.rows as row, rIdx (rIdx)}
									<tr class="border-b last:border-0">
										<td class="px-2 py-1">
											<input
												type="date"
												bind:value={row.datum}
												class="border-input bg-background focus-visible:ring-ring flex h-8 w-[130px] rounded-md border px-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
											/>
										</td>
										<td class="px-2 py-1">
											<input
												type="time"
												bind:value={row.zeitVon}
												class="border-input bg-background focus-visible:ring-ring flex h-8 w-[90px] rounded-md border px-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
											/>
										</td>
										<td class="px-2 py-1">
											<input
												type="time"
												bind:value={row.zeitBis}
												class="border-input bg-background focus-visible:ring-ring flex h-8 w-[90px] rounded-md border px-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
											/>
										</td>
										<td class="px-2 py-1 text-center">
											<Checkbox
												checked={row.remote}
												onCheckedChange={(v) => {
													row.remote = v === true;
												}}
											/>
										</td>
										<td class="px-2 py-1">
											<input
												type="text"
												bind:value={row.organisationseinheit}
												list="org-units-{bIdx}-{rIdx}"
												placeholder={i18n.t('plan_generator.row_organisationseinheit_placeholder')}
												class="border-input bg-background focus-visible:ring-ring flex h-8 w-full min-w-[150px] rounded-md border px-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
												onchange={() => onOrgUnitChange(bIdx, rIdx)}
											/>
											<datalist id="org-units-{bIdx}-{rIdx}">
												{#each orgUnitNames as name (name)}
													<option value={name}></option>
												{/each}
											</datalist>
										</td>
										<td class="px-2 py-1">
											<input
												type="text"
												bind:value={row.auditor}
												list="auditors-list"
												placeholder={i18n.t('plan_generator.row_auditor_placeholder')}
												class="border-input bg-background focus-visible:ring-ring flex h-8 w-full min-w-[120px] rounded-md border px-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
											/>
										</td>
										<td class="px-2 py-1">
											<input
												type="text"
												bind:value={row.gespraechspartner}
												placeholder={i18n.t('plan_generator.row_gespraechspartner_placeholder')}
												class="border-input bg-background focus-visible:ring-ring flex h-8 w-full min-w-[120px] rounded-md border px-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
											/>
										</td>
										<td class="px-2 py-1">
											<Button variant="ghost" size="sm" onclick={() => deleteRow(bIdx, rIdx)} disabled={block.rows.length <= 1}>
												<X class="size-4" />
											</Button>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>

					<Button variant="outline" size="sm" onclick={() => addRow(bIdx)}>
						<Plus class="mr-1 size-4" />
						{i18n.t('plan_generator.row_add')}
					</Button>

					<!-- Notes toggle -->
					<div class="border-t pt-3">
						<Button variant="ghost" size="sm" onclick={() => toggleNotes(bIdx)}>
							<ChevronsUpDown class="mr-1 size-4" />
							{block.notesOpen ? i18n.t('plan_generator.notes_hide') : i18n.t('plan_generator.notes_toggle')}
						</Button>

						{#if block.notesOpen}
							<div class="mt-3 space-y-4">
								<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
									<div class="space-y-2">
										<Label>{i18n.t('plan_generator.notes_abteilungsbeschreibung')}</Label>
										<textarea
											bind:value={block.notes.abteilungsbeschreibung}
											class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[100px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
											rows="4"
										></textarea>
									</div>
									<div class="space-y-2">
										<Label>{i18n.t('plan_generator.notes_zusammenfassung')}</Label>
										<textarea
											bind:value={block.notes.zusammenfassung}
											class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[100px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
											rows="4"
										></textarea>
									</div>
									<div class="space-y-2">
										<Label>{i18n.t('plan_generator.notes_normkapitel')}</Label>
										<textarea
											bind:value={block.notes.normkapitel}
											placeholder={i18n.t('plan_generator.notes_normkapitel_placeholder')}
											class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[60px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
											rows="2"
										></textarea>
									</div>
									<div class="space-y-2">
										<Label>{i18n.t('plan_generator.notes_themen')}</Label>
										<textarea
											bind:value={block.notes.themen}
											placeholder={i18n.t('plan_generator.notes_themen_placeholder')}
											class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[60px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
											rows="2"
										></textarea>
									</div>
								</div>
								<div class="space-y-2">
									<Label>{i18n.t('plan_generator.notes_kommentar')}</Label>
									<textarea
										bind:value={block.notes.kommentar}
										placeholder={i18n.t('plan_generator.notes_kommentar_placeholder')}
										class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[60px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
										rows="2"
									></textarea>
								</div>
							</div>
						{/if}
					</div>
				</Card.Content>
			</Card.Root>
		{/each}
	</div>

	<!-- 10. Hinweise und Verteiler -->
	<Card.Root>
		<Card.Header>
			<Card.Title>{i18n.t('plan_generator.hinweise_title')}</Card.Title>
		</Card.Header>
		<Card.Content class="space-y-4">
			<div class="bg-muted/50 flex items-start gap-3 rounded-lg border p-4">
				<Info class="text-muted-foreground mt-0.5 size-5 shrink-0" />
				<p class="text-muted-foreground text-sm">
					{i18n.t('plan_generator.hinweise_info')}
				</p>
			</div>

			<div class="space-y-2">
				<Label>{i18n.t('plan_generator.verteiler')}</Label>
				<textarea
					bind:value={plan.verteiler}
					placeholder={i18n.t('plan_generator.verteiler_placeholder')}
					class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
					rows="3"
				></textarea>
			</div>

			<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
				<label class="flex cursor-pointer items-center gap-2">
					<Checkbox
						checked={plan.checkVertraulich}
						onCheckedChange={(v) => {
							plan.checkVertraulich = v === true;
						}}
					/>
					<span class="text-sm">{i18n.t('plan_generator.check_vertraulich')}</span>
				</label>
				<label class="flex cursor-pointer items-center gap-2">
					<Checkbox
						checked={plan.checkDatenschutz}
						onCheckedChange={(v) => {
							plan.checkDatenschutz = v === true;
						}}
					/>
					<span class="text-sm">{i18n.t('plan_generator.check_datenschutz')}</span>
				</label>
				<label class="flex cursor-pointer items-center gap-2">
					<Checkbox
						checked={plan.checkIktGetestet}
						onCheckedChange={(v) => {
							plan.checkIktGetestet = v === true;
						}}
					/>
					<span class="text-sm">{i18n.t('plan_generator.check_ikt_getestet')}</span>
				</label>
				<label class="flex cursor-pointer items-center gap-2">
					<Checkbox
						checked={plan.checkPlanVersendet}
						onCheckedChange={(v) => {
							plan.checkPlanVersendet = v === true;
						}}
					/>
					<span class="text-sm">{i18n.t('plan_generator.check_plan_versendet')}</span>
				</label>
			</div>
		</Card.Content>
	</Card.Root>
</div>

<!-- Shared datalist for auditors -->
<datalist id="auditors-list">
	{#each auditorList as auditor (auditor.id)}
		<option value={auditor.name ?? ''}></option>
	{/each}
</datalist>
