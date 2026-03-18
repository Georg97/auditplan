<script lang="ts" generics="TData">
	import {
		createSvelteTable,
		flexRender,
		getCoreRowModel,
		getSortedRowModel,
		getFilteredRowModel,
		getPaginationRowModel,
		type ColumnDef,
		type SortingState,
		type ColumnFiltersState
	} from '@tanstack/svelte-table';
	import * as Table from '$lib/components/ui/table';

	let {
		data,
		columns,
		sorting = $bindable([]),
		columnFilters = $bindable([]),
		pageSize = 0,
		class: className = ''
	}: {
		data: TData[];
		columns: ColumnDef<TData, unknown>[];
		sorting?: SortingState;
		columnFilters?: ColumnFiltersState;
		pageSize?: number;
		class?: string;
	} = $props();

	const table = createSvelteTable({
		get data() {
			return data;
		},
		get columns() {
			return columns;
		},
		state: {
			get sorting() {
				return sorting;
			},
			get columnFilters() {
				return columnFilters;
			}
		},
		onSortingChange(updater) {
			sorting = typeof updater === 'function' ? updater(sorting) : updater;
		},
		onColumnFiltersChange(updater) {
			columnFilters = typeof updater === 'function' ? updater(columnFilters) : updater;
		},
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		...(pageSize > 0 ? { getPaginationRowModel: getPaginationRowModel() } : {})
	});
</script>

<div class="rounded-md border {className}">
	<Table.Root>
		<Table.Header>
			{#each $table.getHeaderGroups() as headerGroup (headerGroup.id)}
				<Table.Row>
					{#each headerGroup.headers as header (header.id)}
						<Table.Head>
							{#if !header.isPlaceholder}
								{@const component = flexRender(header.column.columnDef.header, header.getContext())}
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
				<Table.Row>
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
					<Table.Cell colspan={columns.length} class="h-24 text-center">Keine Daten vorhanden.</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</div>
