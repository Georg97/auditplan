<script lang="ts">
	import { getContext } from 'svelte';
	import type { I18nRune } from '$lib/i18n/i18n.svelte';
	import type { AuditPlanGrunddaten, AuditPlanStandort, AuditPlanRevision, AuditPlanTeamMitglied, AuditPlanAuditzeit, AuditPlanAuditzeitZeile } from '$lib/types/audit-plan';
	import { AUDIT_PLAN_TEAM_ROLES, AUDIT_METHODS, SHIFT_SYSTEMS, AUDIT_LANGUAGES, AUDITART_OPTIONS, ISO_NORMS } from '$lib/types/audit-plan';
	import { generateId, createEmptyAuditzeit, createEmptyAuditzeitZeile, calculateHours, calculateTotalHours } from '$lib/utils/plan-generator';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Badge } from '$lib/components/ui/badge';
	import * as Select from '$lib/components/ui/select';
	import Plus from '@lucide/svelte/icons/plus';
	import X from '@lucide/svelte/icons/x';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Upload from '@lucide/svelte/icons/upload';

	const i18n = getContext<I18nRune>('i18n');

	let {
		planName = $bindable(''),
		grunddaten = $bindable<Partial<AuditPlanGrunddaten>>({}),
		standorte = $bindable<AuditPlanStandort[]>([{ id: generateId(), auditPlanId: '', name: '', position: 0 }]),
		znNummern = $bindable<string[]>([]),
		selectedNorms = $bindable<string[]>([]),
		selectedAuditarten = $bindable<string[]>([]),
		selectedSprachen = $bindable<string[]>([]),
		teamMitglieder = $bindable<AuditPlanTeamMitglied[]>([]),
		revisionen = $bindable<AuditPlanRevision[]>([]),
		auditzeiten = $bindable<AuditPlanAuditzeit[]>([]),
		logoBase64 = $bindable<string | undefined>(undefined),
		logoDateiname = $bindable<string | undefined>(undefined)
	}: {
		planName: string;
		grunddaten: Partial<AuditPlanGrunddaten>;
		standorte: AuditPlanStandort[];
		znNummern: string[];
		selectedNorms: string[];
		selectedAuditarten: string[];
		selectedSprachen: string[];
		teamMitglieder: AuditPlanTeamMitglied[];
		revisionen: AuditPlanRevision[];
		auditzeiten: AuditPlanAuditzeit[];
		logoBase64: string | undefined;
		logoDateiname: string | undefined;
	} = $props();

	// ── ZN management ───────────────────────────────────────────
	let znInput = $state('');

	function addZn() {
		const value = znInput.trim();
		if (value && !znNummern.includes(value)) {
			znNummern = [...znNummern, value];
			znInput = '';
		}
	}

	function removeZn(zn: string) {
		znNummern = znNummern.filter((z) => z !== zn);
	}

	function handleZnKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			addZn();
		}
	}

	// ── Logo upload ─────────────────────────────────────────────
	let logoInput: HTMLInputElement;

	function handleLogoUpload(e: Event) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;
		if (!file.type.startsWith('image/')) return;
		if (file.size > 500 * 1024) return; // 500KB limit for logos

		const reader = new FileReader();
		reader.onload = () => {
			logoBase64 = (reader.result as string).split(',')[1];
			logoDateiname = file.name;
		};
		reader.readAsDataURL(file);
	}

	function removeLogo() {
		logoBase64 = undefined;
		logoDateiname = undefined;
	}

	// ── Standorte ───────────────────────────────────────────────
	function addStandort() {
		standorte = [...standorte, { id: generateId(), auditPlanId: '', name: '', position: standorte.length }];
	}

	function removeStandort(idx: number) {
		if (standorte.length <= 1) return;
		standorte = standorte.filter((_, i) => i !== idx);
	}

	// ── Norm toggle ─────────────────────────────────────────────
	function toggleNorm(norm: string) {
		if (selectedNorms.includes(norm)) {
			selectedNorms = selectedNorms.filter((n) => n !== norm);
		} else {
			selectedNorms = [...selectedNorms, norm];
		}
	}

	// ── Auditart toggle ─────────────────────────────────────────
	function toggleAuditart(art: string) {
		if (selectedAuditarten.includes(art)) {
			selectedAuditarten = selectedAuditarten.filter((a) => a !== art);
		} else {
			selectedAuditarten = [...selectedAuditarten, art];
		}
	}

	// ── Sprachen toggle ─────────────────────────────────────────
	function toggleSprache(lang: string) {
		if (selectedSprachen.includes(lang)) {
			selectedSprachen = selectedSprachen.filter((s) => s !== lang);
		} else {
			selectedSprachen = [...selectedSprachen, lang];
		}
	}

	// ── Team members ────────────────────────────────────────────
	function addTeamMember(rolle: string) {
		teamMitglieder = [
			...teamMitglieder,
			{
				id: generateId(),
				auditPlanId: '',
				rolle,
				istExtern: false,
				position: teamMitglieder.filter((m) => m.rolle === rolle).length
			}
		];
	}

	function removeTeamMember(id: string) {
		teamMitglieder = teamMitglieder.filter((m) => m.id !== id);
	}

	function getMembersForRole(rolle: string): AuditPlanTeamMitglied[] {
		return teamMitglieder.filter((m) => m.rolle === rolle);
	}

	// ── Revisionen ──────────────────────────────────────────────
	function addRevision() {
		const nextNum = revisionen.length + 1;
		revisionen = [
			...revisionen,
			{
				id: generateId(),
				auditPlanId: '',
				nummer: `${nextNum}.0`,
				datum: new globalThis.Date().toISOString().split('T')[0],
				beschreibung: '',
				position: revisionen.length
			}
		];
	}

	function removeRevision(idx: number) {
		revisionen = revisionen.filter((_, i) => i !== idx);
	}

	// ── Auditzeiten ─────────────────────────────────────────────
	function addAuditzeitTable() {
		auditzeiten = [...auditzeiten, createEmptyAuditzeit('', auditzeiten.length)];
	}

	function removeAuditzeitTable(idx: number) {
		auditzeiten = auditzeiten.filter((_, i) => i !== idx);
	}

	function addAuditzeitZeile(tableIdx: number) {
		const table = auditzeiten[tableIdx];
		const newZeile = createEmptyAuditzeitZeile(table.id, table.zeilen.length);
		auditzeiten = auditzeiten.map((t, i) => (i === tableIdx ? { ...t, zeilen: [...t.zeilen, newZeile] } : t));
	}

	function removeAuditzeitZeile(tableIdx: number, zeileIdx: number) {
		auditzeiten = auditzeiten.map((t, i) => (i === tableIdx ? { ...t, zeilen: t.zeilen.filter((_: AuditPlanAuditzeitZeile, j: number) => j !== zeileIdx) } : t));
	}

	function updateAuditzeitZeile(tableIdx: number, zeileIdx: number, field: keyof AuditPlanAuditzeitZeile, value: string) {
		auditzeiten = auditzeiten.map((t, i) =>
			i === tableIdx
				? {
						...t,
						zeilen: t.zeilen.map((z: AuditPlanAuditzeitZeile, j: number) => (j === zeileIdx ? { ...z, [field]: value } : z))
					}
				: t
		);
	}
