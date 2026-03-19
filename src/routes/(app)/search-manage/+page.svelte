<script lang="ts">
	import { getContext } from 'svelte';
	import type { I18nRune } from '$lib/i18n/i18n.svelte';
	import type { Audit } from '$lib/types/audit';
	import { AUDIT_STATUSES } from '$lib/types/audit';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Badge } from '$lib/components/ui/badge';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { toast } from 'svelte-sonner';
	import Plus from '@lucide/svelte/icons/plus';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Search from '@lucide/svelte/icons/search';
	import Calendar from '@lucide/svelte/icons/calendar';

	const i18n = getContext<I18nRune>('i18n');

	let audits = $state<Audit[]>([]);
	let searchQuery = $state('');
	let statusFilter = $state<string>('all');
	let auditToDelete = $state<Audit | null>(null);

	let filteredAudits = $derived(
		audits.filter((audit) => {
			const matchesSearch =
				searchQuery === '' ||
				audit.auditName.toLowerCase().includes(searchQuery.toLowerCase()) ||
				audit.unternehmen.toLowerCase().includes(searchQuery.toLowerCase()) ||
				audit.abteilung.toLowerCase().includes(searchQuery.toLowerCase());
			const matchesStatus = statusFilter === 'all' || audit.status === statusFilter;
			return matchesSearch && matchesStatus;
		})
	);

	function getStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
		switch (status) {
			case 'completed':
				return 'default';
			case 'cancelled':
				return 'destructive';
			default:
				return 'secondary';
		}
	}

	function getStatusClass(status: string): string {
		switch (status) {
			case 'in_progress':
				return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
			case 'completed':
				return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
			case 'postponed':
				return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
			default:
				return '';
		}
	}

	function handleDelete() {
		if (!auditToDelete) return;
		audits = audits.filter((a) => a.id !== auditToDelete!.id);
		toast.success(i18n.t('audit.deletedSuccess'));
		auditToDelete = null;
	}
</script>

<div class="space-y-6">
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<h1 class="text-2xl font-bold" style="font-family: var(--font-display)">
			{i18n.t('nav.searchManage')}
		</h1>
		<Button>
			<Plus class="mr-2 h-4 w-4" />
			{i18n.t('audit.addTitle')}
		</Button>
	</div>

	<div class="relative">
		<Search class="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
		<Input type="text" placeholder={i18n.t('audit.searchPlaceholder')} class="pl-10" bind:value={searchQuery} />
	</div>

	<div class="flex flex-wrap gap-2">
		<Button variant={statusFilter === 'all' ? 'default' : 'outline'} size="sm" onclick={() => (statusFilter = 'all')}>
			{i18n.t('audit.allStatuses')}
		</Button>
		{#each AUDIT_STATUSES as status}
			<Button variant={statusFilter === status ? 'default' : 'outline'} size="sm" onclick={() => (statusFilter = status)}>
				{i18n.t(`audit.status.${status}`)}
			</Button>
		{/each}
	</div>

	{#if filteredAudits.length === 0}
		<div class="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
			<Calendar class="text-muted-foreground mb-4 h-12 w-12" />
			<p class="text-muted-foreground text-lg font-medium">
				{i18n.t('audit.noAudits')}
			</p>
			<p class="text-muted-foreground mt-1 text-sm">
				{i18n.t('audit.noAuditsHint')}
			</p>
		</div>
	{:else}
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each filteredAudits as audit (audit.id)}
				<Card.Root>
					<Card.Header class="pb-3">
						<div class="flex items-start justify-between gap-2">
							<Card.Title class="text-base leading-tight font-semibold">
								{audit.auditName}
							</Card.Title>
							<div class="flex shrink-0 gap-1">
								<Button variant="ghost" size="icon" class="h-8 w-8">
									<Pencil class="h-4 w-4" />
								</Button>
								<Button variant="ghost" size="icon" class="text-destructive h-8 w-8" onclick={() => (auditToDelete = audit)}>
									<Trash2 class="h-4 w-4" />
								</Button>
							</div>
						</div>
						<div class="flex flex-wrap gap-1.5 pt-1">
							<Badge variant="outline">
								{i18n.t(`audit.type.${audit.auditTyp}`)}
							</Badge>
							<Badge variant={getStatusVariant(audit.status)} class={getStatusClass(audit.status)}>
								{i18n.t(`audit.status.${audit.status}`)}
							</Badge>
						</div>
					</Card.Header>
					<Card.Content class="space-y-1.5 text-sm">
						<p class="text-muted-foreground">
							<span class="text-foreground font-medium">{audit.unternehmen}</span>
							&middot; {audit.abteilung}
						</p>
						<p class="text-muted-foreground flex items-center gap-1.5">
							<Calendar class="h-3.5 w-3.5" />
							{audit.startDatum}
						</p>
					</Card.Content>
				</Card.Root>
			{/each}
		</div>
	{/if}
</div>

<AlertDialog.Root
	open={auditToDelete !== null}
	onOpenChange={(open) => {
		if (!open) auditToDelete = null;
	}}
>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>{i18n.t('audit.deleteConfirmTitle')}</AlertDialog.Title>
			<AlertDialog.Description>
				{i18n.t('audit.deleteConfirmMessage', { name: auditToDelete?.auditName ?? '' })}
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>{i18n.t('common.cancel')}</AlertDialog.Cancel>
			<AlertDialog.Action onclick={handleDelete}>
				{i18n.t('common.delete')}
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
