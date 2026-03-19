<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';

	let {
		items = $bindable([]),
		renderItem,
		onReorder
	}: {
		items: T[];
		renderItem: Snippet<[T, number]>;
		onReorder?: (items: T[]) => void;
	} = $props();

	let dragIndex = $state<number | null>(null);
	let dropIndex = $state<number | null>(null);

	function handleDragStart(e: DragEvent, index: number) {
		dragIndex = index;
		if (e.dataTransfer) {
			e.dataTransfer.effectAllowed = 'move';
			e.dataTransfer.setData('text/plain', String(index));
		}
	}

	function handleDragOver(e: DragEvent, index: number) {
		e.preventDefault();
		if (e.dataTransfer) {
			e.dataTransfer.dropEffect = 'move';
		}
		dropIndex = index;
	}

	function handleDrop(e: DragEvent, index: number) {
		e.preventDefault();
		if (dragIndex === null || dragIndex === index) {
			dragIndex = null;
			dropIndex = null;
			return;
		}

		const newItems = [...items];
		const [moved] = newItems.splice(dragIndex, 1);
		newItems.splice(index, 0, moved);
		items = newItems;
		onReorder?.(newItems);

		dragIndex = null;
		dropIndex = null;
	}

	function handleDragEnd() {
		dragIndex = null;
		dropIndex = null;
	}
</script>

<div class="flex flex-col gap-2">
	{#each items as item, index (index)}
		<div
			role="listitem"
			draggable="true"
			ondragstart={(e) => handleDragStart(e, index)}
			ondragover={(e) => handleDragOver(e, index)}
			ondrop={(e) => handleDrop(e, index)}
			ondragend={handleDragEnd}
			class="transition-transform duration-150"
			class:scale-[1.02]={dragIndex === index}
			class:opacity-50={dragIndex === index}
			style={dropIndex === index && dragIndex !== index ? 'border: 2px dashed #667eea; background-color: #f0f2ff; border-radius: 0.5rem;' : ''}
		>
			{@render renderItem(item, index)}
		</div>
	{/each}
</div>
