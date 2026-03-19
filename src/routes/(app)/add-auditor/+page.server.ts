import { fail, message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { auditorSchema } from '$lib/types/auditor';
import { addAuditor, editAuditor, getAuditorById } from '$lib/rpc/auditoren.remote';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		const { redirect } = await import('@sveltejs/kit');
		redirect(302, '/login');
	}

	const editId = url.searchParams.get('edit');

	if (editId) {
		const existing = await getAuditorById(editId);
		if (existing) {
			const { id: _id, organizationId: _orgId, createdAt: _ca, updatedAt: _ua, ...raw } = existing;
			// Convert null values to undefined for Zod compatibility
			const formData = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, v === null ? undefined : v]));
			return {
				form: await superValidate(formData, zod4(auditorSchema)),
				editId
			};
		}
	}

	return {
		form: await superValidate(zod4(auditorSchema)),
		editId: null
	};
};

export const actions: Actions = {
	default: async ({ request, locals, url }) => {
		if (!locals.user) {
			const { redirect } = await import('@sveltejs/kit');
			redirect(302, '/login');
		}

		const form = await superValidate(request, zod4(auditorSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const editId = url.searchParams.get('edit');

		if (editId) {
			await editAuditor({ id: editId, data: form.data });
		} else {
			await addAuditor(form.data);
		}

		return message(form, 'success');
	}
};
