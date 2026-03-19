<script lang="ts">
	import AuditForm from '$lib/components/AuditForm.svelte';

	let { data } = $props();
</script>

<AuditForm formData={data.form} editId={data.editId} />
