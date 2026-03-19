<script lang="ts">
	/* eslint-disable svelte/prefer-svelte-reactivity -- Date used for computation, not reactive state */
	import { getContext } from 'svelte';
	import type { I18nRune } from '$lib/i18n/i18n.svelte';
	import { getCalendarEntries, addCalendarEntry, editCalendarEntry, deleteCalendarEntry } from '$lib/rpc/kalender.remote';
	import { getAuditors } from '$lib/rpc/auditoren.remote';
	import type { CalendarView } from '$lib/types/calendar';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Button } from '$lib/components/ui/button';
	import { toast } from 'svelte-sonner';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	const i18n = getContext<I18nRune>('i18n');

	type EntryRow = Awaited<ReturnType<typeof getCalendarEntries>> extends (infer T)[] ? T : never;
	type AuditorRow = Awaited<ReturnType<typeof getAuditors>> extends (infer T)[] ? T : never;

	let view = $state<CalendarView>('month');
	let currentDate = $state(new Date());
	let entries = $state<EntryRow[]>([]);
	let auditors = $state<AuditorRow[]>([]);
	let loading = $state(true);

	// Modal state
	let modalOpen = $state(false);
	let editingEntry = $state<EntryRow | null>(null);
	let formDatum = $state('');
	let formTitel = $state('');
	let formStartzeit = $state('');
	let formEndzeit = $state('');
	let formUnternehmen = $state('');
	let formAuditorId = $state('');
	let formBeschreibung = $state('');
	let saving = $state(false);

	// Delete dialog
	let deleteDialogOpen = $state(false);
	let entryToDelete = $state<EntryRow | null>(null);

	// Derived date helpers
	const currentYear = $derived(currentDate.getFullYear());
	const currentMonth = $derived(currentDate.getMonth());

	const periodLabel = $derived.by(() => {
		const months = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
		if (view === 'month') {
			return `${months[currentMonth]} ${currentYear}`;
		} else if (view === 'week') {
			const { start, end } = getWeekRange(currentDate);
			const weekNum = getWeekNumber(start);
			return `KW ${weekNum} – ${formatShortDate(start)} – ${formatShortDate(end)}`;
		} else {
			const weekdays = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
			return `${weekdays[currentDate.getDay()]}, ${currentDate.getDate()}. ${months[currentMonth]} ${currentYear}`;
		}
	});

	function getWeekNumber(d: Date): number {
		const target = new Date(d.getTime());
		target.setDate(target.getDate() + 3 - ((target.getDay() + 6) % 7));
		const firstThursday = new Date(target.getFullYear(), 0, 4);
		firstThursday.setDate(firstThursday.getDate() + 3 - ((firstThursday.getDay() + 6) % 7));
		return 1 + Math.round((target.getTime() - firstThursday.getTime()) / (7 * 86400000));
	}

	function formatShortDate(d: Date): string {
		return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
	}

	function toISODate(d: Date): string {
		return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
	}

	function getMonthRange(d: Date): { start: string; end: string } {
		const first = new Date(d.getFullYear(), d.getMonth(), 1);
		const dayOfWeek = (first.getDay() + 6) % 7; // Monday = 0
		const start = new Date(first);
		start.setDate(start.getDate() - dayOfWeek);

		const last = new Date(d.getFullYear(), d.getMonth() + 1, 0);
		const endDayOfWeek = (last.getDay() + 6) % 7;
		const end = new Date(last);
		end.setDate(end.getDate() + (6 - endDayOfWeek));

		return { start: toISODate(start), end: toISODate(end) };
	}

	function getWeekRange(d: Date): { start: Date; end: Date } {
		const day = (d.getDay() + 6) % 7;
		const start = new Date(d);
		start.setDate(start.getDate() - day);
		const end = new Date(start);
		end.setDate(end.getDate() + 6);
		return { start, end };
	}

	function getDateRange(): { start: string; end: string } {
		if (view === 'month') {
			return getMonthRange(currentDate);
		} else if (view === 'week') {
			const { start, end } = getWeekRange(currentDate);
			return { start: toISODate(start), end: toISODate(end) };
		} else {
			const d = toISODate(currentDate);
			return { start: d, end: d };
		}
	}

	async function loadEntries() {
		loading = true;
		try {
			const { start, end } = getDateRange();
			entries = await getCalendarEntries({ startDatum: start, endDatum: end });
		} catch {
			entries = [];
		} finally {
			loading = false;
		}
	}

	async function loadAuditors() {
		try {
			auditors = await getAuditors();
		} catch {
			auditors = [];
		}
	}

	// Initial load
	$effect(() => {
		loadAuditors();
	});

	// Reload entries when view or currentDate changes
	$effect(() => {
		// Touch reactive deps
		void view;
		void currentDate;
		loadEntries();
	});

	function navigate(dir: -1 | 0 | 1) {
		if (dir === 0) {
			currentDate = new Date();
			return;
		}
		const d = new Date(currentDate);
		if (view === 'month') {
			d.setMonth(d.getMonth() + dir);
		} else if (view === 'week') {
			d.setDate(d.getDate() + dir * 7);
		} else {
			d.setDate(d.getDate() + dir);
		}
		currentDate = d;
	}

	// Month grid
	interface MonthDay {
		date: string;
		day: number;
		isCurrentMonth: boolean;
		isToday: boolean;
		entries: EntryRow[];
	}

	const monthDays = $derived.by((): MonthDay[] => {
		if (view !== 'month') return [];
		const today = toISODate(new Date());
		const { start } = getMonthRange(currentDate);
		const startDate = new Date(start + 'T00:00:00');
		const days: MonthDay[] = [];

		for (let i = 0; i < 42; i++) {
			const d = new Date(startDate);
			d.setDate(d.getDate() + i);
			const dateStr = toISODate(d);
			days.push({
				date: dateStr,
				day: d.getDate(),
				isCurrentMonth: d.getMonth() === currentMonth,
				isToday: dateStr === today,
				entries: entries.filter((e) => e.datum === dateStr)
			});
		}
		// Trim trailing weeks if all outside current month
		while (days.length > 35 && days.slice(-7).every((d) => !d.isCurrentMonth)) {
			days.splice(-7, 7);
		}
		return days;
	});

	// Week grid
	interface WeekSlot {
		hour: number;
		label: string;
		entries: EntryRow[];
	}

	interface WeekDay {
		date: string;
		dayLabel: string;
		dayNum: number;
		isToday: boolean;
		slots: WeekSlot[];
	}

	const weekDays = $derived.by((): WeekDay[] => {
		if (view !== 'week') return [];
		const today = toISODate(new Date());
		const { start } = getWeekRange(currentDate);
		const dayNames = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
		const days: WeekDay[] = [];

		for (let i = 0; i < 7; i++) {
			const d = new Date(start);
			d.setDate(d.getDate() + i);
			const dateStr = toISODate(d);
			const dayEntries = entries.filter((e) => e.datum === dateStr);

			const slots: WeekSlot[] = [];
			for (let h = 7; h <= 20; h++) {
				const hStr = String(h).padStart(2, '0');
				slots.push({
					hour: h,
					label: `${hStr}:00`,
					entries: dayEntries.filter((e) => {
						if (!e.startzeit) return h === 7; // entries without time go to first slot
						const entryHour = parseInt(e.startzeit.split(':')[0], 10);
						return entryHour === h;
					})
				});
			}

			days.push({
				date: dateStr,
				dayLabel: dayNames[i],
				dayNum: d.getDate(),
				isToday: dateStr === today,
				slots
			});
		}
		return days;
	});

	// Day view
	const daySlots = $derived.by((): WeekSlot[] => {
		if (view !== 'day') return [];
		const dateStr = toISODate(currentDate);
		const dayEntries = entries.filter((e) => e.datum === dateStr);
		const slots: WeekSlot[] = [];
		for (let h = 7; h <= 20; h++) {
			const hStr = String(h).padStart(2, '0');
			slots.push({
				hour: h,
				label: `${hStr}:00`,
				entries: dayEntries.filter((e) => {
					if (!e.startzeit) return h === 7;
					const entryHour = parseInt(e.startzeit.split(':')[0], 10);
					return entryHour === h;
				})
			});
		}
		return slots;
	});

	// Modal handlers
	function openNewEntry(datum: string, startzeit?: string) {
		editingEntry = null;
		formDatum = datum;
		formTitel = '';
		formStartzeit = startzeit ?? '';
		formEndzeit = '';
		formUnternehmen = '';
		formAuditorId = '';
		formBeschreibung = '';
		modalOpen = true;
	}

	function openEditEntry(entry: EntryRow) {
		editingEntry = entry;
		formDatum = entry.datum;
		formTitel = entry.titel;
		formStartzeit = entry.startzeit ?? '';
		formEndzeit = entry.endzeit ?? '';
		formUnternehmen = entry.unternehmen ?? '';
		formAuditorId = entry.auditorId ?? '';
		formBeschreibung = entry.beschreibung ?? '';
		modalOpen = true;
	}

	async function saveEntry() {
		if (!formTitel.trim() || !formDatum) return;
		saving = true;
		try {
			const data = {
				datum: formDatum,
				titel: formTitel.trim(),
				startzeit: formStartzeit || undefined,
				endzeit: formEndzeit || undefined,
				unternehmen: formUnternehmen || undefined,
				auditorId: formAuditorId || undefined,
				beschreibung: formBeschreibung || undefined
			};

			if (editingEntry) {
				await editCalendarEntry({ id: editingEntry.id, data });
			} else {
				await addCalendarEntry(data);
			}
			toast.success(i18n.t('calendar.save_success'));
			modalOpen = false;
			await loadEntries();
		} catch {
			toast.error(i18n.t('common.no_data'));
		} finally {
			saving = false;
		}
	}

	function openDeleteDialog(entry: EntryRow) {
		entryToDelete = entry;
		deleteDialogOpen = true;
	}

	async function confirmDelete() {
		if (!entryToDelete) return;
		try {
			await deleteCalendarEntry(entryToDelete.id);
			toast.success(i18n.t('calendar.delete_success'));
			deleteDialogOpen = false;
			modalOpen = false;
			entryToDelete = null;
			await loadEntries();
		} catch {
			toast.error(i18n.t('common.no_data'));
		}
	}

	const weekdayHeaders = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
