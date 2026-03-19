import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { organization } from 'better-auth/plugins';
import { db } from '$lib/server/db';
import * as schema from '../db/schema';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';
import { env } from '$env/dynamic/private';

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: 'sqlite',
		schema
	}),
	baseURL: env.BETTER_AUTH_URL,
	emailAndPassword: {
		enabled: true
	},
	socialProviders: {
		google: {
			clientId: env.GOOGLE_CLIENT_ID as string,
			clientSecret: env.GOOGLE_CLIENT_SECRET as string
		}
	},
	plugins: [
		organization({
			allowUserToCreateOrganization: true
		}),
		sveltekitCookies(getRequestEvent) // must be last
	]
});
