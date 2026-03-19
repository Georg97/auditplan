<script lang="ts">
	import { getContext } from 'svelte';
	import type { I18nRune } from '$lib/i18n/i18n.svelte';
	import Upload from '@lucide/svelte/icons/upload';
	import { toast } from 'svelte-sonner';

	const i18n = getContext<I18nRune>('i18n');

	const ACCEPTED_TYPES = [
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
		onUpload,
		accept = ACCEPTED_TYPES.join(',')
	}: {
		onUpload: (file: { filename: string; size: number; mimeType: string; data: string }) => void;
		accept?: string;
	} = $props();

	let fileInput: HTMLInputElement | undefined = $state();
	let isDragOver = $state(false);

	function validateFile(file: File): boolean {
		if (!ACCEPTED_TYPES.includes(file.type)) {
			toast.error(i18n.t('upload.invalidType'));
			return false;
		}
		if (file.size > MAX_FILE_SIZE) {
			toast.error(i18n.t('upload.tooLarge'));
			return false;
		}
		return true;
	}

	function readFileAsBase64(file: File): Promise<string> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => {
				const result = reader.result as string;
				const base64 = result.split(',')[1];
				resolve(base64);
			};
			reader.onerror = reject;
			reader.readAsDataURL(file);
		});
	}

	async function handleFiles(files: FileList | null) {
		if (!files || files.length === 0) return;

		for (const file of files) {
			if (!validateFile(file)) continue;

			const data = await readFileAsBase64(file);
			onUpload({
				filename: file.name,
				size: file.size,
				mimeType: file.type,
				data
			});
		}
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		isDragOver = false;
		handleFiles(e.dataTransfer?.files ?? null);
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		isDragOver = true;
	}

	function handleDragLeave() {
		isDragOver = false;
	}
</script>

<div
	class="border-border hover:border-primary/50 flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed p-6 transition-colors {isDragOver
		? 'border-primary bg-primary/5'
		: ''}"
	role="button"
	tabindex="0"
	ondrop={handleDrop}
	ondragover={handleDragOver}
	ondragleave={handleDragLeave}
	onclick={() => fileInput?.click()}
	onkeydown={(e: KeyboardEvent) => {
		if (e.key === 'Enter' || e.key === ' ') fileInput?.click();
	}}
>
	<Upload class="text-muted-foreground h-8 w-8" />
	<p class="text-muted-foreground text-sm">{i18n.t('upload.dropOrClick')}</p>
	<p class="text-muted-foreground text-xs">{i18n.t('upload.maxSize')}</p>
	<input bind:this={fileInput} type="file" {accept} class="hidden" onchange={(e) => handleFiles((e.target as HTMLInputElement).files)} multiple />
</div>
