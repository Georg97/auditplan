import { describe, it, expect } from 'vitest';
import { NAV_ITEMS, type NavItem } from './nav-items';

describe('NAV_ITEMS', () => {
	it('should contain 12 navigation items', () => {
		expect(NAV_ITEMS).toHaveLength(12);
	});

	it('should have unique ids', () => {
		const ids = NAV_ITEMS.map((item) => item.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it('should have unique hrefs', () => {
		const hrefs = NAV_ITEMS.map((item) => item.href);
		expect(new Set(hrefs).size).toBe(hrefs.length);
	});

	it('all hrefs should start with /', () => {
		NAV_ITEMS.forEach((item) => {
			expect(item.href).toMatch(/^\//);
		});
	});

	it('all items should have i18n label keys starting with nav.', () => {
		NAV_ITEMS.forEach((item) => {
			expect(item.labelKey).toMatch(/^nav\./);
		});
	});

	it('should include expected routes', () => {
		const hrefs = NAV_ITEMS.map((item) => item.href);
		expect(hrefs).toContain('/overview');
		expect(hrefs).toContain('/dashboard');
		expect(hrefs).toContain('/auditor-management');
		expect(hrefs).toContain('/plan-generator');
		expect(hrefs).toContain('/action-plan');
	});

	it('items should conform to NavItem interface', () => {
		NAV_ITEMS.forEach((item: NavItem) => {
			expect(typeof item.id).toBe('string');
			expect(typeof item.labelKey).toBe('string');
			expect(typeof item.icon).toBe('string');
			expect(typeof item.href).toBe('string');
		});
	});
});