</script>

<div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
	<h1 class="mb-6 text-2xl font-bold" style="font-family: var(--font-display)">
		{i18n.t('calendar.title')}
	</h1>

	<!-- Navigation bar -->
	<div class="bg-card mb-4 flex flex-wrap items-center gap-2 rounded-xl border p-3 shadow-sm">
		<Button variant="ghost" size="icon" onclick={() => navigate(-1)}>
			<ChevronLeft class="h-5 w-5" />
		</Button>

		<span class="min-w-48 text-center text-lg font-semibold" style="font-family: var(--font-display)">
			{periodLabel}
		</span>

		<Button variant="ghost" size="icon" onclick={() => navigate(1)}>
			<ChevronRight class="h-5 w-5" />
		</Button>

		<Button variant="outline" size="sm" class="ml-auto" onclick={() => navigate(0)}>
			{i18n.t('calendar.today')}
		</Button>

		<div class="bg-muted flex rounded-lg p-0.5">
			{#each ['month', 'week', 'day'] as const as v (v)}
				<button
					class="rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
					class:bg-primary={view === v}
					class:text-primary-foreground={view === v}
					class:text-muted-foreground={view !== v}
					onclick={() => (view = v)}
				>
					{i18n.t(`calendar.view_${v}`)}
				</button>
			{/each}
		</div>
	</div>

	{#if loading}
		<div class="bg-muted h-96 animate-pulse rounded-xl"></div>
	{:else if view === 'month'}
		<!-- Month view -->
		<div class="bg-card overflow-hidden rounded-xl border shadow-sm">
			<!-- Weekday headers -->
			<div class="grid grid-cols-7 border-b">
				{#each weekdayHeaders as day (day)}
					<div class="text-muted-foreground py-2 text-center text-xs font-semibold uppercase">
						{day}
					</div>
				{/each}
			</div>

			<!-- Day cells -->
			<div class="grid grid-cols-7">
				{#each monthDays as day (day.date)}
					<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
					<div
						class="hover:bg-accent/30 relative min-h-24 cursor-pointer border-r border-b p-1.5 text-left transition-colors last:border-r-0 {!day.isCurrentMonth
							? 'opacity-40'
							: ''} {day.entries.length > 0 && day.isCurrentMonth ? 'bg-blue-50 dark:bg-blue-950/20' : ''}"
						style={day.entries.length > 0 && day.isCurrentMonth ? 'border-left: 3px solid #667eea;' : ''}
						onclick={() => openNewEntry(day.date)}
					>
						<span
							class="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium"
							class:bg-primary={day.isToday}
							class:text-primary-foreground={day.isToday}
						>
							{day.day}
						</span>

						{#if day.entries.length > 0}
							<div class="mt-0.5 space-y-0.5">
								{#each day.entries.slice(0, 3) as entry (entry.id)}
									<button
										class="bg-brand/10 text-brand hover:bg-brand/20 block w-full truncate rounded px-1 py-0.5 text-left text-[10px] font-medium"
										onclick={(e: MouseEvent) => {
											e.stopPropagation();
											openEditEntry(entry);
										}}
									>
										{#if entry.startzeit}{entry.startzeit}
										{/if}{entry.titel}
									</button>
								{/each}
								{#if day.entries.length > 3}
									<span class="text-muted-foreground text-[10px]">+{day.entries.length - 3}</span>
								{/if}
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	{:else if view === 'week'}
		<!-- Week view -->
		<div class="bg-card overflow-auto rounded-xl border shadow-sm">
			<!-- Header row -->
			<div class="grid grid-cols-8 border-b">
				<div class="border-r p-2"></div>
				{#each weekDays as wd (wd.date)}
					<div class="border-r p-2 text-center text-xs font-semibold last:border-r-0 {wd.isToday ? 'bg-primary/10' : ''}">
						<div class="text-muted-foreground">{wd.dayLabel}</div>
						<div class="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full text-sm" class:bg-primary={wd.isToday} class:text-primary-foreground={wd.isToday}>
							{wd.dayNum}
						</div>
					</div>
				{/each}
			</div>

			<!-- Time slots -->
			{#each { length: 14 } as _, i (i)}
				{@const hour = i + 7}
				<div class="grid grid-cols-8 border-b last:border-b-0">
					<div class="text-muted-foreground border-r p-1 text-right text-xs">
						{String(hour).padStart(2, '0')}:00
					</div>
					{#each weekDays as wd (wd.date)}
						{@const slot = wd.slots.find((s) => s.hour === hour)}
						<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
						<div
							class="hover:bg-accent/30 relative min-h-10 cursor-pointer border-r p-0.5 text-left last:border-r-0"
							onclick={() => openNewEntry(wd.date, `${String(hour).padStart(2, '0')}:00`)}
						>
							{#if slot}
								{#each slot.entries as entry (entry.id)}
									<button
										class="bg-brand/15 text-brand hover:bg-brand/25 mb-0.5 block w-full truncate rounded px-1 py-0.5 text-left text-[10px] font-medium"
										onclick={(e: MouseEvent) => {
											e.stopPropagation();
											openEditEntry(entry);
										}}
									>
										{entry.titel}
									</button>
								{/each}
							{/if}
						</div>
					{/each}
				</div>
			{/each}
		</div>
	{:else}
		<!-- Day view -->
		<div class="bg-card overflow-hidden rounded-xl border shadow-sm">
			{#each daySlots as slot (slot.hour)}
				<div class="flex border-b last:border-b-0">
					<div class="text-muted-foreground w-16 shrink-0 border-r p-2 text-right text-xs">
						{slot.label}
					</div>
					<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
					<div class="hover:bg-accent/30 min-h-14 flex-1 cursor-pointer p-1 text-left" onclick={() => openNewEntry(toISODate(currentDate), slot.label)}>
						{#each slot.entries as entry (entry.id)}
							<button
								class="bg-brand/10 hover:bg-brand/20 mb-1 block w-full rounded p-2 text-left"
								onclick={(e: MouseEvent) => {
									e.stopPropagation();
									openEditEntry(entry);
								}}
							>
								<div class="text-sm font-medium">{entry.titel}</div>
								{#if entry.startzeit || entry.endzeit}
									<div class="text-muted-foreground text-xs">
										{entry.startzeit ?? ''}{entry.endzeit ? ` – ${entry.endzeit}` : ''}
									</div>
								{/if}
								{#if entry.unternehmen}
									<div class="text-muted-foreground text-xs">{entry.unternehmen}</div>
								{/if}
								{#if entry.beschreibung}
									<div class="text-muted-foreground mt-1 text-xs">{entry.beschreibung}</div>
								{/if}
							</button>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<!-- Entry Modal -->
<Dialog.Root bind:open={modalOpen}>
	<Dialog.Content class="sm:max-w-lg">
		<Dialog.Header>
			<Dialog.Title>
				{editingEntry ? i18n.t('calendar.edit_entry') : i18n.t('calendar.new_entry')}
			</Dialog.Title>
		</Dialog.Header>

		<div class="space-y-4 py-4">
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<div class="flex flex-col gap-1.5">
					<Label for="cal-datum">
						{i18n.t('calendar.field_datum')}
						<span class="text-destructive ml-0.5">*</span>
					</Label>
					<Input id="cal-datum" type="date" bind:value={formDatum} />
				</div>
				<div class="flex flex-col gap-1.5">
					<Label for="cal-titel">
						{i18n.t('calendar.field_titel')}
						<span class="text-destructive ml-0.5">*</span>
					</Label>
					<Input id="cal-titel" type="text" bind:value={formTitel} />
				</div>
			</div>

			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<div class="flex flex-col gap-1.5">
					<Label for="cal-start">{i18n.t('calendar.field_startzeit')}</Label>
					<Input id="cal-start" type="time" bind:value={formStartzeit} />
				</div>
				<div class="flex flex-col gap-1.5">
					<Label for="cal-end">{i18n.t('calendar.field_endzeit')}</Label>
					<Input id="cal-end" type="time" bind:value={formEndzeit} />
				</div>
			</div>

			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<div class="flex flex-col gap-1.5">
					<Label for="cal-unternehmen">{i18n.t('calendar.field_unternehmen')}</Label>
					<Input id="cal-unternehmen" type="text" bind:value={formUnternehmen} />
				</div>
				<div class="flex flex-col gap-1.5">
					<Label for="cal-auditor">{i18n.t('calendar.field_auditor')}</Label>
					<select
						id="cal-auditor"
						bind:value={formAuditorId}
						class="border-input bg-background focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-none"
					>
						<option value="">—</option>
						{#each auditors as a (a.id)}
							<option value={a.id}>{a.name}</option>
						{/each}
					</select>
				</div>
			</div>

			<div class="flex flex-col gap-1.5">
				<Label for="cal-beschreibung">{i18n.t('calendar.field_beschreibung')}</Label>
				<Textarea id="cal-beschreibung" rows={4} bind:value={formBeschreibung} />
			</div>
		</div>

		<Dialog.Footer>
			{#if editingEntry}
				<Button
					variant="destructive"
					onclick={() => {
						if (editingEntry) openDeleteDialog(editingEntry);
					}}
					class="mr-auto"
				>
					{i18n.t('common.delete')}
				</Button>
			{/if}
			<Button variant="outline" onclick={() => (modalOpen = false)}>
				{i18n.t('common.cancel')}
			</Button>
			<Button onclick={saveEntry} disabled={saving || !formTitel.trim() || !formDatum}>
				{i18n.t('common.save')}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Delete Confirmation -->
<AlertDialog.Root bind:open={deleteDialogOpen}>
	<AlertDialog.Portal>
		<AlertDialog.Overlay />
		<AlertDialog.Content>
			<AlertDialog.Header>
				<AlertDialog.Title>
					{i18n.t('calendar.delete_confirm', { name: entryToDelete?.titel ?? '' })}
				</AlertDialog.Title>
			</AlertDialog.Header>
			<AlertDialog.Footer>
				<AlertDialog.Cancel onclick={() => (deleteDialogOpen = false)}>
					{i18n.t('common.cancel')}
				</AlertDialog.Cancel>
				<AlertDialog.Action onclick={confirmDelete} class="bg-destructive text-destructive-foreground hover:bg-destructive/90">
					{i18n.t('common.delete')}
				</AlertDialog.Action>
			</AlertDialog.Footer>
		</AlertDialog.Content>
	</AlertDialog.Portal>
</AlertDialog.Root>
