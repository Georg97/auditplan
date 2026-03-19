<script lang="ts">
	import { getContext } from 'svelte';
	import type { I18nRune } from '$lib/i18n/i18n.svelte';
	import Upload from '@lucide/svelte/icons/upload';
	import X from '@lucide/svelte/icons/x';
	import File from '@lucide/svelte/icons/file';
	import { Button } from '$lib/components/ui/button';

	const i18n = getContext<I18nRune>('i18n');

	const ACCEPTED_MIME_TYPES = [
		'application/pdf',
		'application/msword',
		'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
		'application/vnd.ms-excel',
		'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
		'application/vnd.ms-powerpoint',
		'application/vnd.openxmlformats-officedocument.presentationml.presentation',
		'text/plain',
		'image/jpeg',
		'image/png'
	];

	const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

	let {
		files = $bindable([]),
		onUpload,
		onRemove
	}: {
		files: UploadedFile[];
		onUpload?: (file: UploadedFile) => void;
		onRemove?: (fileId: string) => void;
	} = $props();

	export interface UploadedFile {
		id: string;
		filename: string;
		size: number;
		mimeType: string;
		data: string;
		uploadedAt: Date;
	}

	let dragOver = $state(false);
	let errorMessage = $state('');

	function formatFileSize(bytes: number): string {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	}

	function validateFile(file: globalThis.File): string | null {
		if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
			return i18n.t('validation.invalidFileType');
		}
		if (file.size > MAX_FILE_SIZE) {
			return i18n.t('validation.fileTooLarge');
		}
		return null;
	}

	async function processFile(file: globalThis.File): Promise<UploadedFile | null> {
		const error = validateFile(file);
		if (error) {
			errorMessage = error;
			return null;
		}

		return new Promise((resolve) => {
			const reader = new FileReader();
			reader.onload = () => {
				resolve({
					id: crypto.randomUUID(),
					filename: file.name,
					size: file.size,
					mimeType: file.type,
					data: reader.result as string,
					uploadedAt: new Date()
				});
			};
			reader.onerror = () => {
				errorMessage = i18n.t('validation.fileReadError');
				resolve(null);
			};
			reader.readAsDataURL(file);
		});
	}

	async function handleFiles(fileList: FileList | null) {
		if (!fileList) return;
		errorMessage = '';

		for (const file of Array.from(fileList)) {
			const uploaded = await processFile(file);
			if (uploaded) {
				files = [...files, uploaded];
				onUpload?.(uploaded);
			}
		}
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		dragOver = false;
		handleFiles(e.dataTransfer?.files ?? null);
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		dragOver = true;
	}

	function handleDragLeave() {
		dragOver = false;
	}

	function handleInputChange(e: Event) {
		const input = e.target as HTMLInputElement;
		handleFiles(input.files);
		input.value = '';
	}

	function removeFile(fileId: string) {
		files = files.filter((f) => f.id !== fileId);
		onRemove?.(fileId);
	}
</script>

<div class="space-y-3">
	<div
		role="button"
		tabindex="0"
		ondrop={handleDrop}
		ondragover={handleDragOver}
		ondragleave={handleDragLeave}
		class="border-muted-foreground/25 hover:border-brand flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors {dragOver
			? 'border-brand bg-brand/5'
			: ''}"
	>
		<Upload class="text-muted-foreground mb-2 h-8 w-8" />
		<p class="text-muted-foreground text-sm">
			{i18n.t('common.dragDropOrClick')}
		</p>
		<p class="text-muted-foreground/70 text-xs">
			{i18n.t('common.maxFileSize', { size: '5 MB' })}
		</p>
		<input type="file" accept={ACCEPTED_MIME_TYPES.join(',')} multiple onchange={handleInputChange} class="absolute inset-0 cursor-pointer opacity-0" />
	</div>

	{#if errorMessage}
		<p class="text-destructive text-sm">{errorMessage}</p>
	{/if}

	{#if files.length > 0}
		<ul class="space-y-2">
			{#each files as file (file.id)}
				<li class="bg-muted flex items-center justify-between rounded-md px-3 py-2">
					<div class="flex items-center gap-2">
						<File class="text-muted-foreground h-4 w-4" />
						<span class="text-sm font-medium">{file.filename}</span>
						<span class="text-muted-foreground text-xs">({formatFileSize(file.size)})</span>
					</div>
					<Button variant="ghost" size="icon" onclick={() => removeFile(file.id)}>
						<X class="h-4 w-4" />
					</Button>
				</li>
			{/each}
		</ul>
	{/if}
</div>
