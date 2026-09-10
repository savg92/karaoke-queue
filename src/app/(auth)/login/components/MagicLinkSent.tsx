'use client';

import { Button } from '@/components/ui/button';
import { MailCheck } from 'lucide-react';

export function MagicLinkSent({ onResend }: { onResend: () => void }) {
	return (
		<div className='flex flex-col items-center gap-4 text-center'>
			<MailCheck className='h-12 w-12 text-primary' />
			<h2 className='text-xl font-semibold'>Check your email</h2>
			<p className='text-sm text-muted-foreground'>
				We sent you a magic link to sign in. Click the link in the email to
				continue.
			</p>
			<Button variant='outline' onClick={onResend}>
				Use a different email
			</Button>
		</div>
	);
}
