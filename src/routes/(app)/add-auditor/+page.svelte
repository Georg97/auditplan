<script lang="ts">
	import { getContext } from 'svelte';
	import { goto } from '$app/navigation';
	import { superForm } from 'sveltekit-superforms';
	import type { I18nRune } from '$lib/i18n/i18n.svelte';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import * as Select from '$lib/components/ui/select';
	import { toast } from 'svelte-sonner';
	import Save from '@lucide/svelte/icons/save';
	import RotateCcw from '@lucide/svelte/icons/rotate-ccw';

	const i18n = getContext<I18nRune>('i18n');

	let { data } = $props();

	const sf = superForm(data.form, {
		resetForm: false,
		onResult({ result }) {
			if (result.type === 'success') {
				toast.success(i18n.t('auditor.saveSuccess'));
				// eslint-disable-next-line svelte/no-navigation-without-resolve -- static path, no params
				goto('/auditor-management');
			}
		}
	});

	const { form, errors, enhance, reset } = sf;

	const isEditMode = !!data.editId;

	const ISO_CHECKS = [
		{ field: 'iso9001' as const, labelKey: 'auditor.iso9001', accent: 'text-[#667eea]' },
		{ field: 'iso14001' as const, labelKey: 'auditor.iso14001', accent: 'text-[#38a169]' },
		{ field: 'iso45001' as const, labelKey: 'auditor.iso45001', accent: 'text-[#dd6b20]' },
		{ field: 'iso50001' as const, labelKey: 'auditor.iso50001', accent: 'text-[#3182ce]' },
		{ field: 'iso27001' as const, labelKey: 'auditor.iso27001', accent: 'text-[#e53e3e]' }
	] as const;

	const AVAILABILITY_OPTIONS = [
		{ value: 'full_time', labelKey: 'auditor.availabilityOptions.full_time' },
		{ value: 'part_time', labelKey: 'auditor.availabilityOptions.part_time' },
		{ value: 'by_arrangement', labelKey: 'auditor.availabilityOptions.by_arrangement' },
		{ value: 'limited', labelKey: 'auditor.availabilityOptions.limited' }
	];

	let availabilityValue = $derived($form.availability ?? undefined);
	function onAvailabilityChange(val: string | undefined) {
		$form.availability = (val as typeof $form.availability) ?? null;
	}
</script>

