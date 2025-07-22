'use server';

import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@/lib/rbac/types-fixed';

/**
 * Server action to get the current user's role
 */
export async function getCurrentUserRole(): Promise<{ role: UserRole | null; error?: string }> {
  console.log('[SERVER ACTION] getCurrentUserRole called');
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    console.log('[SERVER ACTION] User from Supabase:', user?.id, user?.email);
    
    if (!user) {
      console.log('[SERVER ACTION] No authenticated user');
      return { role: null, error: 'No authenticated user' };
    }

    // Use Prisma to get the user's role (bypasses RLS issues)
    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
      select: { role: true }
    });

    console.log('[SERVER ACTION] Profile from Prisma:', profile);

    if (!profile) {
      console.log('[SERVER ACTION] Profile not found');
      return { role: null, error: 'Profile not found' };
    }

    console.log('[SERVER ACTION] Returning role:', profile.role);
    return { role: profile.role };
  } catch (error) {
    console.error('[SERVER ACTION] Error getting user role:', error);
    return { role: null, error: 'Failed to get user role' };
  }
}
