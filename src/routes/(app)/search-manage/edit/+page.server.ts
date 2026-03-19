import type { PageServerLoad, Actions } from './$types';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { fail } from '@sveltejs/kit';
import { auditCreateSchema } from '$lib/types';
import { getAuditById, updateAudit } from '$lib/rpc/audits.remote';

export const load: PageServerLoad = async ({ url }) => {
	const editId = url.searchParams.get('id');
	let initialData = {};

	if (editId) {
		try {
			const audit = await getAuditById(editId);
			if (audit) {
				const { id: _, organizationId: __, createdAt: ___, updatedAt: ____, ...rest } = audit;
				initialData = rest;
			}
		} catch {
			// Remote function not yet implemented
		}
	}

	const form = await superValidate(initialData, zod4(auditCreateSchema));
	return { form, editId };
};

export const actions: Actions = {
	default: async ({ request, url }) => {
		const editId = url.searchParams.get('id');
		const form = await superValidate(request, zod4(auditCreateSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			if (editId) {
				await updateAudit({ id: editId, data: form.data });
			}
		} catch {
			return message(form, 'Fehler beim Speichern', { status: 500 });
		}

		return message(form, 'success');
	}
};
