<script lang="ts">
	import GripVertical from '@lucide/svelte/icons/grip-vertical';

	let {
		index,
		onDragStart,
		onDragOver,
		onDrop,
		onDragEnd
	}: {
		index: number;
		onDragStart: (index: number) => void;
		onDragOver: (e: DragEvent, index: number) => void;
		onDrop: (index: number) => void;
		onDragEnd: () => void;
	} = $props();
</script>

<div
	role="button"
	tabindex="0"
	draggable="true"
	class="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
	ondragstart={() => onDragStart(index)}
	ondragover={(e: DragEvent) => onDragOver(e, index)}
	ondrop={() => onDrop(index)}
	ondragend={() => onDragEnd()}
	onkeydown={(e: KeyboardEvent) => {
		if (e.key === 'ArrowUp' && index > 0) {
			onDragStart(index);
			onDrop(index - 1);
			onDragEnd();
		} else if (e.key === 'ArrowDown') {
			onDragStart(index);
			onDrop(index + 1);
			onDragEnd();
		}
	}}
>
	<GripVertical class="h-5 w-5" />
</div>
