import { describe, it, expect } from 'vitest';
import { NAV_ITEMS, groupNavItems, isActiveRoute } from './nav-items';

describe('NAV_ITEMS', () => {
	it('contains exactly 12 nav items', () => {
		expect(NAV_ITEMS).toHaveLength(12);
	});

	it('every item has required fields', () => {
		for (const item of NAV_ITEMS) {
			expect(item.label).toBeTruthy();
			expect(item.icon).toBeTruthy();
			expect(item.href).toMatch(/^\//);
			expect(['overview', 'management', 'generators', 'tools']).toContain(item.group);
		}
	});

	it('all hrefs are unique', () => {
		const hrefs = NAV_ITEMS.map((item) => item.href);
		expect(new Set(hrefs).size).toBe(hrefs.length);
	});

	it('all labels are i18n keys starting with nav.', () => {
		for (const item of NAV_ITEMS) {
			expect(item.label).toMatch(/^nav\./);
		}
	});
});

describe('groupNavItems', () => {
	it('groups items into 4 groups', () => {
		const groups = groupNavItems(NAV_ITEMS);
		expect(groups).toHaveLength(4);
	});

	it('preserves all items across groups', () => {
		const groups = groupNavItems(NAV_ITEMS);
		const total = groups.reduce((sum, g) => sum + g.items.length, 0);
		expect(total).toBe(NAV_ITEMS.length);
	});

	it('group labels are i18n keys', () => {
		const groups = groupNavItems(NAV_ITEMS);
		for (const group of groups) {
			expect(group.label).toMatch(/^nav\.group\./);
		}
	});

	it('filters out empty groups', () => {
		const groups = groupNavItems([]);
		expect(groups).toHaveLength(0);
	});
});

describe('isActiveRoute', () => {
	it('matches exact path', () => {
		expect(isActiveRoute('/dashboard', '/dashboard')).toBe(true);
	});

	it('does not match different path', () => {
		expect(isActiveRoute('/calendar', '/dashboard')).toBe(false);
	});

	it('matches overview for root path', () => {
		expect(isActiveRoute('/', '/overview')).toBe(true);
		expect(isActiveRoute('/overview', '/overview')).toBe(true);
	});

	it('matches sub-paths', () => {
		expect(isActiveRoute('/auditor-management/123', '/auditor-management')).toBe(true);
	});

	it('does not match partial prefix', () => {
		expect(isActiveRoute('/action-plan-extra', '/action-plan')).toBe(false);
	});
});
