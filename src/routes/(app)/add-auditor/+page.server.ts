import type { Actions, PageServerLoad } from './$types';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { fail } from '@sveltejs/kit';
import { auditorSchema } from '$lib/types/auditor';

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod4(auditorSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request, locals: _locals }) => {
		const form = await superValidate(request, zod4(auditorSchema));
		if (!form.valid) return fail(400, { form });

		// TODO: Save to DB via Drizzle
		// const user = locals.user;
		// const orgId = locals.session?.activeOrganizationId;

		return message(form, 'Auditor saved successfully');
	}
};
