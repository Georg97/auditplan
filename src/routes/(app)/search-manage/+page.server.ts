import type { PageServerLoad, Actions } from './$types';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { fail } from '@sveltejs/kit';
import { auditSchema } from '$lib/types/audit';

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod4(auditSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod4(auditSchema));
		if (!form.valid) return fail(400, { form });
		// TODO: Save to DB
		return message(form, 'Audit saved successfully');
	}
};
