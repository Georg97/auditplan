<script lang="ts">
	import { getContext } from 'svelte';
	import type { I18nRune } from '$lib/i18n/i18n.svelte';
	import type { CalendarEntry } from '$lib/types/calendar';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Badge } from '$lib/components/ui/badge';
	import { toast } from 'svelte-sonner';
	import { CalendarDate, today, getLocalTimeZone } from '@internationalized/date';

	function getISOWeek(date: CalendarDate): number {
		const d = new globalThis.Date(date.year, date.month - 1, date.day);
		d.setHours(0, 0, 0, 0);
		d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
		const week1 = new globalThis.Date(d.getFullYear(), 0, 4);
		return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
	}
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import Plus from '@lucide/svelte/icons/plus';
	import Clock from '@lucide/svelte/icons/clock';

	const i18n = getContext<I18nRune>('i18n');

	type ViewMode = 'month' | 'week' | 'day';

	let currentDate = $state(today(getLocalTimeZone()));
	let viewMode = $state<ViewMode>('month');
	let entries = $state<CalendarEntry[]>([]);

	// Modal state
	let modalOpen = $state(false);
	let editingEntry = $state<CalendarEntry | null>(null);
	let entryToDelete = $state<CalendarEntry | null>(null);
	let modalDatum = $state('');
	let modalTitel = $state('');
	let modalStartzeit = $state('');
	let modalEndzeit = $state('');
	let modalUnternehmen = $state('');
	let modalBeschreibung = $state('');

	const dayKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

	const monthNames = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

	let currentMonthLabel = $derived.by(() => {
		if (viewMode === 'month') {
			return `${monthNames[currentDate.month - 1]} ${currentDate.year}`;
		} else if (viewMode === 'week') {
			const weekStart = getWeekStart(currentDate);
			const weekEnd = weekStart.add({ days: 6 });
			const kw = getISOWeek(weekStart);
			return `${i18n.t('calendar.calendarWeek')} ${kw} — ${weekStart.day}.${String(weekStart.month).padStart(2, '0')}. – ${weekEnd.day}.${String(weekEnd.month).padStart(2, '0')}.${weekEnd.year}`;
		} else {
			const dayIdx = new Date(currentDate.year, currentDate.month - 1, currentDate.day).getDay();
			const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
			const dayName = i18n.t(`calendar.fullDays.${dayNames[dayIdx]}`);
			return `${dayName}, ${currentDate.day}. ${monthNames[currentDate.month - 1]} ${currentDate.year}`;
		}
	});

	function getWeekStart(date: CalendarDate): CalendarDate {
		const jsDay = new Date(date.year, date.month - 1, date.day).getDay();
		const offset = jsDay === 0 ? 6 : jsDay - 1;
		return date.subtract({ days: offset });
	}

	let calendarDays = $derived.by(() => {
		const year = currentDate.year;
		const month = currentDate.month;

		const jsFirstDay = new Date(year, month - 1, 1).getDay();
		const startOffset = jsFirstDay === 0 ? 6 : jsFirstDay - 1;
		const daysInMonth = new Date(year, month, 0).getDate();
		const prevMonthDays = new Date(year, month - 1, 0).getDate();

		const cells: Array<{ day: number; currentMonth: boolean; date: CalendarDate; dateStr: string }> = [];

		for (let i = startOffset - 1; i >= 0; i--) {
			const d = prevMonthDays - i;
			const prevMonth = month === 1 ? 12 : month - 1;
			const prevYear = month === 1 ? year - 1 : year;
			const date = new CalendarDate(prevYear, prevMonth, d);
			cells.push({ day: d, currentMonth: false, date, dateStr: toDateStr(date) });
		}

		for (let d = 1; d <= daysInMonth; d++) {
			const date = new CalendarDate(year, month, d);
			cells.push({ day: d, currentMonth: true, date, dateStr: toDateStr(date) });
		}

		const remaining = 42 - cells.length;
		const nextMonth = month === 12 ? 1 : month + 1;
		const nextYear = month === 12 ? year + 1 : year;
		for (let d = 1; d <= remaining; d++) {
			const date = new CalendarDate(nextYear, nextMonth, d);
			cells.push({ day: d, currentMonth: false, date, dateStr: toDateStr(date) });
		}

		return cells;
	});

	let weekDays = $derived.by(() => {
		const weekStart = getWeekStart(currentDate);
		const days: Array<{ date: CalendarDate; dateStr: string; dayKey: string }> = [];
		for (let i = 0; i < 7; i++) {
			const date = weekStart.add({ days: i });
			days.push({ date, dateStr: toDateStr(date), dayKey: dayKeys[i] });
		}
		return days;
	});

	const hourSlots = Array.from({ length: 14 }, (_, i) => i + 7); // 07:00-20:00

	let todayDate = $derived(today(getLocalTimeZone()));

	function toDateStr(date: CalendarDate): string {
		return `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
	}

	function isToday(date: CalendarDate): boolean {
		return date.year === todayDate.year && date.month === todayDate.month && date.day === todayDate.day;
	}

	function getEntriesForDate(dateStr: string): CalendarEntry[] {
		return entries.filter((e) => e.datum === dateStr);
	}

	function getEntriesForHour(dateStr: string, hour: number): CalendarEntry[] {
		return entries.filter((e) => {
			if (e.datum !== dateStr) return false;
			if (!e.startzeit) return hour === 7;
			const h = parseInt(e.startzeit.split(':')[0], 10);
			return h === hour;
		});
	}

	function goToPrevious() {
		if (viewMode === 'month') {
			currentDate = currentDate.month === 1 ? new CalendarDate(currentDate.year - 1, 12, 1) : new CalendarDate(currentDate.year, currentDate.month - 1, 1);
		} else if (viewMode === 'week') {
			currentDate = currentDate.subtract({ weeks: 1 });
		} else {
			currentDate = currentDate.subtract({ days: 1 });
		}
	}

	function goToNext() {
		if (viewMode === 'month') {
			currentDate = currentDate.month === 12 ? new CalendarDate(currentDate.year + 1, 1, 1) : new CalendarDate(currentDate.year, currentDate.month + 1, 1);
		} else if (viewMode === 'week') {
			currentDate = currentDate.add({ weeks: 1 });
		} else {
			currentDate = currentDate.add({ days: 1 });
		}
	}

	function goToToday() {
		currentDate = today(getLocalTimeZone());
	}

	function openNewEntry(dateStr: string, startTime?: string) {
		editingEntry = null;
		modalDatum = dateStr;
		modalTitel = '';
		modalStartzeit = startTime ?? '';
		modalEndzeit = '';
		modalUnternehmen = '';
		modalBeschreibung = '';
		modalOpen = true;
	}

	function openEditEntry(entry: CalendarEntry) {
		editingEntry = entry;
		modalDatum = entry.datum;
		modalTitel = entry.titel;
		modalStartzeit = entry.startzeit ?? '';
		modalEndzeit = entry.endzeit ?? '';
		modalUnternehmen = entry.unternehmen ?? '';
		modalBeschreibung = entry.beschreibung ?? '';
		modalOpen = true;
	}

	function handleSave() {
		if (!modalTitel.trim() || !modalDatum) return;

		if (editingEntry) {
			const idx = entries.findIndex((e) => e.id === editingEntry!.id);
			if (idx !== -1) {
				entries[idx] = {
					...entries[idx],
					datum: modalDatum,
					titel: modalTitel,
					startzeit: modalStartzeit || undefined,
					endzeit: modalEndzeit || undefined,
					unternehmen: modalUnternehmen || undefined,
					beschreibung: modalBeschreibung || undefined
				};
			}
		} else {
			const now = Date.now();
			const newEntry: CalendarEntry = {
				id: crypto.randomUUID(),
				organizationId: '',
				datum: modalDatum,
				titel: modalTitel,
				startzeit: modalStartzeit || undefined,
				endzeit: modalEndzeit || undefined,
				unternehmen: modalUnternehmen || undefined,
				beschreibung: modalBeschreibung || undefined,
				createdAt: new Date(now),
				updatedAt: new Date(now)
			};
			entries = [...entries, newEntry];
		}

		toast.success(i18n.t('calendar.savedSuccess'));
		modalOpen = false;
	}

	function handleDelete() {
		if (!entryToDelete) return;
		entries = entries.filter((e) => e.id !== entryToDelete!.id);
		toast.success(i18n.t('calendar.deletedSuccess'));
		entryToDelete = null;
		modalOpen = false;
	}
</script>

<div class="space-y-6">
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<h1 class="text-2xl font-bold" style="font-family: var(--font-display)">
			{i18n.t('calendar.title')}
		</h1>
		<Button onclick={() => openNewEntry(toDateStr(todayDate))}>
			<Plus class="mr-2 h-4 w-4" />
			{i18n.t('calendar.newEntry')}
		</Button>
	</div>

	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div class="flex items-center gap-2">
			<Button variant="outline" size="icon" onclick={goToPrevious}>
				<ChevronLeft class="h-4 w-4" />
			</Button>
			<Button variant="outline" onclick={goToToday}>
				{i18n.t('calendar.today')}
			</Button>
			<Button variant="outline" size="icon" onclick={goToNext}>
				<ChevronRight class="h-4 w-4" />
			</Button>
			<span class="ml-2 text-lg font-semibold" style="font-family: var(--font-display)">
				{currentMonthLabel}
			</span>
		</div>

		<div class="flex items-center gap-1">
			<Button variant={viewMode === 'month' ? 'default' : 'outline'} size="sm" onclick={() => (viewMode = 'month')}>
				{i18n.t('calendar.month')}
			</Button>
			<Button variant={viewMode === 'week' ? 'default' : 'outline'} size="sm" onclick={() => (viewMode = 'week')}>
				{i18n.t('calendar.week')}
			</Button>
			<Button variant={viewMode === 'day' ? 'default' : 'outline'} size="sm" onclick={() => (viewMode = 'day')}>
				{i18n.t('calendar.day')}
			</Button>
		</div>
	</div>

	<!-- Month View -->
	{#if viewMode === 'month'}
		<div class="border-border overflow-hidden rounded-lg border">
			<div class="grid grid-cols-7">
				{#each dayKeys as dayKey}
					<div class="bg-muted text-muted-foreground border-border border-b px-2 py-2 text-center text-sm font-medium">
						{i18n.t(`calendar.days.${dayKey}`)}
					</div>
				{/each}
			</div>

			<div class="grid grid-cols-7">
				{#each calendarDays as cell}
					<div
						class="border-border hover:bg-accent/50 min-h-[80px] cursor-pointer border-r border-b p-2 text-left transition-colors last:border-r-0 sm:min-h-[100px] {!cell.currentMonth
							? 'bg-muted/30'
							: ''}"
						onclick={() => openNewEntry(cell.dateStr)}
						onkeydown={(e) => {
							if (e.key === 'Enter') openNewEntry(cell.dateStr);
						}}
						role="button"
						tabindex="0"
					>
						<span
							class="inline-flex h-7 w-7 items-center justify-center rounded-full text-sm"
							class:text-muted-foreground={!cell.currentMonth}
							class:bg-primary={isToday(cell.date)}
							class:text-primary-foreground={isToday(cell.date)}
							class:font-bold={isToday(cell.date)}
						>
							{cell.day}
						</span>
						<div class="mt-1 space-y-0.5">
							{#each getEntriesForDate(cell.dateStr).slice(0, 3) as entry}
								<button
									type="button"
									class="bg-brand/10 text-brand hover:bg-brand/20 block w-full truncate rounded px-1 py-0.5 text-left text-xs transition-colors"
									onclick={(e) => {
										e.stopPropagation();
										openEditEntry(entry);
									}}
								>
									{entry.titel}
								</button>
							{/each}
							{#if getEntriesForDate(cell.dateStr).length > 3}
								<span class="text-muted-foreground text-xs">
									+{getEntriesForDate(cell.dateStr).length - 3}
								</span>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Week View -->
	{#if viewMode === 'week'}
		<div class="border-border overflow-auto rounded-lg border">
			<div class="grid min-w-[800px] grid-cols-[60px_repeat(7,1fr)]">
				<!-- Header row -->
				<div class="bg-muted border-border border-b"></div>
				{#each weekDays as wd}
					<div class="bg-muted border-border border-b border-l px-2 py-2 text-center text-sm font-medium {isToday(wd.date) ? 'bg-blue-50 dark:bg-blue-950/30' : ''}">
						<div class="text-muted-foreground">{i18n.t(`calendar.days.${wd.dayKey}`)}</div>
						<div class="text-foreground text-base font-semibold" class:text-brand={isToday(wd.date)}>
							{wd.date.day}
						</div>
					</div>
				{/each}

				<!-- Hour rows -->
				{#each hourSlots as hour}
					<div class="text-muted-foreground border-border flex items-start justify-end border-b pt-1 pr-2 text-xs">
						{String(hour).padStart(2, '0')}:00
					</div>
					{#each weekDays as wd}
						<div
							class="border-border hover:bg-accent/30 relative min-h-[48px] cursor-pointer border-b border-l transition-colors"
							onclick={() => openNewEntry(wd.dateStr, `${String(hour).padStart(2, '0')}:00`)}
							onkeydown={(e) => {
								if (e.key === 'Enter') openNewEntry(wd.dateStr, `${String(hour).padStart(2, '0')}:00`);
							}}
							role="button"
							tabindex="0"
						>
							{#each getEntriesForHour(wd.dateStr, hour) as entry}
								<button
									type="button"
									class="bg-brand/15 text-brand border-brand/30 m-0.5 block w-[calc(100%-4px)] truncate rounded border-l-2 px-1.5 py-0.5 text-left text-xs"
									onclick={(e) => {
										e.stopPropagation();
										openEditEntry(entry);
									}}
								>
									{#if entry.startzeit}
										<span class="font-medium">{entry.startzeit}</span>
									{/if}
									{entry.titel}
								</button>
							{/each}
						</div>
					{/each}
				{/each}
			</div>
		</div>
	{/if}

	<!-- Day View -->
	{#if viewMode === 'day'}
		<div class="border-border overflow-hidden rounded-lg border">
			{#each hourSlots as hour}
				<div
					class="border-border hover:bg-accent/30 flex min-h-[56px] cursor-pointer border-b transition-colors"
					onclick={() => openNewEntry(toDateStr(currentDate), `${String(hour).padStart(2, '0')}:00`)}
					onkeydown={(e) => {
						if (e.key === 'Enter') openNewEntry(toDateStr(currentDate), `${String(hour).padStart(2, '0')}:00`);
					}}
					role="button"
					tabindex="0"
				>
					<div class="text-muted-foreground border-border flex w-16 shrink-0 items-start justify-end border-r pt-2 pr-2 text-sm">
						{String(hour).padStart(2, '0')}:00
					</div>
					<div class="flex-1 p-1">
						{#each getEntriesForHour(toDateStr(currentDate), hour) as entry}
							<button
								type="button"
								class="bg-brand/10 border-brand/30 hover:bg-brand/20 mb-1 block w-full rounded border-l-2 px-3 py-2 text-left transition-colors"
								onclick={(e) => {
									e.stopPropagation();
									openEditEntry(entry);
								}}
							>
								<div class="flex items-center gap-2">
									{#if entry.startzeit}
										<Badge variant="outline" class="text-xs">
											<Clock class="mr-1 h-3 w-3" />
											{entry.startzeit}{entry.endzeit ? ` – ${entry.endzeit}` : ''}
										</Badge>
									{/if}
									<span class="font-medium">{entry.titel}</span>
								</div>
								{#if entry.unternehmen}
									<p class="text-muted-foreground mt-1 text-sm">{entry.unternehmen}</p>
								{/if}
								{#if entry.beschreibung}
									<p class="text-muted-foreground mt-0.5 text-sm">{entry.beschreibung}</p>
								{/if}
							</button>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<!-- Entry Dialog -->
<Dialog.Root bind:open={modalOpen}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>
				{editingEntry ? i18n.t('calendar.editEntry') : i18n.t('calendar.newEntry')}
			</Dialog.Title>
		</Dialog.Header>

		<div class="grid gap-4 py-4">
			<div class="grid grid-cols-4 items-center gap-4">
				<label for="cal-datum" class="text-right text-sm font-medium">
					{i18n.t('calendar.date')}
				</label>
				<Input id="cal-datum" type="date" class="col-span-3" bind:value={modalDatum} />
			</div>

			<div class="grid grid-cols-4 items-center gap-4">
				<label for="cal-titel" class="text-right text-sm font-medium">
					{i18n.t('calendar.titleField')} *
				</label>
				<Input id="cal-titel" class="col-span-3" placeholder={i18n.t('calendar.titlePlaceholder')} bind:value={modalTitel} />
			</div>

			<div class="grid grid-cols-4 items-center gap-4">
				<label for="cal-start" class="text-right text-sm font-medium">
					{i18n.t('calendar.startTime')}
				</label>
				<Input id="cal-start" type="time" class="col-span-3" bind:value={modalStartzeit} />
			</div>

			<div class="grid grid-cols-4 items-center gap-4">
				<label for="cal-end" class="text-right text-sm font-medium">
					{i18n.t('calendar.endTime')}
				</label>
				<Input id="cal-end" type="time" class="col-span-3" bind:value={modalEndzeit} />
			</div>

			<div class="grid grid-cols-4 items-center gap-4">
				<label for="cal-company" class="text-right text-sm font-medium">
					{i18n.t('calendar.company')}
				</label>
				<Input id="cal-company" class="col-span-3" placeholder={i18n.t('calendar.companyPlaceholder')} bind:value={modalUnternehmen} />
			</div>

			<div class="grid grid-cols-4 items-start gap-4">
				<label for="cal-desc" class="mt-2 text-right text-sm font-medium">
					{i18n.t('calendar.descriptionField')}
				</label>
				<Textarea id="cal-desc" class="col-span-3" placeholder={i18n.t('calendar.descriptionPlaceholder')} bind:value={modalBeschreibung} />
			</div>
		</div>

		<Dialog.Footer class="flex gap-2">
			{#if editingEntry}
				<Button
					variant="destructive"
					onclick={() => {
						entryToDelete = editingEntry;
					}}
				>
					{i18n.t('common.delete')}
				</Button>
			{/if}
			<div class="flex-1"></div>
			<Dialog.Close>
				<Button variant="outline">{i18n.t('common.cancel')}</Button>
			</Dialog.Close>
			<Button onclick={handleSave}>{i18n.t('common.save')}</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Delete Confirmation -->
<AlertDialog.Root
	open={entryToDelete !== null}
	onOpenChange={(open) => {
		if (!open) entryToDelete = null;
	}}
>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>{i18n.t('calendar.deleteConfirmTitle')}</AlertDialog.Title>
			<AlertDialog.Description>
				{i18n.t('calendar.deleteConfirmMessage', { title: entryToDelete?.titel ?? '' })}
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>{i18n.t('common.cancel')}</AlertDialog.Cancel>
			<AlertDialog.Action onclick={handleDelete}>{i18n.t('common.delete')}</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
