/**
 * Svelte action for HTML5 drag-and-drop reordering of block lists.
 * Usage: <div use:draggableList={{ items, onReorder }}>
 *          {#each items as item, i}
 *            <div use:draggableItem={{ index: i }}>...</div>
 *          {/each}
 *        </div>
 */

export interface DragState {
	isDragging: boolean;
	dragIndex: number | null;
	dropIndex: number | null;
}

export function createDragState(): DragState {
	return { isDragging: false, dragIndex: null, dropIndex: null };
}

export interface DraggableItemParams {
	index: number;
	state: DragState;
	onReorder: (fromIndex: number, toIndex: number) => void;
}

export function draggableItem(node: HTMLElement, params: DraggableItemParams) {
	let { index, state, onReorder } = params;

	node.draggable = true;

	function handleDragStart(e: DragEvent) {
		state.isDragging = true;
		state.dragIndex = index;
		if (e.dataTransfer) {
			e.dataTransfer.effectAllowed = 'move';
			e.dataTransfer.setData('text/plain', String(index));
		}
		node.style.opacity = '0.5';
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		if (e.dataTransfer) {
			e.dataTransfer.dropEffect = 'move';
		}
		state.dropIndex = index;
		node.style.borderTop = index !== state.dragIndex ? '2px solid hsl(var(--primary))' : '';
	}

	function handleDragLeave() {
		node.style.borderTop = '';
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		node.style.borderTop = '';
		const fromIndex = state.dragIndex;
		if (fromIndex !== null && fromIndex !== index) {
			onReorder(fromIndex, index);
		}
	}

	function handleDragEnd() {
		state.isDragging = false;
		state.dragIndex = null;
		state.dropIndex = null;
		node.style.opacity = '';
		node.style.borderTop = '';
	}

	node.addEventListener('dragstart', handleDragStart);
	node.addEventListener('dragover', handleDragOver);
	node.addEventListener('dragleave', handleDragLeave);
	node.addEventListener('drop', handleDrop);
	node.addEventListener('dragend', handleDragEnd);

	return {
		update(newParams: DraggableItemParams) {
			index = newParams.index;
			state = newParams.state;
			onReorder = newParams.onReorder;
		},
		destroy() {
			node.removeEventListener('dragstart', handleDragStart);
			node.removeEventListener('dragover', handleDragOver);
			node.removeEventListener('dragleave', handleDragLeave);
			node.removeEventListener('drop', handleDrop);
			node.removeEventListener('dragend', handleDragEnd);
		}
	};
}

/** Reorder an array by moving element from one index to another */
export function reorderArray<T>(arr: T[], fromIndex: number, toIndex: number): T[] {
	const result = [...arr];
	const [moved] = result.splice(fromIndex, 1);
	result.splice(toIndex, 0, moved);
	return result;
}
