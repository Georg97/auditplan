import type { PageServerLoad, Actions } from './$types';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { fail } from '@sveltejs/kit';
import { auditorCreateSchema } from '$lib/types';
import { getAuditorById, addAuditor, updateAuditor } from '$lib/rpc/auditors.remote';

export const load: PageServerLoad = async ({ url }) => {
	const editId = url.searchParams.get('edit');
	let initialData = {};

	if (editId) {
		try {
			const auditor = await getAuditorById(editId);
			if (auditor) {
				const { id: _, organizationId: __, createdAt: ___, updatedAt: ____, ...rest } = auditor;
				initialData = rest;
			}
		} catch {
			// Remote function not yet implemented — use empty form
		}
	}

	const form = await superValidate(initialData, zod4(auditorCreateSchema));
	return { form, editId };
};

export const actions: Actions = {
	default: async ({ request, url }) => {
		const editId = url.searchParams.get('edit');
		const form = await superValidate(request, zod4(auditorCreateSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			if (editId) {
				await updateAuditor({ id: editId, data: form.data });
			} else {
				await addAuditor(form.data);
			}
		} catch {
			return message(form, 'Fehler beim Speichern', { status: 500 });
		}

		return message(form, 'success');
	}
};
