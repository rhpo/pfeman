// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

import type { User } from '$lib/server/auth/types';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			/** The authenticated user, or null if not logged in. */
			user: User | null;
		}
		interface PageData {
			/** The authenticated user, passed from the root layout server load. */
			user: User | null;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
