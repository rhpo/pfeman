import type { LayoutServerLoad } from './$types';

/** Root layout server load – makes the authenticated user available to all pages. */
export const load: LayoutServerLoad = async ({ locals }) => {
    return {
        user: locals.user
    };
};
