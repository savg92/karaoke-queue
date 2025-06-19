'use client';

import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
	const supabase = createClient();

	const handleLogin = async () => {
		await supabase.auth.signInWithOAuth({
			provider: 'google',
			options: {
				redirectTo: `${location.origin}/auth/callback`,
			},
		});
	};

	return (
		<div>
			<h1>Login</h1>
			<Button onClick={handleLogin}>Login with Google</Button>
		</div>
	);
}
