<script lang="ts">
	import { getContext } from 'svelte';
	import type { I18nRune } from '$lib/i18n/i18n.svelte';
	import { page } from '$app/state';
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { auditorSchema } from '$lib/types/auditor';
	import { toast } from 'svelte-sonner';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import * as Select from '$lib/components/ui/select';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Button } from '$lib/components/ui/button';

	const i18n = getContext<I18nRune>('i18n');

	let { data } = $props();

	const isEdit = $derived(page.url.searchParams.get('edit') !== null);

	const { form, errors, enhance, reset } = superForm(data.form, {
		validators: zod4Client(auditorSchema),
		onUpdated({ form }) {
			if (form.message) {
				toast.success(form.message);
			}
		}
	});
</script>

<h1 class="mb-6 text-2xl font-bold" style="font-family: var(--font-display)">
	{isEdit ? i18n.t('auditor.editTitle') : i18n.t('auditor.addTitle')}
</h1>

<form method="POST" use:enhance class="space-y-6">
	<!-- Section 1: Personal Data -->
	<Card.Root>
		<Card.Header>
			<Card.Title>{i18n.t('auditor.personalData')}</Card.Title>
		</Card.Header>
		<Card.Content>
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div class="space-y-2">
					<Label for="name">{i18n.t('auditor.name')} *</Label>
					<Input id="name" name="name" bind:value={$form.name} />
					{#if $errors.name}
						<p class="text-destructive text-sm">{$errors.name}</p>
					{/if}
				</div>
				<div class="space-y-2">
					<Label for="title">{i18n.t('auditor.title')}</Label>
					<Input id="title" name="title" bind:value={$form.title} />
					{#if $errors.title}
						<p class="text-destructive text-sm">{$errors.title}</p>
					{/if}
				</div>
				<div class="space-y-2">
					<Label for="email">{i18n.t('auditor.email')} *</Label>
					<Input id="email" name="email" type="email" bind:value={$form.email} />
					{#if $errors.email}
						<p class="text-destructive text-sm">{$errors.email}</p>
					{/if}
				</div>
				<div class="space-y-2">
					<Label for="phone">{i18n.t('auditor.phone')}</Label>
					<Input id="phone" name="phone" type="tel" bind:value={$form.phone} />
					{#if $errors.phone}
						<p class="text-destructive text-sm">{$errors.phone}</p>
					{/if}
				</div>
				<div class="space-y-2">
					<Label for="mobile">{i18n.t('auditor.mobile')}</Label>
					<Input id="mobile" name="mobile" type="tel" bind:value={$form.mobile} />
					{#if $errors.mobile}
						<p class="text-destructive text-sm">{$errors.mobile}</p>
					{/if}
				</div>
				<div class="space-y-2">
					<Label for="company">{i18n.t('auditor.company')}</Label>
					<Input id="company" name="company" bind:value={$form.company} />
					{#if $errors.company}
						<p class="text-destructive text-sm">{$errors.company}</p>
					{/if}
				</div>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Section 2: Address -->
	<Card.Root>
		<Card.Header>
			<Card.Title>{i18n.t('auditor.address')}</Card.Title>
		</Card.Header>
		<Card.Content>
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div class="space-y-2 md:col-span-2">
					<Label for="street">{i18n.t('auditor.street')}</Label>
					<Input id="street" name="street" bind:value={$form.street} />
					{#if $errors.street}
						<p class="text-destructive text-sm">{$errors.street}</p>
					{/if}
				</div>
				<div class="space-y-2">
					<Label for="zipCode">{i18n.t('auditor.zipCode')}</Label>
					<Input id="zipCode" name="zipCode" bind:value={$form.zipCode} />
					{#if $errors.zipCode}
						<p class="text-destructive text-sm">{$errors.zipCode}</p>
					{/if}
				</div>
				<div class="space-y-2">
					<Label for="city">{i18n.t('auditor.city')}</Label>
					<Input id="city" name="city" bind:value={$form.city} />
					{#if $errors.city}
						<p class="text-destructive text-sm">{$errors.city}</p>
					{/if}
				</div>
				<div class="space-y-2">
					<Label for="country">{i18n.t('auditor.country')}</Label>
					<Input id="country" name="country" bind:value={$form.country} />
					{#if $errors.country}
						<p class="text-destructive text-sm">{$errors.country}</p>
					{/if}
				</div>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Section 3: Qualifications -->
	<Card.Root>
		<Card.Header>
			<Card.Title>{i18n.t('auditor.qualifications')}</Card.Title>
		</Card.Header>
		<Card.Content>
			<div class="space-y-4">
				<div>
					<Label class="mb-3 block">{i18n.t('auditor.isoStandards')}</Label>
					<div class="flex flex-wrap gap-4">
						<label class="flex items-center gap-2">
							<Checkbox bind:checked={$form.iso9001} name="iso9001" />
							<span class="text-sm">ISO 9001</span>
						</label>
						<label class="flex items-center gap-2">
							<Checkbox bind:checked={$form.iso14001} name="iso14001" />
							<span class="text-sm">ISO 14001</span>
						</label>
						<label class="flex items-center gap-2">
							<Checkbox bind:checked={$form.iso45001} name="iso45001" />
							<span class="text-sm">ISO 45001</span>
						</label>
						<label class="flex items-center gap-2">
							<Checkbox bind:checked={$form.iso50001} name="iso50001" />
							<span class="text-sm">ISO 50001</span>
						</label>
						<label class="flex items-center gap-2">
							<Checkbox bind:checked={$form.iso27001} name="iso27001" />
							<span class="text-sm">ISO 27001</span>
						</label>
					</div>
				</div>
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div class="space-y-2 md:col-span-2">
						<Label for="certifications">{i18n.t('auditor.certifications')}</Label>
						<Textarea id="certifications" name="certifications" bind:value={$form.certifications} rows={3} />
						{#if $errors.certifications}
							<p class="text-destructive text-sm">{$errors.certifications}</p>
						{/if}
					</div>
					<div class="space-y-2">
						<Label for="languages">{i18n.t('auditor.languages')}</Label>
						<Input id="languages" name="languages" bind:value={$form.languages} />
						{#if $errors.languages}
							<p class="text-destructive text-sm">{$errors.languages}</p>
						{/if}
					</div>
					<div class="space-y-2">
						<Label for="experienceYears">{i18n.t('auditor.experienceYears')}</Label>
						<Input id="experienceYears" name="experienceYears" type="number" min={0} bind:value={$form.experienceYears} />
						{#if $errors.experienceYears}
							<p class="text-destructive text-sm">{$errors.experienceYears}</p>
						{/if}
					</div>
				</div>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Section 4: Availability -->
	<Card.Root>
		<Card.Header>
			<Card.Title>{i18n.t('auditor.availability')}</Card.Title>
		</Card.Header>
		<Card.Content>
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div class="space-y-2">
					<Label for="dailyRate">{i18n.t('auditor.dailyRate')}</Label>
					<Input id="dailyRate" name="dailyRate" type="number" min={0} step={50} bind:value={$form.dailyRate} />
					{#if $errors.dailyRate}
						<p class="text-destructive text-sm">{$errors.dailyRate}</p>
					{/if}
				</div>
				<div class="space-y-2">
					<Label>{i18n.t('auditor.availabilityStatus')}</Label>
					<Select.Root type="single" name="availability" bind:value={$form.availability}>
						<Select.Trigger class="w-full">
							{$form.availability ? i18n.t(`auditor.${$form.availability}`) : i18n.t('auditor.selectAvailability')}
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="full_time">{i18n.t('auditor.full_time')}</Select.Item>
							<Select.Item value="part_time">{i18n.t('auditor.part_time')}</Select.Item>
							<Select.Item value="by_arrangement">{i18n.t('auditor.by_arrangement')}</Select.Item>
							<Select.Item value="limited">{i18n.t('auditor.limited')}</Select.Item>
						</Select.Content>
					</Select.Root>
					{#if $errors.availability}
						<p class="text-destructive text-sm">{$errors.availability}</p>
					{/if}
				</div>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Section 5: Notes -->
	<Card.Root>
		<Card.Header>
			<Card.Title>{i18n.t('auditor.notes')}</Card.Title>
		</Card.Header>
		<Card.Content>
			<div class="space-y-2">
				<Textarea id="notes" name="notes" bind:value={$form.notes} rows={4} />
				{#if $errors.notes}
					<p class="text-destructive text-sm">{$errors.notes}</p>
				{/if}
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Form Actions -->
	<div class="flex gap-3">
		<Button type="submit">{i18n.t('common.save')}</Button>
		<Button type="button" variant="outline" onclick={() => reset()}>
			{i18n.t('common.reset')}
		</Button>
	</div>
</form>