<div class="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
	<h1 class="text-foreground mb-8 text-2xl font-bold" style="font-family: var(--font-display)">
		{isEditMode ? i18n.t('auditor.editTitle') : i18n.t('auditor.addTitle')}
	</h1>

	<form method="POST" use:enhance class="space-y-6">
		<!-- Section 1: Personal Data -->
		<section class="bg-card rounded-xl border p-6 shadow-sm">
			<h2 class="text-foreground border-brand mb-5 border-b-2 pb-2 text-lg font-semibold" style="font-family: var(--font-display)">
				{i18n.t('auditor.personalData')}
			</h2>
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				<div class="space-y-1.5">
					<Label for="firstName">{i18n.t('auditor.firstName')} *</Label>
					<Input
						id="firstName"
						name="firstName"
						bind:value={$form.firstName}
						placeholder={i18n.t('auditor.placeholders.firstName')}
						aria-invalid={$errors.firstName ? 'true' : undefined}
					/>
					{#if $errors.firstName}<p class="text-destructive text-xs">{$errors.firstName}</p>{/if}
				</div>
				<div class="space-y-1.5">
					<Label for="lastName">{i18n.t('auditor.lastName')} *</Label>
					<Input
						id="lastName"
						name="lastName"
						bind:value={$form.lastName}
						placeholder={i18n.t('auditor.placeholders.lastName')}
						aria-invalid={$errors.lastName ? 'true' : undefined}
					/>
					{#if $errors.lastName}<p class="text-destructive text-xs">{$errors.lastName}</p>{/if}
				</div>
				<div class="space-y-1.5">
					<Label for="email">{i18n.t('common.email')} *</Label>
					<Input
						id="email"
						name="email"
						type="email"
						bind:value={$form.email}
						placeholder={i18n.t('auditor.placeholders.email')}
						aria-invalid={$errors.email ? 'true' : undefined}
					/>
					{#if $errors.email}<p class="text-destructive text-xs">{$errors.email}</p>{/if}
				</div>
				<div class="space-y-1.5">
					<Label for="role">{i18n.t('auditor.role')}</Label>
					<Input id="role" name="role" bind:value={$form.role} placeholder={i18n.t('auditor.placeholders.role')} />
				</div>
				<div class="space-y-1.5">
					<Label for="phone">{i18n.t('common.phone')}</Label>
					<Input id="phone" name="phone" type="tel" bind:value={$form.phone} placeholder={i18n.t('auditor.placeholders.phone')} />
				</div>
				<div class="space-y-1.5">
					<Label for="mobile">{i18n.t('auditor.mobile')}</Label>
					<Input id="mobile" name="mobile" type="tel" bind:value={$form.mobile} placeholder={i18n.t('auditor.placeholders.mobile')} />
				</div>
				<div class="space-y-1.5 sm:col-span-2 lg:col-span-3">
					<Label for="company">{i18n.t('auditor.company')}</Label>
					<Input id="company" name="company" bind:value={$form.company} placeholder={i18n.t('auditor.placeholders.company')} />
				</div>
			</div>
		</section>

		<!-- Section 2: Address -->
		<section class="bg-card rounded-xl border p-6 shadow-sm">
			<h2 class="text-foreground border-brand mb-5 border-b-2 pb-2 text-lg font-semibold" style="font-family: var(--font-display)">
				{i18n.t('auditor.address')}
			</h2>
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<div class="space-y-1.5 sm:col-span-2 lg:col-span-4">
					<Label for="street">{i18n.t('auditor.street')}</Label>
					<Input id="street" name="street" bind:value={$form.street} placeholder={i18n.t('auditor.placeholders.street')} />
				</div>
				<div class="space-y-1.5">
					<Label for="zip">{i18n.t('auditor.zip')}</Label>
					<Input id="zip" name="zip" bind:value={$form.zip} placeholder={i18n.t('auditor.placeholders.zip')} />
				</div>
				<div class="space-y-1.5">
					<Label for="city">{i18n.t('auditor.city')}</Label>
					<Input id="city" name="city" bind:value={$form.city} placeholder={i18n.t('auditor.placeholders.city')} />
				</div>
				<div class="space-y-1.5 sm:col-span-2">
					<Label for="country">{i18n.t('auditor.country')}</Label>
					<Input id="country" name="country" bind:value={$form.country} placeholder={i18n.t('auditor.placeholders.country')} />
				</div>
			</div>
		</section>

		<!-- Section 3: Qualifications -->
		<section class="bg-card rounded-xl border p-6 shadow-sm">
			<h2 class="text-foreground border-brand mb-5 border-b-2 pb-2 text-lg font-semibold" style="font-family: var(--font-display)">
				{i18n.t('auditor.qualifications')}
			</h2>

			<!-- ISO Checkboxes -->
			<div class="mb-6 flex flex-wrap gap-x-6 gap-y-3">
				{#each ISO_CHECKS as check (check.field)}
					<label class="flex items-center gap-2.5 text-sm">
						<Checkbox bind:checked={$form[check.field]} name={check.field} />
						<span class="{check.accent} font-medium">{i18n.t(check.labelKey)}</span>
					</label>
				{/each}
			</div>

			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				<div class="space-y-1.5 sm:col-span-2">
					<Label for="certifications">{i18n.t('auditor.certifications')}</Label>
					<Textarea id="certifications" name="certifications" bind:value={$form.certifications} placeholder={i18n.t('auditor.placeholders.certifications')} rows={3} />
				</div>
				<div class="space-y-1.5">
					<Label for="languages">{i18n.t('auditor.languages')}</Label>
					<Input id="languages" name="languages" bind:value={$form.languages} placeholder={i18n.t('auditor.placeholders.languages')} />
				</div>
				<div class="space-y-1.5">
					<Label for="experienceYears">{i18n.t('auditor.experienceYears')}</Label>
					<Input id="experienceYears" name="experienceYears" type="number" min="0" max="50" bind:value={$form.experienceYears} />
				</div>
			</div>
		</section>

		<!-- Section 4: Availability -->
		<section class="bg-card rounded-xl border p-6 shadow-sm">
			<h2 class="text-foreground border-brand mb-5 border-b-2 pb-2 text-lg font-semibold" style="font-family: var(--font-display)">
				{i18n.t('auditor.availability')}
			</h2>
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<div class="space-y-1.5">
					<Label for="dailyRate">{i18n.t('auditor.dailyRate')}</Label>
					<Input id="dailyRate" name="dailyRate" type="number" min="0" step="50" bind:value={$form.dailyRate} />
				</div>
				<div class="space-y-1.5">
					<Label>{i18n.t('auditor.availabilityType')}</Label>
					<Select.Root type="single" value={availabilityValue} onValueChange={onAvailabilityChange} name="availability">
						<Select.Trigger class="w-full">
							{#if availabilityValue}
								{i18n.t(`auditor.availabilityOptions.${availabilityValue}`)}
							{:else}
								<span class="text-muted-foreground">—</span>
							{/if}
						</Select.Trigger>
						<Select.Content>
							{#each AVAILABILITY_OPTIONS as opt (opt.value)}
								<Select.Item value={opt.value}>{i18n.t(opt.labelKey)}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
					<input type="hidden" name="availability" value={$form.availability ?? ''} />
				</div>
			</div>
		</section>

		<!-- Section 5: Notes -->
		<section class="bg-card rounded-xl border p-6 shadow-sm">
			<h2 class="text-foreground border-brand mb-5 border-b-2 pb-2 text-lg font-semibold" style="font-family: var(--font-display)">
				{i18n.t('auditor.notesSection')}
			</h2>
			<Textarea id="notes" name="notes" bind:value={$form.notes} placeholder={i18n.t('auditor.placeholders.notes')} rows={5} />
		</section>

		<!-- Action Buttons -->
		<div class="flex items-center gap-3 pt-2">
			<Button type="submit" class="gap-2">
				<Save class="h-4 w-4" />
				{i18n.t('common.save')}
			</Button>
			<Button type="button" variant="outline" class="gap-2" onclick={() => reset()}>
				<RotateCcw class="h-4 w-4" />
				{i18n.t('auditor.reset')}
			</Button>
		</div>
	</form>
</div>
