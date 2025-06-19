import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function AccountPage() {
	const supabase = createClient();

	const { data, error } = await supabase.auth.getUser();
	if (error || !data?.user) {
		redirect('/login');
	}

	return (
		<div>
			<h1>Welcome, {data.user.email}</h1>
			<form
				action='/auth/signout'
				method='post'
			>
				<button type='submit'>Logout</button>
			</form>
		</div>
	);
}
