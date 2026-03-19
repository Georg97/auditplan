<script lang="ts">
	import { getContext } from 'svelte';
	import type { I18nRune } from '$lib/i18n/i18n.svelte';
	import type { CalendarEntry, CalendarEntryCreate, CalendarView } from '$lib/types';
	import { getCalendarEntries, addCalendarEntry, updateCalendarEntry, deleteCalendarEntry } from '$lib/rpc/calendar.remote';
	import { getAuditors } from '$lib/rpc/auditors.remote';
	import type { Auditor } from '$lib/types';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import * as Select from '$lib/components/ui/select';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { toast } from 'svelte-sonner';
	import { SvelteDate } from 'svelte/reactivity';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import Plus from '@lucide/svelte/icons/plus';
	import Trash2 from '@lucide/svelte/icons/trash-2';

	const i18n = getContext<I18nRune>('i18n');

	const WEEKDAYS = [
		'calendar.weekdays.mo',
		'calendar.weekdays.tu',
		'calendar.weekdays.we',
		'calendar.weekdays.th',
		'calendar.weekdays.fr',
		'calendar.weekdays.sa',
		'calendar.weekdays.su'
	];
	const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 07:00 - 20:00

	let view = $state<CalendarView>('month');
	let currentDate = new SvelteDate();
	let entries = $state<CalendarEntry[]>([]);
	let auditors = $state<Auditor[]>([]);
	let loading = $state(true);

	// Modal state
	let modalOpen = $state(false);
	let deleteDialogOpen = $state(false);
	let editingEntry = $state<CalendarEntry | null>(null);
	let formData = $state<CalendarEntryCreate>({
		title: '',
		date: '',
		startTime: null,
		endTime: null,
		company: null,
		auditorId: null,
		description: null,
		allDay: false,
		auditId: null,
		color: null
	});

	// Date helpers
	function toIso(d: Date): string {
		return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
	}

	function todayIso(): string {
		return toIso(new Date());
	}

	function getMonthDays(date: Date): { iso: string; day: number; currentMonth: boolean; today: boolean }[] {
		const y = date.getFullYear();
		const m = date.getMonth();
		const firstDay = new Date(y, m, 1);
		const lastDay = new Date(y, m + 1, 0);

		// Monday = 0 in our system
		let startOffset = (firstDay.getDay() + 6) % 7;
		const days: { iso: string; day: number; currentMonth: boolean; today: boolean }[] = [];
		const tod = todayIso();

		// Previous month days
		for (let i = startOffset - 1; i >= 0; i--) {
			const d = new Date(y, m, -i);
			days.push({ iso: toIso(d), day: d.getDate(), currentMonth: false, today: toIso(d) === tod });
		}

		// Current month days
		for (let d = 1; d <= lastDay.getDate(); d++) {
			const dt = new Date(y, m, d);
			days.push({ iso: toIso(dt), day: d, currentMonth: true, today: toIso(dt) === tod });
		}

		// Fill remaining to complete 6 rows (42 cells)
		const remaining = 42 - days.length;
		for (let i = 1; i <= remaining; i++) {
			const d = new Date(y, m + 1, i);
			days.push({ iso: toIso(d), day: d.getDate(), currentMonth: false, today: toIso(d) === tod });
		}

		return days;
	}

	function getWeekDays(date: Date): { iso: string; label: string; dayNum: number; today: boolean }[] {
		const d = new Date(date);
		const dayOfWeek = (d.getDay() + 6) % 7; // Mon = 0
		d.setDate(d.getDate() - dayOfWeek);
		const tod = todayIso();
		const result: { iso: string; label: string; dayNum: number; today: boolean }[] = [];
		for (let i = 0; i < 7; i++) {
			const day = new Date(d);
			day.setDate(d.getDate() + i);
			result.push({
				iso: toIso(day),
				label: i18n.t(WEEKDAYS[i]),
				dayNum: day.getDate(),
				today: toIso(day) === tod
			});
		}
		return result;
	}

	let monthDays = $derived(getMonthDays(currentDate));
	let weekDays = $derived(getWeekDays(currentDate));

	function entriesForDate(date: string): CalendarEntry[] {
		return entries.filter((e) => e.date === date);
	}

	function entriesForDateHour(date: string, hour: number): CalendarEntry[] {
		return entries.filter((e) => {
			if (e.date !== date) return false;
			if (!e.startTime) return hour === 7;
			const h = parseInt(e.startTime.split(':')[0]);
			return h === hour;
		});
	}

	// Period label
	let periodLabel = $derived.by(() => {
		const y = currentDate.getFullYear();
		const m = currentDate.toLocaleString('de-DE', { month: 'long' });
		if (view === 'month') return `${m} ${y}`;
		if (view === 'week') {
			const wd = getWeekDays(currentDate);
			return `${wd[0].dayNum}.${currentDate.getMonth() + 1}. – ${wd[6].dayNum}.${currentDate.getMonth() + 1}.${y}`;
		}
		return currentDate.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
	});

	// Navigation
	function navigate(direction: -1 | 1) {
		const d = new Date(currentDate.getTime());
		if (view === 'month') d.setMonth(d.getMonth() + direction);
		else if (view === 'week') d.setDate(d.getDate() + direction * 7);
		else d.setDate(d.getDate() + direction);
		currentDate.setTime(d.getTime());
	}

	function goToday() {
		currentDate.setTime(Date.now());
	}

	// Data loading
	function getDateRange(): { start: string; end: string } {
		const d = new Date(currentDate);
		if (view === 'month') {
			const start = new Date(d.getFullYear(), d.getMonth(), -6);
			const end = new Date(d.getFullYear(), d.getMonth() + 1, 7);
			return { start: toIso(start), end: toIso(end) };
		} else if (view === 'week') {
			const dayOfWeek = (d.getDay() + 6) % 7;
			const start = new Date(d);
			start.setDate(d.getDate() - dayOfWeek);
			const end = new Date(start);
			end.setDate(start.getDate() + 6);
			return { start: toIso(start), end: toIso(end) };
		} else {
			return { start: toIso(d), end: toIso(d) };
		}
	}

	async function loadEntries() {
		loading = true;
		try {
			const range = getDateRange();
			entries = await getCalendarEntries(range);
		} catch {
			entries = [];
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		// Re-run on view or currentDate change
		void view;
		void currentDate;
		loadEntries();
	});

	$effect(() => {
		getAuditors()
			.then((a) => (auditors = a))
			.catch(() => (auditors = []));
	});

	// Modal actions
	function openNewEntry(date: string, startTime?: string) {
		editingEntry = null;
		formData = {
			title: '',
			date,
			startTime: startTime ?? null,
			endTime: null,
			company: null,
			auditorId: null,
			description: null,
			allDay: false,
			auditId: null,
			color: null
		};
		modalOpen = true;
	}

	function openEditEntry(entry: CalendarEntry) {
		editingEntry = entry;
		formData = {
			title: entry.title,
			date: entry.date,
			startTime: entry.startTime ?? null,
			endTime: entry.endTime ?? null,
			company: entry.company ?? null,
			auditorId: entry.auditorId ?? null,
			description: entry.description ?? null,
			allDay: entry.allDay ?? false,
			auditId: entry.auditId ?? null,
			color: entry.color ?? null
		};
		modalOpen = true;
	}

	async function handleSave() {
		if (!formData.title || !formData.date) return;
		try {
			if (editingEntry) {
				const updated = await updateCalendarEntry({ id: editingEntry.id, data: formData });
				entries = entries.map((e) => (e.id === updated.id ? updated : e));
			} else {
				const created = await addCalendarEntry(formData);
				entries = [...entries, created];
			}
			toast.success(i18n.t('calendar.saveSuccess'));
			modalOpen = false;
		} catch {
			toast.error('Fehler beim Speichern');
		}
	}

	function confirmDeleteEntry() {
		deleteDialogOpen = true;
	}

	async function handleDelete() {
		if (!editingEntry) return;
		try {
			await deleteCalendarEntry(editingEntry.id);
			entries = entries.filter((e) => e.id !== editingEntry!.id);
			toast.success(i18n.t('calendar.deleteSuccess'));
			deleteDialogOpen = false;
			modalOpen = false;
		} catch {
			toast.error('Fehler beim Löschen');
		}
	}

	let auditorSelectValue = $derived(formData.auditorId ?? undefined);
	function onAuditorChange(val: string | undefined) {
		formData.auditorId = val ?? null;
	}
