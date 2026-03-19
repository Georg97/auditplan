import type { PageServerLoad, Actions } from './$types';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { fail } from '@sveltejs/kit';
import { auditCreateSchema } from '$lib/types';
import { addAudit } from '$lib/rpc/audits.remote';

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod4(auditCreateSchema));
	return { form, editId: null };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod4(auditCreateSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			await addAudit(form.data);
		} catch {
			return message(form, 'Fehler beim Speichern', { status: 500 });
		}

		return message(form, 'success');
	}
};
