<script lang="ts">
	import { getContext } from 'svelte';
	import type { I18nRune } from '$lib/i18n/i18n.svelte';
	import { Button } from '$lib/components/ui/button';
	import { CalendarDate, today, getLocalTimeZone } from '@internationalized/date';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';

	const i18n = getContext<I18nRune>('i18n');

	type ViewMode = 'month' | 'week' | 'day';

	let currentDate = $state(today(getLocalTimeZone()));
	let viewMode = $state<ViewMode>('month');

	const dayKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

	const monthNames = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

	let currentMonthLabel = $derived(`${monthNames[currentDate.month - 1]} ${currentDate.year}`);

	let calendarDays = $derived.by(() => {
		const year = currentDate.year;
		const month = currentDate.month;

		// JS Date day of week: 0=Sun, 1=Mon, ...
		const jsFirstDay = new Date(year, month - 1, 1).getDay();
		// Convert to Monday-based: Mon=0, Tue=1, ..., Sun=6
		const startOffset = jsFirstDay === 0 ? 6 : jsFirstDay - 1;

		const daysInMonth = new Date(year, month, 0).getDate();
		const prevMonthDays = new Date(year, month - 1, 0).getDate();

		const cells: Array<{ day: number; currentMonth: boolean; date: CalendarDate }> = [];

		// Previous month trailing days
		for (let i = startOffset - 1; i >= 0; i--) {
			const d = prevMonthDays - i;
			const prevMonth = month === 1 ? 12 : month - 1;
			const prevYear = month === 1 ? year - 1 : year;
			cells.push({
				day: d,
				currentMonth: false,
				date: new CalendarDate(prevYear, prevMonth, d)
			});
		}

		// Current month days
		for (let d = 1; d <= daysInMonth; d++) {
			cells.push({
				day: d,
				currentMonth: true,
				date: new CalendarDate(year, month, d)
			});
		}

		// Next month leading days to fill 6 rows
		const remaining = 42 - cells.length;
		const nextMonth = month === 12 ? 1 : month + 1;
		const nextYear = month === 12 ? year + 1 : year;
		for (let d = 1; d <= remaining; d++) {
			cells.push({
				day: d,
				currentMonth: false,
				date: new CalendarDate(nextYear, nextMonth, d)
			});
		}

		return cells;
	});

	let todayDate = $derived(today(getLocalTimeZone()));

	function isToday(date: CalendarDate): boolean {
		return date.year === todayDate.year && date.month === todayDate.month && date.day === todayDate.day;
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
</script>

<h1 class="text-2xl font-bold" style="font-family: var(--font-display)">
	{i18n.t('calendar.title')}
</h1>

<div class="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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

<div class="border-border mt-6 overflow-hidden rounded-lg border">
	<div class="grid grid-cols-7">
		{#each dayKeys as dayKey}
			<div class="bg-muted text-muted-foreground border-border border-b px-2 py-2 text-center text-sm font-medium">
				{i18n.t(`calendar.days.${dayKey}`)}
			</div>
		{/each}
	</div>

	<div class="grid grid-cols-7">
		{#each calendarDays as cell}
			<div class="border-border min-h-[80px] border-r border-b p-2 last:border-r-0 sm:min-h-[100px] {!cell.currentMonth ? 'bg-muted/30' : ''}">
				<span
					class="inline-flex h-7 w-7 items-center justify-center rounded-full text-sm"
					class:text-muted-foreground={!cell.currentMonth}
					class:bg-primary={isToday(cell.date)}
					class:text-primary-foreground={isToday(cell.date)}
					class:font-bold={isToday(cell.date)}
				>
					{cell.day}
				</span>
			</div>
		{/each}
	</div>
</div>
