/**
 * Reusable drag-and-drop utilities for block sorting.
 * Used in audit plan and notes generators.
 */

export interface DragState {
	isDragging: boolean;
	dragIndex: number | null;
	dropIndex: number | null;
}

export function createDragState(): DragState {
	return {
		isDragging: false,
		dragIndex: null,
		dropIndex: null
	};
}

export function handleDragStart(state: DragState, index: number): DragState {
	return {
		isDragging: true,
		dragIndex: index,
		dropIndex: null
	};
}

export function handleDragOver(e: DragEvent, state: DragState, index: number): DragState {
	e.preventDefault();
	return {
		...state,
		dropIndex: index
	};
}

export function handleDrop<T>(items: T[], state: DragState, dropIndex: number): T[] {
	const { dragIndex } = state;
	if (dragIndex === null || dragIndex === dropIndex) return items;

	const result = [...items];
	const [moved] = result.splice(dragIndex, 1);
	result.splice(dropIndex, 0, moved);
	return result;
}

export function handleDragEnd(): DragState {
	return createDragState();
}

/**
 * Reorder an array by moving an item from one index to another.
 * Recalculates position fields (0, 1, 2...) on the result.
 */
export function reorderWithPositions<T extends { position: number }>(items: T[], fromIndex: number, toIndex: number): T[] {
	if (fromIndex === toIndex) return items;

	const result = [...items];
	const [moved] = result.splice(fromIndex, 1);
	result.splice(toIndex, 0, moved);

	return result.map((item, i) => ({ ...item, position: i }));
}
