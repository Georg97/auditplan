<script lang="ts">
	import { getContext } from 'svelte';
	import type { I18nRune } from '$lib/i18n/i18n.svelte';
	import Upload from '@lucide/svelte/icons/upload';

	const i18n = getContext<I18nRune>('i18n');

	interface Props {
		accept?: string;
		maxSizeMb?: number;
		onUpload: (file: UploadedFile) => void;
	}

	export interface UploadedFile {
		filename: string;
		size: number;
		mimeType: string;
		data: string;
		uploadedAt: Date;
	}

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

	let { accept, maxSizeMb = 5, onUpload }: Props = $props();
	let error = $state('');
	let fileInput: HTMLInputElement | undefined = $state();

	const maxSizeBytes = $derived(maxSizeMb * 1024 * 1024);
	const acceptString = $derived(accept ?? ACCEPTED_MIME_TYPES.join(','));

	function handleFileChange(e: Event) {
		error = '';
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;

		if (file.size > maxSizeBytes) {
			error = i18n.t('common.fileTooLarge', { max: maxSizeMb });
			target.value = '';
			return;
		}

		if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
			error = i18n.t('common.fileTypeNotAllowed');
			target.value = '';
			return;
		}

		const reader = new FileReader();
		reader.onload = () => {
			onUpload({
				filename: file.name,
				size: file.size,
				mimeType: file.type,
				data: reader.result as string,
				uploadedAt: new Date()
			});
			target.value = '';
		};
		reader.readAsDataURL(file);
	}
</script>

<div class="flex flex-col gap-2">
	<button
		type="button"
		class="border-muted-foreground/25 hover:bg-muted flex items-center gap-2 rounded-md border border-dashed px-4 py-3 text-sm transition-colors"
		onclick={() => fileInput?.click()}
	>
		<Upload class="h-4 w-4" />
		{i18n.t('common.uploadFile')}
	</button>
	<input bind:this={fileInput} type="file" accept={acceptString} class="hidden" onchange={handleFileChange} />
	{#if error}
		<p class="text-destructive text-sm">{error}</p>
	{/if}
</div>
