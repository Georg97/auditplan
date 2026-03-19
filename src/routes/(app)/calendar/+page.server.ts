import type { PageServerLoad, Actions } from './$types';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { fail } from '@sveltejs/kit';
import { calendarEntrySchema } from '$lib/types/calendar';

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod4(calendarEntrySchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request, locals: _locals }) => {
		const form = await superValidate(request, zod4(calendarEntrySchema));
		if (!form.valid) return fail(400, { form });

		// TODO: Save to DB via Drizzle
		// const user = locals.user;
		// const orgId = locals.session?.activeOrganizationId;

		return message(form, 'Calendar entry saved successfully');
	}
};
