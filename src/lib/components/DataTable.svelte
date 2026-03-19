<script lang="ts" generics="TData">
	import {
		type ColumnDef,
		type TableOptions,
		type SortingState,
		type ColumnFiltersState,
		createSvelteTable,
		getCoreRowModel,
		getSortedRowModel,
		getFilteredRowModel,
		getPaginationRowModel,
		flexRender
	} from '@tanstack/svelte-table';
	import * as Table from '$lib/components/ui/table';
	import { writable } from 'svelte/store';

	let {
		data,
		columns,
		sorting = $bindable([]),
		columnFilters = $bindable([]),
		pageSize = 10,
		enablePagination = false,
		enableSorting = true,
		class: className = ''
	}: {
		data: TData[];
		columns: ColumnDef<TData, unknown>[];
		sorting?: SortingState;
		columnFilters?: ColumnFiltersState;
		pageSize?: number;
		enablePagination?: boolean;
		enableSorting?: boolean;
		class?: string;
	} = $props();

	function buildOptions(): TableOptions<TData> {
		return {
			data,
			columns,
			state: {
				sorting,
				columnFilters
			},
			onSortingChange(updater) {
				if (typeof updater === 'function') {
					sorting = updater(sorting);
				} else {
					sorting = updater;
				}
			},
			onColumnFiltersChange(updater) {
				if (typeof updater === 'function') {
					columnFilters = updater(columnFilters);
				} else {
					columnFilters = updater;
				}
			},
			getCoreRowModel: getCoreRowModel(),
			...(enableSorting ? { getSortedRowModel: getSortedRowModel() } : {}),
			getFilteredRowModel: getFilteredRowModel(),
			...(enablePagination
				? {
						getPaginationRowModel: getPaginationRowModel(),
						initialState: { pagination: { pageSize } }
					}
				: {})
		};
	}

	const optionsStore = writable<TableOptions<TData>>(buildOptions());

	$effect(() => {
		optionsStore.set(buildOptions());
	});

	const table = createSvelteTable(optionsStore);
</script>

<div class={className}>
	<Table.Root>
		<Table.Header>
			{#each $table.getHeaderGroups() as headerGroup (headerGroup.id)}
				<Table.Row>
					{#each headerGroup.headers as header (header.id)}
						<Table.Head>
							{#if !header.isPlaceholder}
								{#if header.column.getCanSort() && enableSorting}
									<button type="button" class="flex items-center gap-1" onclick={() => header.column.toggleSorting()}>
										<svelte:component this={flexRender(header.column.columnDef.header, header.getContext())} />
										{#if header.column.getIsSorted() === 'asc'}
											<span class="text-xs">▲</span>
										{:else if header.column.getIsSorted() === 'desc'}
											<span class="text-xs">▼</span>
										{/if}
									</button>
								{:else}
									<svelte:component this={flexRender(header.column.columnDef.header, header.getContext())} />
								{/if}
							{/if}
						</Table.Head>
					{/each}
				</Table.Row>
			{/each}
		</Table.Header>
		<Table.Body>
			{#each $table.getRowModel().rows as row (row.id)}
				<Table.Row>
					{#each row.getVisibleCells() as cell (cell.id)}
						<Table.Cell>
							<svelte:component this={flexRender(cell.column.columnDef.cell, cell.getContext())} />
						</Table.Cell>
					{/each}
				</Table.Row>
			{:else}
				<Table.Row>
					<Table.Cell colspan={columns.length} class="h-24 text-center">Keine Ergebnisse.</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</div>