</script>

<div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
	<!-- Navigation Bar -->
	<div class="animate-fade-up mb-6 flex flex-wrap items-center justify-between gap-3">
		<div class="flex items-center gap-2">
			<Button variant="outline" size="icon" onclick={() => navigate(-1)}>
				<ChevronLeft class="h-4 w-4" />
			</Button>
			<h1 class="text-foreground min-w-[200px] text-center text-xl font-bold" style="font-family: var(--font-display)">
				{periodLabel}
			</h1>
			<Button variant="outline" size="icon" onclick={() => navigate(1)}>
				<ChevronRight class="h-4 w-4" />
			</Button>
		</div>

		<div class="flex items-center gap-2">
			<Button variant="outline" size="sm" onclick={goToday}>
				{i18n.t('calendar.today')}
			</Button>

			<div class="bg-muted flex rounded-lg p-0.5">
				{#each ['month', 'week', 'day'] as const as v (v)}
					<button
						onclick={() => (view = v)}
						class="rounded-md px-3 py-1.5 text-xs font-medium transition-all
							{view === v ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}"
					>
						{i18n.t(`calendar.${v}`)}
					</button>
				{/each}
			</div>

			<Button size="sm" class="gap-1.5" onclick={() => openNewEntry(toIso(currentDate))}>
				<Plus class="h-4 w-4" />
				{i18n.t('calendar.addEntry')}
			</Button>
		</div>
	</div>

	{#if loading}
		<Skeleton class="h-[600px] w-full rounded-xl" />
	{:else}
		<!-- Month View -->
		{#if view === 'month'}
			<div class="animate-fade-up overflow-hidden rounded-xl border">
				<!-- Weekday headers -->
				<div class="bg-muted grid grid-cols-7 border-b">
					{#each WEEKDAYS as wd (wd)}
						<div class="text-muted-foreground py-2.5 text-center text-xs font-semibold tracking-wider uppercase">
							{i18n.t(wd)}
						</div>
					{/each}
				</div>

				<!-- Day cells -->
				<div class="grid grid-cols-7">
					{#each monthDays as day (day.iso)}
						{@const dayEntries = entriesForDate(day.iso)}
						{@const hasEntries = dayEntries.length > 0}
						<button
							onclick={() => openNewEntry(day.iso)}
							class="bg-card hover:bg-muted/50 group relative min-h-[90px] border-r border-b p-1.5 text-left transition-colors last:border-r-0
								{!day.currentMonth ? 'opacity-40' : ''}
								{hasEntries ? 'bg-blue-50/60 dark:bg-blue-950/20' : ''}"
							style={hasEntries ? 'border-left: 3px solid oklch(0.55 0.12 230)' : ''}
						>
							<!-- Day number -->
							<span
								class="inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium
									{day.today ? 'bg-primary text-primary-foreground font-bold' : 'text-foreground'}"
							>
								{day.day}
							</span>

							<!-- Entry badges -->
							{#if dayEntries.length > 0}
								<div class="mt-0.5 space-y-0.5">
									{#each dayEntries.slice(0, 2) as entry (entry.id)}
										<button
											onclick={(e: MouseEvent) => {
												e.stopPropagation();
												openEditEntry(entry);
											}}
											class="bg-brand/10 text-brand hover:bg-brand/20 block w-full truncate rounded px-1.5 py-0.5 text-left text-[0.65rem] font-medium transition-colors"
										>
											{entry.title}
										</button>
									{/each}
									{#if dayEntries.length > 2}
										<span class="text-muted-foreground block text-[0.6rem]">+{dayEntries.length - 2}</span>
									{/if}
								</div>
							{/if}
						</button>
					{/each}
				</div>
			</div>

			<!-- Week View -->
		{:else if view === 'week'}
			<div class="animate-fade-up overflow-hidden rounded-xl border">
				<!-- Header row with day names -->
				<div class="bg-muted grid grid-cols-8 border-b">
					<div class="border-r p-2"></div>
					{#each weekDays as wd (wd.iso)}
						<div class="border-r p-2 text-center last:border-r-0">
							<p class="text-muted-foreground text-xs font-medium">{wd.label}</p>
							<p class="mt-0.5 text-sm font-bold {wd.today ? 'text-primary' : 'text-foreground'}">{wd.dayNum}</p>
						</div>
					{/each}
				</div>

				<!-- Hour slots -->
				<div class="max-h-[600px] overflow-y-auto">
					{#each HOURS as hour (hour)}
						<div class="grid grid-cols-8 border-b last:border-b-0">
							<div class="text-muted-foreground border-r p-2 text-right text-xs">
								{String(hour).padStart(2, '0')}:00
							</div>
							{#each weekDays as wd (wd.iso)}
								{@const slotEntries = entriesForDateHour(wd.iso, hour)}
								<button
									onclick={() => openNewEntry(wd.iso, `${String(hour).padStart(2, '0')}:00`)}
									class="hover:bg-muted/50 min-h-[48px] border-r p-1 transition-colors last:border-r-0"
								>
									{#each slotEntries as entry (entry.id)}
										<button
											onclick={(e: MouseEvent) => {
												e.stopPropagation();
												openEditEntry(entry);
											}}
											class="bg-brand/15 text-brand border-brand/30 mb-0.5 w-full truncate rounded border-l-2 px-1.5 py-0.5 text-left text-[0.65rem] font-medium transition-colors hover:bg-blue-100 dark:hover:bg-blue-900/40"
										>
											{entry.title}
										</button>
									{/each}
								</button>
							{/each}
						</div>
					{/each}
				</div>
			</div>

			<!-- Day View -->
		{:else}
			{@const dayIso = toIso(currentDate)}
			<div class="animate-fade-up overflow-hidden rounded-xl border">
				<div class="max-h-[700px] overflow-y-auto">
					{#each HOURS as hour (hour)}
						{@const slotEntries = entriesForDateHour(dayIso, hour)}
						<div class="flex border-b last:border-b-0">
							<div class="text-muted-foreground w-20 shrink-0 border-r p-3 text-right text-sm">
								{String(hour).padStart(2, '0')}:00
							</div>
							<button onclick={() => openNewEntry(dayIso, `${String(hour).padStart(2, '0')}:00`)} class="hover:bg-muted/50 min-h-[56px] flex-1 p-2 transition-colors">
								{#each slotEntries as entry (entry.id)}
									<button
										onclick={(e: MouseEvent) => {
											e.stopPropagation();
											openEditEntry(entry);
										}}
										class="bg-brand/10 border-brand/30 hover:bg-brand/20 mb-1 w-full rounded-lg border-l-3 p-3 text-left transition-colors"
									>
										<p class="text-foreground text-sm font-semibold">{entry.title}</p>
										<div class="text-muted-foreground mt-1 flex items-center gap-3 text-xs">
											{#if entry.startTime}
												<span
													>{entry.startTime}{#if entry.endTime}
														– {entry.endTime}{/if}</span
												>
											{/if}
											{#if entry.company}
												<span>{entry.company}</span>
											{/if}
										</div>
										{#if entry.description}
											<p class="text-muted-foreground mt-1 line-clamp-2 text-xs">{entry.description}</p>
										{/if}
									</button>
								{/each}
							</button>
						</div>
					{/each}
				</div>
			</div>
		{/if}
	{/if}
</div>

<!-- Entry Modal -->
<Dialog.Root bind:open={modalOpen}>
	<Dialog.Content class="sm:max-w-lg">
		<Dialog.Header>
			<Dialog.Title style="font-family: var(--font-display)">
				{editingEntry ? i18n.t('calendar.editEntry') : i18n.t('calendar.addEntry')}
			</Dialog.Title>
		</Dialog.Header>

		<div class="grid gap-4 py-4">
			<div class="grid grid-cols-2 gap-4">
				<div>
					<label class="text-foreground mb-1.5 block text-sm font-medium">{i18n.t('calendar.fields.date')}</label>
					<Input type="date" bind:value={formData.date} />
				</div>
				<div>
					<label class="text-foreground mb-1.5 block text-sm font-medium">{i18n.t('calendar.fields.title')}</label>
					<Input bind:value={formData.title} placeholder={i18n.t('calendar.placeholders.title')} />
				</div>
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div>
					<label class="text-foreground mb-1.5 block text-sm font-medium">{i18n.t('calendar.fields.startTime')}</label>
					<Input type="time" value={formData.startTime ?? ''} oninput={(e: Event) => (formData.startTime = (e.target as HTMLInputElement).value || null)} />
				</div>
				<div>
					<label class="text-foreground mb-1.5 block text-sm font-medium">{i18n.t('calendar.fields.endTime')}</label>
					<Input type="time" value={formData.endTime ?? ''} oninput={(e: Event) => (formData.endTime = (e.target as HTMLInputElement).value || null)} />
				</div>
			</div>

			<div>
				<label class="text-foreground mb-1.5 block text-sm font-medium">{i18n.t('calendar.fields.company')}</label>
				<Input
					value={formData.company ?? ''}
					oninput={(e: Event) => (formData.company = (e.target as HTMLInputElement).value || null)}
					placeholder={i18n.t('calendar.placeholders.company')}
				/>
			</div>

			<div>
				<label class="text-foreground mb-1.5 block text-sm font-medium">{i18n.t('calendar.fields.auditor')}</label>
				{#if auditors.length > 0}
					<Select.Root type="single" value={auditorSelectValue} onValueChange={onAuditorChange} name="auditorId">
						<Select.Trigger class="w-full">
							{#if auditorSelectValue}
								{@const sel = auditors.find((a) => a.id === auditorSelectValue)}
								{sel ? `${sel.firstName} ${sel.lastName}` : '—'}
							{:else}
								<span class="text-muted-foreground">—</span>
							{/if}
						</Select.Trigger>
						<Select.Content>
							{#each auditors as auditor (auditor.id)}
								<Select.Item value={auditor.id}>{auditor.firstName} {auditor.lastName}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				{:else}
					<Input value={formData.auditorId ?? ''} oninput={(e: Event) => (formData.auditorId = (e.target as HTMLInputElement).value || null)} placeholder="Auditor-ID" />
				{/if}
			</div>

			<div>
				<label class="text-foreground mb-1.5 block text-sm font-medium">{i18n.t('calendar.fields.description')}</label>
				<Textarea
					rows={3}
					value={formData.description ?? ''}
					oninput={(e: Event) => (formData.description = (e.target as HTMLTextAreaElement).value || null)}
					placeholder={i18n.t('calendar.placeholders.description')}
				/>
			</div>
		</div>

		<Dialog.Footer class="flex justify-between">
			<div>
				{#if editingEntry}
					<Button variant="destructive" size="sm" class="gap-1.5" onclick={confirmDeleteEntry}>
						<Trash2 class="h-3.5 w-3.5" />
						{i18n.t('common.delete')}
					</Button>
				{/if}
			</div>
			<div class="flex gap-2">
				<Dialog.Close>
					{#snippet child({ props })}
						<Button variant="outline" {...props}>{i18n.t('common.cancel')}</Button>
					{/snippet}
				</Dialog.Close>
				<Button onclick={handleSave}>{i18n.t('common.save')}</Button>
			</div>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Delete Confirmation -->
<AlertDialog.Root bind:open={deleteDialogOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>{i18n.t('calendar.deleteConfirmTitle')}</AlertDialog.Title>
			<AlertDialog.Description>
				{#if editingEntry}
					{i18n.t('calendar.deleteConfirmDescription', { name: editingEntry.title })}
				{/if}
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>{i18n.t('common.cancel')}</AlertDialog.Cancel>
			<AlertDialog.Action class="bg-destructive text-destructive-foreground hover:bg-destructive/90" onclick={handleDelete}>
				{i18n.t('common.delete')}
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
