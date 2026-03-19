<script lang="ts" generics="TData">
	import {
		createSvelteTable,
		flexRender,
		getCoreRowModel,
		getSortedRowModel,
		getFilteredRowModel,
		type ColumnDef,
		type RowSelectionState,
		type SortingState,
		type ColumnFiltersState
	} from '@tanstack/svelte-table';
	import * as Table from '$lib/components/ui/table';
	import { readable } from 'svelte/store';
	import type { Snippet } from 'svelte';

	let {
		data,
		columns,
		sorting = $bindable([]),
		columnFilters = $bindable([]),
		rowSelection = $bindable({}),
		enableSorting = false,
		enableFiltering = false,
		enableRowSelection = false,
		noResultsMessage = 'No results.',
		header,
		footer
	}: {
		data: TData[];
		columns: ColumnDef<TData, unknown>[];
		sorting?: SortingState;
		columnFilters?: ColumnFiltersState;
		rowSelection?: RowSelectionState;
		enableSorting?: boolean;
		enableFiltering?: boolean;
		enableRowSelection?: boolean;
		noResultsMessage?: string;
		header?: Snippet;
		footer?: Snippet;
	} = $props();

	const options = $derived(
		readable({
			data,
			columns,
			getCoreRowModel: getCoreRowModel(),
			...(enableSorting ? { getSortedRowModel: getSortedRowModel() } : {}),
			...(enableFiltering ? { getFilteredRowModel: getFilteredRowModel() } : {}),
			enableRowSelection,
			state: {
				sorting,
				columnFilters,
				rowSelection
			},
			onSortingChange(updater: ((old: SortingState) => SortingState) | SortingState) {
				sorting = typeof updater === 'function' ? updater(sorting) : updater;
			},
			onColumnFiltersChange(updater: ((old: ColumnFiltersState) => ColumnFiltersState) | ColumnFiltersState) {
				columnFilters = typeof updater === 'function' ? updater(columnFilters) : updater;
			},
			onRowSelectionChange(updater: ((old: RowSelectionState) => RowSelectionState) | RowSelectionState) {
				rowSelection = typeof updater === 'function' ? updater(rowSelection) : updater;
			}
		})
	);

	const table = createSvelteTable(options);
</script>

{#if header}
	{@render header()}
{/if}

<div class="rounded-md border">
	<Table.Root>
		<Table.Header>
			{#each $table.getHeaderGroups() as headerGroup (headerGroup.id)}
				<Table.Row>
					{#each headerGroup.headers as headerCell (headerCell.id)}
						<Table.Head>
							{#if !headerCell.isPlaceholder}
								{@const component = flexRender(headerCell.column.columnDef.header, headerCell.getContext())}
								{#if typeof component === 'string'}
									{component}
								{:else if component}
									<svelte:component this={component} />
								{/if}
							{/if}
						</Table.Head>
					{/each}
				</Table.Row>
			{/each}
		</Table.Header>
		<Table.Body>
			{#each $table.getRowModel().rows as row (row.id)}
				<Table.Row data-state={row.getIsSelected() ? 'selected' : undefined}>
					{#each row.getVisibleCells() as cell (cell.id)}
						<Table.Cell>
							{@const component = flexRender(cell.column.columnDef.cell, cell.getContext())}
							{#if typeof component === 'string'}
								{component}
							{:else if component}
								<svelte:component this={component} />
							{/if}
						</Table.Cell>
					{/each}
				</Table.Row>
			{:else}
				<Table.Row>
					<Table.Cell colspan={columns.length} class="h-24 text-center">
						{noResultsMessage}
					</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</div>

{#if footer}
	{@render footer()}
{/if}