</script>

<div class="space-y-6">
	<!-- Plan Name + ZN + Logo -->
	<Card.Root>
		<Card.Header>
			<Card.Title>{i18n.t('planGenerator.planName')}</Card.Title>
		</Card.Header>
		<Card.Content class="space-y-4">
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div class="space-y-2">
					<label for="plan-name" class="text-sm font-medium">{i18n.t('planGenerator.planName')}</label>
					<Input id="plan-name" bind:value={planName} placeholder={i18n.t('planGenerator.planNamePlaceholder')} />
				</div>
				<div class="space-y-2">
					<label class="text-sm font-medium">{i18n.t('planGenerator.znNumbers')}</label>
					<div class="flex gap-2">
						<Input bind:value={znInput} placeholder={i18n.t('planGenerator.znPlaceholder')} onkeydown={handleZnKeydown} />
						<Button variant="outline" size="sm" onclick={addZn}>
							<Plus class="size-4" />
						</Button>
					</div>
					{#if znNummern.length > 0}
						<div class="flex flex-wrap gap-1.5">
							{#each znNummern as zn}
								<Badge variant="secondary" class="gap-1">
									{zn}
									<button class="hover:text-destructive ml-0.5" onclick={() => removeZn(zn)}>
										<X class="size-3" />
									</button>
								</Badge>
							{/each}
						</div>
					{/if}
				</div>
			</div>

			<!-- Logo -->
			<div class="space-y-2">
				<label class="text-sm font-medium">{i18n.t('planGenerator.logo')}</label>
				{#if logoBase64}
					<div class="flex items-center gap-3">
						<img src="data:image/png;base64,{logoBase64}" alt={logoDateiname ?? 'Logo'} class="h-16 rounded border object-contain" />
						<span class="text-muted-foreground text-sm">{logoDateiname}</span>
						<Button variant="ghost" size="sm" onclick={removeLogo}>
							<Trash2 class="size-4" />
						</Button>
					</div>
				{:else}
					<Button variant="outline" size="sm" onclick={() => logoInput?.click()}>
						<Upload class="mr-1.5 size-4" />
						{i18n.t('planGenerator.uploadLogo')}
					</Button>
				{/if}
				<input bind:this={logoInput} type="file" accept="image/png,image/jpeg,image/svg+xml" class="hidden" onchange={handleLogoUpload} />
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Auftraggeber + Standorte + Geltungsbereich -->
	<Card.Root>
		<Card.Header>
			<Card.Title>{i18n.t('planGenerator.client')}</Card.Title>
		</Card.Header>
		<Card.Content class="space-y-4">
			<div class="space-y-2">
				<label for="auftraggeber" class="text-sm font-medium">{i18n.t('planGenerator.client')}</label>
				<Input
					id="auftraggeber"
					value={grunddaten.auftraggeber ?? ''}
					placeholder={i18n.t('planGenerator.clientPlaceholder')}
					onchange={(e) => {
						grunddaten = { ...grunddaten, auftraggeber: (e.target as HTMLInputElement).value };
					}}
				/>
			</div>

			<div class="space-y-2">
				<div class="flex items-center justify-between">
					<label class="text-sm font-medium">{i18n.t('planGenerator.locations')}</label>
					<Button variant="ghost" size="sm" onclick={addStandort}>
						<Plus class="mr-1 size-4" />
						{i18n.t('planGenerator.addLocation')}
					</Button>
				</div>
				{#each standorte as standort, idx}
					<div class="flex gap-2">
						<Input
							value={standort.name}
							placeholder={i18n.t('planGenerator.locationPlaceholder')}
							onchange={(e) => {
								standorte = standorte.map((s, i) => (i === idx ? { ...s, name: (e.target as HTMLInputElement).value } : s));
							}}
						/>
						{#if standorte.length > 1}
							<Button variant="ghost" size="icon" onclick={() => removeStandort(idx)}>
								<X class="size-4" />
							</Button>
						{/if}
					</div>
				{/each}
			</div>

			<div class="space-y-2">
				<label for="geltungsbereich" class="text-sm font-medium">{i18n.t('planGenerator.scope')}</label>
				<Textarea
					id="geltungsbereich"
					value={grunddaten.geltungsbereich ?? ''}
					placeholder={i18n.t('planGenerator.scopePlaceholder')}
					onchange={(e) => {
						grunddaten = { ...grunddaten, geltungsbereich: (e.target as HTMLInputElement).value };
					}}
				/>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Normgrundlage -->
	<Card.Root>
		<Card.Header>
			<Card.Title>{i18n.t('planGenerator.normBasis')}</Card.Title>
		</Card.Header>
		<Card.Content>
			<div class="flex flex-wrap gap-2">
				{#each ISO_NORMS as norm}
					<Button variant={selectedNorms.includes(norm) ? 'default' : 'outline'} size="sm" onclick={() => toggleNorm(norm)}>
						{norm}
					</Button>
				{/each}
			</div>
			{#if selectedNorms.length > 0}
				<div class="mt-3 flex flex-wrap gap-1.5">
					{#each selectedNorms as norm}
						<Badge variant="secondary" class="gap-1">
							{norm}
							<button class="hover:text-destructive ml-0.5" onclick={() => toggleNorm(norm)}>
								<X class="size-3" />
							</button>
						</Badge>
					{/each}
				</div>
			{/if}
		</Card.Content>
	</Card.Root>

	<!-- Auditart -->
	<Card.Root>
		<Card.Header>
			<Card.Title>{i18n.t('planGenerator.auditType')}</Card.Title>
		</Card.Header>
		<Card.Content>
			<div class="flex flex-wrap gap-2">
				{#each AUDITART_OPTIONS as art}
					<Button variant={selectedAuditarten.includes(art) ? 'default' : 'outline'} size="sm" onclick={() => toggleAuditart(art)}>
						{i18n.t(`auditart.${art}`)}
					</Button>
				{/each}
			</div>
			{#if selectedAuditarten.length > 0}
				<div class="mt-3 flex flex-wrap gap-1.5">
					{#each selectedAuditarten as art}
						<Badge variant="secondary" class="gap-1">
							{i18n.t(`auditart.${art}`)}
							<button class="hover:text-destructive ml-0.5" onclick={() => toggleAuditart(art)}>
								<X class="size-3" />
							</button>
						</Badge>
					{/each}
				</div>
			{/if}
			<div class="mt-3">
				<Input
					value={grunddaten.auditartFreitext ?? ''}
					placeholder={i18n.t('planGenerator.auditTypeCustom')}
					onchange={(e) => {
						grunddaten = { ...grunddaten, auditartFreitext: (e.target as HTMLInputElement).value };
					}}
				/>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Beauftragter + Auditziel -->
	<Card.Root>
		<Card.Header>
			<Card.Title>{i18n.t('planGenerator.auditGoal')}</Card.Title>
		</Card.Header>
		<Card.Content class="space-y-4">
			<div class="space-y-2">
				<label for="beauftragter" class="text-sm font-medium">{i18n.t('planGenerator.commissioner')}</label>
				<Input
					id="beauftragter"
					value={grunddaten.beauftragter ?? ''}
					placeholder={i18n.t('planGenerator.commissionerPlaceholder')}
					onchange={(e) => {
						grunddaten = { ...grunddaten, beauftragter: (e.target as HTMLInputElement).value };
					}}
				/>
			</div>
			<div class="space-y-2">
				<div class="flex items-center justify-between">
					<label for="auditziel" class="text-sm font-medium">{i18n.t('planGenerator.auditGoal')}</label>
					<div class="flex items-center gap-2">
						<Checkbox
							checked={grunddaten.auditzielEditierbar ?? false}
							onCheckedChange={(checked) => {
								grunddaten = { ...grunddaten, auditzielEditierbar: checked === true };
							}}
						/>
						<span class="text-muted-foreground text-xs">{i18n.t('planGenerator.auditGoalEditable')}</span>
					</div>
				</div>
				<Textarea
					id="auditziel"
					value={grunddaten.auditziel ?? i18n.t('planGenerator.auditGoalDefault')}
					disabled={!grunddaten.auditzielEditierbar}
					onchange={(e) => {
						grunddaten = { ...grunddaten, auditziel: (e.target as HTMLInputElement).value };
					}}
					rows={4}
				/>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Auditsprachen -->
	<Card.Root>
		<Card.Header>
			<Card.Title>{i18n.t('planGenerator.auditLanguages')}</Card.Title>
		</Card.Header>
		<Card.Content>
			<div class="flex flex-wrap gap-2">
				{#each AUDIT_LANGUAGES as lang}
					<Button variant={selectedSprachen.includes(lang) ? 'default' : 'outline'} size="sm" onclick={() => toggleSprache(lang)}>
						{i18n.t(`planGenerator.language.${lang}`)}
					</Button>
				{/each}
			</div>
			{#if selectedSprachen.length > 0}
				<div class="mt-3 flex flex-wrap gap-1.5">
					{#each selectedSprachen as lang}
						<Badge variant="secondary" class="gap-1">
							{i18n.t(`planGenerator.language.${lang}`)}
							<button class="hover:text-destructive ml-0.5" onclick={() => toggleSprache(lang)}>
								<X class="size-3" />
							</button>
						</Badge>
					{/each}
				</div>
			{/if}
		</Card.Content>
	</Card.Root>

	<!-- Audit-Team -->
	<Card.Root>
		<Card.Header>
			<Card.Title>{i18n.t('planGenerator.team')}</Card.Title>
		</Card.Header>
		<Card.Content class="space-y-4">
			{#each AUDIT_PLAN_TEAM_ROLES as rolle}
				<div class="space-y-2">
					<div class="flex items-center justify-between">
						<label class="text-sm font-medium">{i18n.t(`planGenerator.teamRole.${rolle}`)}</label>
						<Button variant="ghost" size="sm" onclick={() => addTeamMember(rolle)}>
							<Plus class="mr-1 size-4" />
							{i18n.t('planGenerator.addTeamMember')}
						</Button>
					</div>
					{#each getMembersForRole(rolle) as member}
						<div class="flex items-center gap-2">
							<Input
								value={member.externalName ?? ''}
								placeholder={i18n.t('planGenerator.teamMemberName')}
								class="flex-1"
								onchange={(e) => {
									teamMitglieder = teamMitglieder.map((m) => (m.id === member.id ? { ...m, externalName: (e.target as HTMLInputElement).value } : m));
								}}
							/>
							<div class="flex items-center gap-1.5">
								<Checkbox
									checked={member.istExtern ?? false}
									onCheckedChange={(checked) => {
										teamMitglieder = teamMitglieder.map((m) => (m.id === member.id ? { ...m, istExtern: checked === true } : m));
									}}
								/>
								<span class="text-muted-foreground text-xs">{i18n.t('planGenerator.teamMemberExternal')}</span>
							</div>
							{#if member.istExtern}
								<Input
									value={member.externalCompany ?? ''}
									placeholder={i18n.t('planGenerator.teamMemberCompany')}
									class="w-40"
									onchange={(e) => {
										teamMitglieder = teamMitglieder.map((m) => (m.id === member.id ? { ...m, externalCompany: (e.target as HTMLInputElement).value } : m));
									}}
								/>
							{/if}
							<Button variant="ghost" size="icon" onclick={() => removeTeamMember(member.id)}>
								<X class="size-4" />
							</Button>
						</div>
					{/each}
				</div>
				{#if rolle !== AUDIT_PLAN_TEAM_ROLES[AUDIT_PLAN_TEAM_ROLES.length - 1]}
					<div class="border-border border-t"></div>
				{/if}
			{/each}
		</Card.Content>
	</Card.Root>

	<!-- Betriebsorganisation -->
	<Card.Root>
		<Card.Header>
			<Card.Title>{i18n.t('planGenerator.operations')}</Card.Title>
		</Card.Header>
		<Card.Content class="space-y-4">
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div class="space-y-2">
					<label class="text-sm font-medium">{i18n.t('planGenerator.shiftSystem')}</label>
					<Select.Root
						type="single"
						value={grunddaten.schichtsystem ?? ''}
						onValueChange={(val) => {
							grunddaten = { ...grunddaten, schichtsystem: val };
						}}
					>
						<Select.Trigger class="w-full">
							{grunddaten.schichtsystem ? i18n.t(`planGenerator.shiftSystem_${grunddaten.schichtsystem}`) : i18n.t('planGenerator.shiftSystem')}
						</Select.Trigger>
						<Select.Content>
							{#each SHIFT_SYSTEMS as sys}
								<Select.Item value={sys} label={i18n.t(`planGenerator.shiftSystem_${sys}`)}>
									{i18n.t(`planGenerator.shiftSystem_${sys}`)}
								</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
					{#if grunddaten.schichtsystem === 'other'}
						<Input
							value={grunddaten.schichtsystemFreitext ?? ''}
							placeholder={i18n.t('planGenerator.shiftSystem_other')}
							onchange={(e) => {
								grunddaten = { ...grunddaten, schichtsystemFreitext: (e.target as HTMLInputElement).value };
							}}
						/>
					{/if}
				</div>
				<div class="space-y-2">
					<label for="schichtuebergaben" class="text-sm font-medium">{i18n.t('planGenerator.shiftHandover')}</label>
					<Input
						id="schichtuebergaben"
						value={grunddaten.schichtuebergaben ?? ''}
						placeholder={i18n.t('planGenerator.shiftHandoverPlaceholder')}
						onchange={(e) => {
							grunddaten = { ...grunddaten, schichtuebergaben: (e.target as HTMLInputElement).value };
						}}
					/>
				</div>
			</div>
			<div class="space-y-2">
				<label for="bemerkung-betrieb" class="text-sm font-medium">{i18n.t('planGenerator.operationsNote')}</label>
				<Textarea
					id="bemerkung-betrieb"
					value={grunddaten.bemerkungBetrieb ?? ''}
					placeholder={i18n.t('planGenerator.operationsNotePlaceholder')}
					onchange={(e) => {
						grunddaten = { ...grunddaten, bemerkungBetrieb: (e.target as HTMLInputElement).value };
					}}
				/>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Auditmethode -->
	<Card.Root>
		<Card.Header>
			<Card.Title>{i18n.t('planGenerator.method')}</Card.Title>
		</Card.Header>
		<Card.Content class="space-y-4">
			<div class="flex gap-2">
				{#each AUDIT_METHODS as method}
					<Button
						variant={grunddaten.auditmethode === method ? 'default' : 'outline'}
						size="sm"
						onclick={() => {
							grunddaten = { ...grunddaten, auditmethode: method };
						}}
					>
						{i18n.t(`planGenerator.method_${method}`)}
					</Button>
				{/each}
			</div>
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div class="space-y-2">
					<label for="ikt-technik" class="text-sm font-medium">{i18n.t('planGenerator.ictTechnology')}</label>
					<Input
						id="ikt-technik"
						value={grunddaten.iktTechnik ?? ''}
						placeholder={i18n.t('planGenerator.ictTechnologyPlaceholder')}
						onchange={(e) => {
							grunddaten = { ...grunddaten, iktTechnik: (e.target as HTMLInputElement).value };
						}}
					/>
				</div>
				<div class="space-y-2">
					<label for="ikt-testdatum" class="text-sm font-medium">{i18n.t('planGenerator.ictTestDate')}</label>
					<Input
						id="ikt-testdatum"
						type="date"
						value={grunddaten.iktTestdatum ?? ''}
						onchange={(e) => {
							grunddaten = { ...grunddaten, iktTestdatum: (e.target as HTMLInputElement).value };
						}}
					/>
				</div>
			</div>
			<div class="flex items-center gap-2">
				<Checkbox
					checked={grunddaten.testLetztesAudit ?? false}
					onCheckedChange={(checked) => {
						grunddaten = { ...grunddaten, testLetztesAudit: checked === true };
					}}
				/>
				<span class="text-sm">{i18n.t('planGenerator.ictTestedLastAudit')}</span>
			</div>
			<div class="space-y-2">
				<label for="gastgeber" class="text-sm font-medium">{i18n.t('planGenerator.host')}</label>
				<Input
					id="gastgeber"
					value={grunddaten.gastgeber ?? ''}
					placeholder={i18n.t('planGenerator.hostPlaceholder')}
					onchange={(e) => {
						grunddaten = { ...grunddaten, gastgeber: (e.target as HTMLInputElement).value };
					}}
				/>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Revisionen -->
	<Card.Root>
		<Card.Header>
			<div class="flex items-center justify-between">
				<Card.Title>{i18n.t('planGenerator.revisions')}</Card.Title>
				<Button variant="ghost" size="sm" onclick={addRevision}>
					<Plus class="mr-1 size-4" />
					{i18n.t('planGenerator.addRevision')}
				</Button>
			</div>
		</Card.Header>
		<Card.Content class="space-y-3">
			{#each revisionen as rev, idx}
				<div class="bg-muted/50 flex items-start gap-3 rounded-lg p-3">
					<div class="text-muted-foreground w-12 pt-2 text-sm font-medium">{rev.nummer}</div>
					<div class="flex-1 space-y-2">
						<Input
							type="date"
							value={rev.datum ?? ''}
							onchange={(e) => {
								revisionen = revisionen.map((r, i) => (i === idx ? { ...r, datum: (e.target as HTMLInputElement).value } : r));
							}}
						/>
						<Textarea
							value={rev.beschreibung ?? ''}
							placeholder={i18n.t('planGenerator.revisionDescription')}
							rows={2}
							onchange={(e) => {
								revisionen = revisionen.map((r, i) => (i === idx ? { ...r, beschreibung: (e.target as HTMLInputElement).value } : r));
							}}
						/>
					</div>
					<Button variant="ghost" size="icon" onclick={() => removeRevision(idx)}>
						<Trash2 class="size-4" />
					</Button>
				</div>
			{/each}
			{#if revisionen.length > 0}
				<div class="border-border border-t pt-3">
					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div class="space-y-2">
							<label class="text-sm font-medium">{i18n.t('planGenerator.revisionLocationDate')}</label>
							<Input
								value={grunddaten.revisionOrtDatum ?? ''}
								onchange={(e) => {
									grunddaten = { ...grunddaten, revisionOrtDatum: (e.target as HTMLInputElement).value };
								}}
							/>
						</div>
					</div>
					<div class="mt-3 space-y-2">
						<label class="text-sm font-medium">{i18n.t('planGenerator.revisionChangeDuringAudit')}</label>
						<Textarea
							value={grunddaten.revisionAenderungWaehrendAudit ?? ''}
							rows={2}
							onchange={(e) => {
								grunddaten = {
									...grunddaten,
									revisionAenderungWaehrendAudit: (e.target as HTMLInputElement).value
								};
							}}
						/>
					</div>
					<div class="mt-3 space-y-2">
						<label class="text-sm font-medium">{i18n.t('planGenerator.revisionComments')}</label>
						<Textarea
							value={grunddaten.revisionKommentare ?? ''}
							rows={2}
							onchange={(e) => {
								grunddaten = {
									...grunddaten,
									revisionKommentare: (e.target as HTMLInputElement).value
								};
							}}
						/>
					</div>
				</div>
			{/if}
		</Card.Content>
	</Card.Root>

	<!-- Auditzeiten-Übersicht -->
	<Card.Root>
		<Card.Header>
			<div class="flex items-center justify-between">
				<Card.Title>{i18n.t('planGenerator.auditTimes')}</Card.Title>
				<Button variant="ghost" size="sm" onclick={addAuditzeitTable}>
					<Plus class="mr-1 size-4" />
					{i18n.t('planGenerator.addAuditTimeTable')}
				</Button>
			</div>
		</Card.Header>
		<Card.Content class="space-y-4">
			{#each auditzeiten as table, tableIdx}
				<div class="bg-muted/30 rounded-lg border p-4">
					<div class="mb-3 flex items-center gap-3">
						<div class="flex-1 space-y-1">
							<div class="grid grid-cols-2 gap-2">
								<Input
									value={table.auditor}
									placeholder={i18n.t('planGenerator.auditTimeAuditor')}
									onchange={(e) => {
										auditzeiten = auditzeiten.map((t, i) => (i === tableIdx ? { ...t, auditor: (e.target as HTMLInputElement).value } : t));
									}}
								/>
								<Input
									value={table.standort}
									placeholder={i18n.t('planGenerator.auditTimeLocation')}
									onchange={(e) => {
										auditzeiten = auditzeiten.map((t, i) => (i === tableIdx ? { ...t, standort: (e.target as HTMLInputElement).value } : t));
									}}
								/>
							</div>
						</div>
						<Button variant="ghost" size="icon" onclick={() => removeAuditzeitTable(tableIdx)}>
							<Trash2 class="size-4" />
						</Button>
					</div>

					<!-- Zeilen table -->
					<div class="overflow-x-auto">
						<table class="w-full text-sm">
							<thead>
								<tr class="text-muted-foreground border-b text-left">
									<th class="pr-2 pb-2">{i18n.t('planGenerator.auditTimeStart')}</th>
									<th class="pr-2 pb-2">{i18n.t('planGenerator.auditTimeEnd')}</th>
									<th class="pr-2 pb-2">{i18n.t('planGenerator.auditTimeActivity')}</th>
									<th class="pr-2 pb-2 text-right">{i18n.t('planGenerator.auditTimeHours')}</th>
									<th class="pb-2"></th>
								</tr>
							</thead>
							<tbody>
								{#each table.zeilen as zeile, zeileIdx}
									<tr class="border-b last:border-0">
										<td class="py-1.5 pr-2">
											<Input
												type="time"
												value={zeile.startzeit}
												class="w-24"
												onchange={(e) => updateAuditzeitZeile(tableIdx, zeileIdx, 'startzeit', (e.target as HTMLInputElement).value)}
											/>
										</td>
										<td class="py-1.5 pr-2">
											<Input
												type="time"
												value={zeile.endzeit}
												class="w-24"
												onchange={(e) => updateAuditzeitZeile(tableIdx, zeileIdx, 'endzeit', (e.target as HTMLInputElement).value)}
											/>
										</td>
										<td class="py-1.5 pr-2">
											<Input value={zeile.aktivitaet} onchange={(e) => updateAuditzeitZeile(tableIdx, zeileIdx, 'aktivitaet', (e.target as HTMLInputElement).value)} />
										</td>
										<td class="py-1.5 pr-2 text-right font-mono">
											{calculateHours(zeile.startzeit, zeile.endzeit).toFixed(1)}
										</td>
										<td class="py-1.5">
											<Button variant="ghost" size="icon" onclick={() => removeAuditzeitZeile(tableIdx, zeileIdx)}>
												<X class="size-3" />
											</Button>
										</td>
									</tr>
								{/each}
							</tbody>
							<tfoot>
								<tr class="border-t font-medium">
									<td colspan="3" class="pt-2">{i18n.t('planGenerator.auditTimeTotal')}</td>
									<td class="pt-2 text-right font-mono">{calculateTotalHours(table.zeilen).toFixed(1)}</td>
									<td></td>
								</tr>
							</tfoot>
						</table>
					</div>
					<Button variant="ghost" size="sm" class="mt-2" onclick={() => addAuditzeitZeile(tableIdx)}>
						<Plus class="mr-1 size-4" />
						{i18n.t('planGenerator.addAuditTimeRow')}
					</Button>
				</div>
			{/each}
		</Card.Content>
	</Card.Root>

	<!-- Hinweise und Verteiler -->
	<Card.Root>
		<Card.Header>
			<Card.Title>{i18n.t('planGenerator.hints')}</Card.Title>
		</Card.Header>
		<Card.Content class="space-y-4">
			<div class="bg-muted/50 text-muted-foreground rounded-lg p-3 text-sm">
				{grunddaten.hinweiseInfoText ?? i18n.t('planGenerator.hintsInfo')}
			</div>
			<div class="space-y-2">
				<label for="verteiler" class="text-sm font-medium">{i18n.t('planGenerator.distribution')}</label>
				<Textarea
					id="verteiler"
					value={grunddaten.verteiler ?? ''}
					placeholder={i18n.t('planGenerator.distributionPlaceholder')}
					rows={3}
					onchange={(e) => {
						grunddaten = { ...grunddaten, verteiler: (e.target as HTMLInputElement).value };
					}}
				/>
			</div>
			<div class="flex flex-wrap gap-4">
				<div class="flex items-center gap-2">
					<Checkbox
						checked={grunddaten.verteilungAuditteam ?? true}
						onCheckedChange={(checked) => {
							grunddaten = { ...grunddaten, verteilungAuditteam: checked === true };
						}}
					/>
					<span class="text-sm">{i18n.t('planGenerator.distAuditTeam')}</span>
				</div>
				<div class="flex items-center gap-2">
					<Checkbox
						checked={grunddaten.verteilungGeschaeftsfuehrung ?? true}
						onCheckedChange={(checked) => {
							grunddaten = { ...grunddaten, verteilungGeschaeftsfuehrung: checked === true };
						}}
					/>
					<span class="text-sm">{i18n.t('planGenerator.distManagement')}</span>
				</div>
				<div class="flex items-center gap-2">
					<Checkbox
						checked={grunddaten.verteilungFachabteilungen ?? false}
						onCheckedChange={(checked) => {
							grunddaten = { ...grunddaten, verteilungFachabteilungen: checked === true };
						}}
					/>
					<span class="text-sm">{i18n.t('planGenerator.distDepartments')}</span>
				</div>
				<div class="flex items-center gap-2">
					<Checkbox
						checked={grunddaten.verteilungExtern ?? false}
						onCheckedChange={(checked) => {
							grunddaten = { ...grunddaten, verteilungExtern: checked === true };
						}}
					/>
					<span class="text-sm">{i18n.t('planGenerator.distExternal')}</span>
				</div>
			</div>
		</Card.Content>
	</Card.Root>
</div>
