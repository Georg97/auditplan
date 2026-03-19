<script lang="ts">
	import { getContext } from 'svelte';
	import { goto } from '$app/navigation';
	import { superForm, type SuperValidated } from 'sveltekit-superforms';
	import type { I18nRune } from '$lib/i18n/i18n.svelte';
	import type { AuditCreate } from '$lib/types';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import * as Select from '$lib/components/ui/select';
	import * as Accordion from '$lib/components/ui/accordion';
	import { toast } from 'svelte-sonner';
	import Save from '@lucide/svelte/icons/save';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import X from '@lucide/svelte/icons/x';

	interface Props {
		formData: SuperValidated<AuditCreate>;
		editId: string | null;
	}

	let { formData, editId }: Props = $props();
	const i18n = getContext<I18nRune>('i18n');

	const sf = superForm(formData, {
		resetForm: false,
		onResult({ result }) {
			if (result.type === 'success') {
				toast.success(i18n.t('audit.saveSuccess'));
				goto('/search-manage');
			}
		}
	});

	const { form, errors, enhance } = sf;
	const isEditMode = !!editId;

	const AUDIT_TYPES = [
		{ value: 'internal', labelKey: 'audit.type.internal' },
		{ value: 'external', labelKey: 'audit.type.external' },
		{ value: 'certification', labelKey: 'audit.type.certification' },
		{ value: 'surveillance', labelKey: 'audit.type.surveillance' },
		{ value: 'recertification', labelKey: 'audit.type.recertification' }
	];

	const FORMAT_OPTIONS = [
		{ value: 'on_site', labelKey: 'audit.format.on_site' },
		{ value: 'remote', labelKey: 'audit.format.remote' },
		{ value: 'hybrid', labelKey: 'audit.format.hybrid' }
	];

	const ISO_NORMS = [
		{ id: 'iso9001', label: 'ISO 9001 – Qualitätsmanagement', color: 'text-[#667eea]' },
		{ id: 'iso14001', label: 'ISO 14001 – Umweltmanagement', color: 'text-[#38a169]' },
		{ id: 'iso45001', label: 'ISO 45001 – Arbeitsschutz', color: 'text-[#dd6b20]' },
		{ id: 'iso50001', label: 'ISO 50001 – Energiemanagement', color: 'text-[#3182ce]' },
		{ id: 'iso27001', label: 'ISO 27001 – Informationssicherheit', color: 'text-[#e53e3e]' }
	];

	function parseNorms(): Record<string, boolean> {
		try {
			const arr = JSON.parse($form.norms ?? '[]') as string[];
			return Object.fromEntries(ISO_NORMS.map((n) => [n.id, arr.includes(n.id)]));
		} catch {
			return Object.fromEntries(ISO_NORMS.map((n) => [n.id, false]));
		}
	}

	let checkedNorms = $state<Record<string, boolean>>(parseNorms());

	function toggleNorm(normId: string, checked: boolean) {
		checkedNorms[normId] = checked;
		const selected = Object.entries(checkedNorms)
			.filter(([, v]) => v)
			.map(([k]) => k);
		$form.norms = JSON.stringify(selected);
	}

	let auditTypeValue = $derived($form.auditType ?? undefined);
	function onAuditTypeChange(val: string | undefined) {
		$form.auditType = (val ?? 'internal') as typeof $form.auditType;
	}

	let formatValue = $derived(($form.format as string | null | undefined) ?? undefined);
	function onFormatChange(val: string | undefined) {
		$form.format = (val as typeof $form.format) ?? null;
	}
</script>

