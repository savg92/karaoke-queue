/**
 * User Avatar Menu Component
 *
 * Account dropdown for every logged-in user (no role gate):
 * avatar with profile picture or email initial, Change Password link,
 * and Sign Out via the canonical signOut() server action.
 * Uses the Supabase auth user only — never queries the Profile table,
 * because password/OAuth users may have no profile row (G3).
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { signOut } from '@/app/actions/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { KeyRound, LogOut } from 'lucide-react';
import { toast } from 'sonner';

type AuthUser = {
	email?: string;
	user_metadata?: { picture?: string; avatar_url?: string };
};

export function UserAvatarMenu() {
	const [user, setUser] = useState<AuthUser | null>(null);

	useEffect(() => {
		const supabase = createClient();
		supabase.auth.getUser().then(({ data }) => {
			setUser(data.user as AuthUser | null);
		});
	}, []);

	if (!user) {
		return null;
	}

	const email = user.email ?? 'Account';
	const picture = user.user_metadata?.picture ?? user.user_metadata?.avatar_url;
	const initial = (email.charAt(0) || '?').toUpperCase();

	const handleSignOut = async () => {
		try {
			await signOut();
		} catch {
			toast.error('Failed to sign out. Please try again.');
		}
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button aria-label='Account menu' className='rounded-full'>
					<Avatar>
						{picture ? <AvatarImage src={picture} alt={email} /> : null}
						<AvatarFallback>{initial}</AvatarFallback>
					</Avatar>
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align='end' className='w-56'>
				<DropdownMenuLabel className='truncate'>{email}</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild>
					<Link href='/change-password'>
						<KeyRound className='h-4 w-4 mr-2' />
						Change Password
					</Link>
				</DropdownMenuItem>
				<DropdownMenuItem onClick={handleSignOut}>
					<LogOut className='h-4 w-4 mr-2' />
					Sign Out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
