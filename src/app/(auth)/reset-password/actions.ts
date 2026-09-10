'use server';

import { resetPassword as canonicalResetPassword } from '@/app/actions/auth';

// Thin wrapper around the canonical resetPassword action.
// Exists so the (auth) route colocates its server actions; all Supabase logic
// lives in src/app/actions/auth.ts.
export async function resetPassword(
	email: string
): Promise<{ success: boolean; error?: string }> {
	return canonicalResetPassword(email);
}
