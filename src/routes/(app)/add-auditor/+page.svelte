<script lang="ts">
	import { getContext } from 'svelte';
	import type { I18nRune } from '$lib/i18n/i18n.svelte';
	import { superForm } from 'sveltekit-superforms';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import { auditorAvailability } from '$lib/types/auditor';

	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Button } from '$lib/components/ui/button';
	import { Checkbox } from '$lib/components/ui/checkbox';

	const i18n = getContext<I18nRune>('i18n');

	let { data } = $props();

	const editId = $derived(page.url.searchParams.get('edit'));
	const isEdit = $derived(editId !== null);

	const { form, errors, enhance, reset } = superForm(data.form, {
		onUpdated({ form: f }) {
			if (f.message === 'success') {
				toast.success(i18n.t('auditor.save_success'));
				goto('/auditor-management');
			}
		},
		onError() {
			toast.error(i18n.t('common.no_data'));
		}
	});

	const availabilityOptions = auditorAvailability.map((v) => ({
		value: v,
		label: i18n.t(`auditor.availability_${v}`)
	}));

	// Helper to get first error message from a superforms error field
	function firstError(errs: unknown): string | undefined {
		if (Array.isArray(errs)) return errs[0];
		return undefined;
	}
</script>

<div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
	<!-- Page header -->
	<div class="mb-8">
		<h1 class="text-2xl font-bold" style="font-family: var(--font-display)">
			{isEdit ? i18n.t('auditor.edit_title') : i18n.t('auditor.add_title')}
		</h1>
		<p class="text-muted-foreground mt-1 text-sm">
			{i18n.t('nav.auditor_management')}
		</p>
	</div>

	<form method="POST" use:enhance class="space-y-6">
		<!-- ── Section 1: Personal Data ──────────────────────────── -->
		<Card.Root>
			<Card.Header class="border-b-brand border-b pb-4">
				<Card.Title style="font-family: var(--font-display)">
					{i18n.t('auditor.section_personal')}
				</Card.Title>
			</Card.Header>
			<Card.Content class="pt-6">
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<!-- Name (required) -->
					<div class="flex flex-col gap-1.5">
						<Label for="name">
							{i18n.t('auditor.field_name')}
							<span class="text-destructive ml-0.5">*</span>
						</Label>
						<Input id="name" name="name" type="text" bind:value={$form.name} aria-invalid={$errors.name ? true : undefined} />
						{#if firstError($errors.name)}
							<p class="text-destructive text-xs">{firstError($errors.name)}</p>
						{/if}
					</div>

					<!-- Title -->
					<div class="flex flex-col gap-1.5">
						<Label for="title">{i18n.t('auditor.field_title')}</Label>
						<Input id="title" name="title" type="text" bind:value={$form.title} />
					</div>

					<!-- Email (required) -->
					<div class="flex flex-col gap-1.5">
						<Label for="email">
							{i18n.t('auditor.field_email')}
							<span class="text-destructive ml-0.5">*</span>
						</Label>
						<Input id="email" name="email" type="email" bind:value={$form.email} aria-invalid={$errors.email ? true : undefined} />
						{#if firstError($errors.email)}
							<p class="text-destructive text-xs">{firstError($errors.email)}</p>
						{/if}
					</div>

					<!-- Company -->
					<div class="flex flex-col gap-1.5">
						<Label for="company">{i18n.t('auditor.field_company')}</Label>
						<Input id="company" name="company" type="text" bind:value={$form.company} />
					</div>

					<!-- Phone -->
					<div class="flex flex-col gap-1.5">
						<Label for="phone">{i18n.t('auditor.field_phone')}</Label>
						<Input id="phone" name="phone" type="tel" bind:value={$form.phone} />
					</div>

					<!-- Mobile -->
					<div class="flex flex-col gap-1.5">
						<Label for="mobile">{i18n.t('auditor.field_mobile')}</Label>
						<Input id="mobile" name="mobile" type="tel" bind:value={$form.mobile} />
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- ── Section 2: Address ────────────────────────────────── -->
		<Card.Root>
			<Card.Header class="border-b-brand border-b pb-4">
				<Card.Title style="font-family: var(--font-display)">
					{i18n.t('auditor.section_address')}
				</Card.Title>
			</Card.Header>
			<Card.Content class="pt-6">
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<!-- Street (full width) -->
					<div class="flex flex-col gap-1.5 md:col-span-2">
						<Label for="street">{i18n.t('auditor.field_street')}</Label>
						<Input id="street" name="street" type="text" bind:value={$form.street} />
					</div>

					<!-- ZIP -->
					<div class="flex flex-col gap-1.5">
						<Label for="zipCode">{i18n.t('auditor.field_zip')}</Label>
						<Input id="zipCode" name="zipCode" type="text" bind:value={$form.zipCode} />
					</div>

					<!-- City -->
					<div class="flex flex-col gap-1.5">
						<Label for="city">{i18n.t('auditor.field_city')}</Label>
						<Input id="city" name="city" type="text" bind:value={$form.city} />
					</div>

					<!-- Country -->
					<div class="flex flex-col gap-1.5 md:col-span-2">
						<Label for="country">{i18n.t('auditor.field_country')}</Label>
						<Input
							id="country"
							name="country"
							type="text"
							value={$form.country ?? 'Deutschland'}
							oninput={(e) => {
								$form.country = (e.currentTarget as HTMLInputElement).value;
							}}
						/>
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- ── Section 3: Qualifications ────────────────────────── -->
		<Card.Root>
			<Card.Header class="border-b-brand border-b pb-4">
				<Card.Title style="font-family: var(--font-display)">
					{i18n.t('auditor.section_qualifications')}
				</Card.Title>
			</Card.Header>
			<Card.Content class="pt-6">
				<div class="space-y-6">
					<!-- ISO checkboxes -->
					<div>
						<p class="mb-3 text-sm font-medium">ISO-Normen</p>
						<div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
							<label class="flex cursor-pointer items-center gap-2">
								<Checkbox name="iso9001" bind:checked={$form.iso9001} />
								<span class="text-sm font-medium">ISO 9001</span>
							</label>
							<label class="flex cursor-pointer items-center gap-2">
								<Checkbox name="iso14001" bind:checked={$form.iso14001} />
								<span class="text-sm font-medium">ISO 14001</span>
							</label>
							<label class="flex cursor-pointer items-center gap-2">
								<Checkbox name="iso45001" bind:checked={$form.iso45001} />
								<span class="text-sm font-medium">ISO 45001</span>
							</label>
							<label class="flex cursor-pointer items-center gap-2">
								<Checkbox name="iso50001" bind:checked={$form.iso50001} />
								<span class="text-sm font-medium">ISO 50001</span>
							</label>
							<label class="flex cursor-pointer items-center gap-2">
								<Checkbox name="iso27001" bind:checked={$form.iso27001} />
								<span class="text-sm font-medium">ISO 27001</span>
							</label>
						</div>
					</div>

					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						<!-- Certifications -->
						<div class="flex flex-col gap-1.5">
							<Label for="certifications">{i18n.t('auditor.field_certifications')}</Label>
							<Textarea id="certifications" name="certifications" rows={3} bind:value={$form.certifications} />
						</div>

						<!-- Languages -->
						<div class="flex flex-col gap-1.5">
							<Label for="languages">{i18n.t('auditor.field_languages')}</Label>
							<Input id="languages" name="languages" type="text" bind:value={$form.languages} />
						</div>

						<!-- Experience years -->
						<div class="flex flex-col gap-1.5">
							<Label for="experienceYears">{i18n.t('auditor.field_experience')}</Label>
							<input
								id="experienceYears"
								name="experienceYears"
								type="number"
								min="0"
								bind:value={$form.experienceYears}
								class="border-input dark:bg-input/30 focus-visible:border-ring focus-visible:ring-ring/50 placeholder:text-muted-foreground h-8 w-full min-w-0 rounded-lg border bg-transparent px-2.5 py-1 text-base transition-colors outline-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
							/>
						</div>

						<!-- Daily rate -->
						<div class="flex flex-col gap-1.5">
							<Label for="dailyRate">{i18n.t('auditor.field_daily_rate')}</Label>
							<input
								id="dailyRate"
								name="dailyRate"
								type="number"
								min="0"
								step="50"
								bind:value={$form.dailyRate}
								class="border-input dark:bg-input/30 focus-visible:border-ring focus-visible:ring-ring/50 placeholder:text-muted-foreground h-8 w-full min-w-0 rounded-lg border bg-transparent px-2.5 py-1 text-base transition-colors outline-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
							/>
						</div>
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- ── Section 4: Availability ───────────────────────────── -->
		<Card.Root>
			<Card.Header class="border-b-brand border-b pb-4">
				<Card.Title style="font-family: var(--font-display)">
					{i18n.t('auditor.section_availability')}
				</Card.Title>
			</Card.Header>
			<Card.Content class="pt-6">
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div class="flex flex-col gap-1.5">
						<Label for="availability">{i18n.t('auditor.field_availability')}</Label>
						<select
							id="availability"
							name="availability"
							bind:value={$form.availability}
							class="border-input bg-background focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
						>
							<option value="">{i18n.t('auditor.field_availability')}</option>
							{#each availabilityOptions as opt (opt.value)}
								<option value={opt.value}>{opt.label}</option>
							{/each}
						</select>
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- ── Section 5: Notes ─────────────────────────────────── -->
		<Card.Root>
			<Card.Header class="border-b-brand border-b pb-4">
				<Card.Title style="font-family: var(--font-display)">
					{i18n.t('auditor.section_notes')}
				</Card.Title>
			</Card.Header>
			<Card.Content class="pt-6">
				<div class="flex flex-col gap-1.5">
					<Label for="notes">{i18n.t('common.notes')}</Label>
					<Textarea id="notes" name="notes" rows={5} placeholder={i18n.t('auditor.field_notes')} bind:value={$form.notes} />
				</div>
			</Card.Content>
		</Card.Root>

		<!-- ── Actions ───────────────────────────────────────────── -->
		<div class="flex justify-end gap-3">
			<Button
				type="button"
				variant="outline"
				onclick={() => {
					reset();
				}}
			>
				{i18n.t('auditor.reset')}
			</Button>
			<Button type="submit">
				{i18n.t('common.save')}
			</Button>
		</div>
	</form>
</div>
