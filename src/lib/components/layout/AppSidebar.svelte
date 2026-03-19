<script lang="ts">
	import { getContext } from 'svelte';
	import { page } from '$app/state';
	import type { I18nRune } from '$lib/i18n/i18n.svelte';
	import { NAV_ITEMS, groupNavItems, isActiveRoute } from './nav-items';
	import Settings from '@lucide/svelte/icons/settings';
	import LogOut from '@lucide/svelte/icons/log-out';
	import * as Sidebar from '$lib/components/ui/sidebar';

	const i18n = getContext<I18nRune>('i18n');
	const user = getContext<{ name: string; email: string }>('user');

	const groups = groupNavItems(NAV_ITEMS);
</script>

<Sidebar.Root collapsible="icon">
	<Sidebar.Header>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton size="lg">
					{#snippet child({ props })}
						<a href="/overview" {...props}>
							<div class="bg-brand flex aspect-square size-8 items-center justify-center rounded-lg text-white">
								<span class="text-sm font-bold">AM</span>
							</div>
							<div class="grid flex-1 text-left text-sm leading-tight">
								<span class="truncate font-semibold">{i18n.t('app.name')}</span>
								<span class="text-muted-foreground truncate text-xs">{i18n.t('app.subtitle')}</span>
							</div>
						</a>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Header>

	<Sidebar.Content>
		{#each groups as group}
			<Sidebar.Group>
				<Sidebar.GroupLabel>{i18n.t(group.label)}</Sidebar.GroupLabel>
				<Sidebar.GroupContent>
					<Sidebar.Menu>
						{#each group.items as item}
							<Sidebar.MenuItem>
								<Sidebar.MenuButton isActive={isActiveRoute(page.url.pathname, item.href)} tooltipContent={i18n.t(item.label)}>
									{#snippet child({ props })}
										<a href={item.href} {...props}>
											<item.icon />
											<span>{i18n.t(item.label)}</span>
										</a>
									{/snippet}
								</Sidebar.MenuButton>
							</Sidebar.MenuItem>
						{/each}
					</Sidebar.Menu>
				</Sidebar.GroupContent>
			</Sidebar.Group>
		{/each}
	</Sidebar.Content>

	<Sidebar.Footer>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton tooltipContent={i18n.t('nav.settings')}>
					{#snippet child({ props })}
						<button {...props}>
							<Settings />
							<span>{i18n.t('nav.settings')}</span>
						</button>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton>
					{#snippet child({ props })}
						<a href="/login" {...props}>
							<div class="bg-muted flex size-6 items-center justify-center rounded-full text-xs font-medium">
								{user?.name?.[0]?.toUpperCase() ?? 'U'}
							</div>
							<div class="grid flex-1 text-left text-sm leading-tight">
								<span class="truncate font-semibold">{user?.name ?? ''}</span>
								<span class="text-muted-foreground truncate text-xs">{user?.email ?? ''}</span>
							</div>
							<LogOut class="text-muted-foreground ml-auto size-4" />
						</a>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Footer>

	<Sidebar.Rail />
</Sidebar.Root>