<div class="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
	<div class="mb-8">
		<a href="/search-manage" class="text-muted-foreground hover:text-foreground mb-3 inline-flex items-center gap-1.5 text-sm transition-colors">
			<ArrowLeft class="h-4 w-4" />
			{i18n.t('common.back')}
		</a>
		<h1 class="text-foreground text-2xl font-bold" style="font-family: var(--font-display)">
			{isEditMode ? i18n.t('audit.editTitle') : i18n.t('audit.addTitle')}
		</h1>
	</div>

	<form method="POST" use:enhance>
		<Accordion.Root type="multiple" value={['basic', 'scheduling', 'organization', 'norms', 'personnel', 'notes']} class="space-y-4">
			<!-- Section 1: Basic Info -->
			<Accordion.Item value="basic" class="bg-card rounded-xl border shadow-sm">
				<Accordion.Trigger class="px-6 py-4 text-lg font-semibold" style="font-family: var(--font-display)">
					{i18n.t('audit.sections.basicInfo')}
				</Accordion.Trigger>
				<Accordion.Content class="px-6 pb-6">
					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div class="space-y-1.5 sm:col-span-2">
							<Label for="auditName">{i18n.t('audit.fields.auditName')} *</Label>
							<Input
								id="auditName"
								name="auditName"
								bind:value={$form.auditName}
								placeholder={i18n.t('audit.placeholders.auditName')}
								aria-invalid={$errors.auditName ? 'true' : undefined}
							/>
							{#if $errors.auditName}<p class="text-destructive text-xs">{$errors.auditName}</p>{/if}
						</div>
						<div class="space-y-1.5">
							<Label>{i18n.t('audit.fields.auditType')} *</Label>
							<Select.Root type="single" value={auditTypeValue} onValueChange={onAuditTypeChange} name="auditType">
								<Select.Trigger class="w-full">
									{#if auditTypeValue}
										{i18n.t(`audit.type.${auditTypeValue}`)}
									{:else}
										<span class="text-muted-foreground">—</span>
									{/if}
								</Select.Trigger>
								<Select.Content>
									{#each AUDIT_TYPES as opt (opt.value)}
										<Select.Item value={opt.value}>{i18n.t(opt.labelKey)}</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
							<input type="hidden" name="auditType" value={$form.auditType ?? ''} />
							{#if $errors.auditType}<p class="text-destructive text-xs">{$errors.auditType}</p>{/if}
						</div>
					</div>
				</Accordion.Content>
			</Accordion.Item>

			<!-- Section 2: Scheduling -->
			<Accordion.Item value="scheduling" class="bg-card rounded-xl border shadow-sm">
				<Accordion.Trigger class="px-6 py-4 text-lg font-semibold" style="font-family: var(--font-display)">
					{i18n.t('audit.sections.scheduling')}
				</Accordion.Trigger>
				<Accordion.Content class="px-6 pb-6">
					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
						<div class="space-y-1.5">
							<Label for="startDate">{i18n.t('audit.fields.startDate')} *</Label>
							<Input id="startDate" name="startDate" type="date" bind:value={$form.startDate} aria-invalid={$errors.startDate ? 'true' : undefined} />
							{#if $errors.startDate}<p class="text-destructive text-xs">{$errors.startDate}</p>{/if}
						</div>
						<div class="space-y-1.5">
							<Label for="endDate">{i18n.t('audit.fields.endDate')}</Label>
							<Input id="endDate" name="endDate" type="date" bind:value={$form.endDate} />
						</div>
						<div class="space-y-1.5">
							<Label for="startTime">{i18n.t('audit.fields.startTime')}</Label>
							<Input id="startTime" name="startTime" type="time" bind:value={$form.startTime} />
						</div>
						<div class="space-y-1.5">
							<Label for="endTime">{i18n.t('audit.fields.endTime')}</Label>
							<Input id="endTime" name="endTime" type="time" bind:value={$form.endTime} />
						</div>
					</div>
				</Accordion.Content>
			</Accordion.Item>

			<!-- Section 3: Organization & Location -->
			<Accordion.Item value="organization" class="bg-card rounded-xl border shadow-sm">
				<Accordion.Trigger class="px-6 py-4 text-lg font-semibold" style="font-family: var(--font-display)">
					{i18n.t('audit.sections.organization')}
				</Accordion.Trigger>
				<Accordion.Content class="px-6 pb-6">
					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div class="space-y-1.5">
							<Label for="company">{i18n.t('audit.fields.company')} *</Label>
							<Input
								id="company"
								name="company"
								bind:value={$form.company}
								placeholder={i18n.t('audit.placeholders.company')}
								aria-invalid={$errors.company ? 'true' : undefined}
							/>
							{#if $errors.company}<p class="text-destructive text-xs">{$errors.company}</p>{/if}
						</div>
						<div class="space-y-1.5">
							<Label for="department">{i18n.t('audit.fields.department')} *</Label>
							<Input
								id="department"
								name="department"
								bind:value={$form.department}
								placeholder={i18n.t('audit.placeholders.department')}
								aria-invalid={$errors.department ? 'true' : undefined}
							/>
							{#if $errors.department}<p class="text-destructive text-xs">{$errors.department}</p>{/if}
						</div>
						<div class="space-y-1.5">
							<Label for="location">{i18n.t('audit.fields.location')}</Label>
							<Input id="location" name="location" bind:value={$form.location} placeholder={i18n.t('audit.placeholders.location')} />
						</div>
						<div class="space-y-1.5">
							<Label>{i18n.t('audit.fields.format')}</Label>
							<Select.Root type="single" value={formatValue} onValueChange={onFormatChange} name="format">
								<Select.Trigger class="w-full">
									{#if formatValue}
										{i18n.t(`audit.format.${formatValue}`)}
									{:else}
										<span class="text-muted-foreground">—</span>
									{/if}
								</Select.Trigger>
								<Select.Content>
									{#each FORMAT_OPTIONS as opt (opt.value)}
										<Select.Item value={opt.value}>{i18n.t(opt.labelKey)}</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
							<input type="hidden" name="format" value={$form.format ?? ''} />
						</div>
					</div>
				</Accordion.Content>
			</Accordion.Item>

			<!-- Section 4: Norms & Scope -->
			<Accordion.Item value="norms" class="bg-card rounded-xl border shadow-sm">
				<Accordion.Trigger class="px-6 py-4 text-lg font-semibold" style="font-family: var(--font-display)">
					{i18n.t('audit.sections.norms')}
				</Accordion.Trigger>
				<Accordion.Content class="px-6 pb-6">
					<div class="mb-5 flex flex-wrap gap-x-6 gap-y-3">
						{#each ISO_NORMS as norm (norm.id)}
							<label class="flex items-center gap-2.5 text-sm">
								<Checkbox checked={checkedNorms[norm.id] ?? false} onCheckedChange={(checked) => toggleNorm(norm.id, !!checked)} />
								<span class="{norm.color} font-medium">{norm.label}</span>
							</label>
						{/each}
					</div>
					<input type="hidden" name="norms" value={$form.norms ?? '[]'} />
					<div class="space-y-1.5">
						<Label for="scope">{i18n.t('audit.fields.scope')}</Label>
						<Textarea id="scope" name="scope" bind:value={$form.scope} placeholder={i18n.t('audit.placeholders.scope')} rows={4} />
					</div>
				</Accordion.Content>
			</Accordion.Item>

			<!-- Section 5: Personnel -->
			<Accordion.Item value="personnel" class="bg-card rounded-xl border shadow-sm">
				<Accordion.Trigger class="px-6 py-4 text-lg font-semibold" style="font-family: var(--font-display)">
					{i18n.t('audit.sections.personnel')}
				</Accordion.Trigger>
				<Accordion.Content class="px-6 pb-6">
					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div class="space-y-1.5 sm:col-span-2">
							<Label for="leadAuditorId">{i18n.t('audit.fields.leadAuditor')} *</Label>
							<Input id="leadAuditorId" name="leadAuditorId" bind:value={$form.leadAuditorId} placeholder="Auditor-ID" aria-invalid={$errors.leadAuditorId ? 'true' : undefined} />
							{#if $errors.leadAuditorId}<p class="text-destructive text-xs">{$errors.leadAuditorId}</p>{/if}
							<p class="text-muted-foreground text-xs">Wird in V04 durch Auditor-Dropdown ersetzt</p>
						</div>
						<div class="space-y-1.5 sm:col-span-2">
							<Label for="auditTeam">{i18n.t('audit.fields.auditTeam')}</Label>
							<Textarea id="auditTeam" name="auditTeam" bind:value={$form.auditTeam} placeholder={i18n.t('audit.placeholders.auditTeam')} rows={3} />
						</div>
						<div class="space-y-1.5">
							<Label for="contactPerson">{i18n.t('audit.fields.contactPerson')}</Label>
							<Input id="contactPerson" name="contactPerson" bind:value={$form.contactPerson} placeholder={i18n.t('audit.placeholders.contactPerson')} />
						</div>
						<div class="space-y-1.5">
							<Label for="contactEmail">{i18n.t('audit.fields.contactEmail')}</Label>
							<Input
								id="contactEmail"
								name="contactEmail"
								type="email"
								bind:value={$form.contactEmail}
								placeholder={i18n.t('audit.placeholders.contactEmail')}
								aria-invalid={$errors.contactEmail ? 'true' : undefined}
							/>
							{#if $errors.contactEmail}<p class="text-destructive text-xs">{$errors.contactEmail}</p>{/if}
						</div>
					</div>
				</Accordion.Content>
			</Accordion.Item>

			<!-- Section 6: Notes & Documents -->
			<Accordion.Item value="notes" class="bg-card rounded-xl border shadow-sm">
				<Accordion.Trigger class="px-6 py-4 text-lg font-semibold" style="font-family: var(--font-display)">
					{i18n.t('audit.sections.notesDocuments')}
				</Accordion.Trigger>
				<Accordion.Content class="px-6 pb-6">
					<div class="space-y-4">
						<div class="space-y-1.5">
							<Label for="notes">{i18n.t('common.notes')}</Label>
							<Textarea id="notes" name="notes" bind:value={$form.notes} placeholder={i18n.t('audit.placeholders.notes')} rows={6} />
						</div>
						<div class="space-y-1.5">
							<Label for="documentLinks">{i18n.t('audit.fields.documentLinks')}</Label>
							<Textarea id="documentLinks" name="documentLinks" bind:value={$form.documentLinks} placeholder={i18n.t('audit.placeholders.documentLinks')} rows={4} />
						</div>
					</div>
				</Accordion.Content>
			</Accordion.Item>
		</Accordion.Root>

		<!-- Action Buttons -->
		<div class="mt-6 flex items-center gap-3">
			<Button type="submit" class="gap-2">
				<Save class="h-4 w-4" />
				{i18n.t('common.save')}
			</Button>
			<Button type="button" variant="outline" class="gap-2" href="/search-manage">
				<X class="h-4 w-4" />
				{i18n.t('common.cancel')}
			</Button>
		</div>
	</form>
</div>
