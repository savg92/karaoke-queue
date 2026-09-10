'use server';

import { updatePassword as canonicalUpdatePassword } from '@/app/actions/auth';

// Thin wrapper around the canonical updatePassword action.
// Preserves the canonical arg order (newPassword, currentPassword?) — see G1.
// Exists so the (auth) route colocates its server actions; all Supabase logic
// lives in src/app/actions/auth.ts.
export async function updatePassword(
	newPassword: string,
	currentPassword?: string
): Promise<{ success: boolean; error?: string }> {
	return canonicalUpdatePassword(newPassword, currentPassword);
}
