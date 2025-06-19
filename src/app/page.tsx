import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function Home() {
	const supabase = createClient();

	const { data } = await supabase.auth.getUser();

	return (
		<div>
			<h1>Karaoke Queue</h1>
			{data.user ? (
				<p>
					Welcome, {data.user.email}!{' '}
					<Link href='/account'>Go to your account</Link>
				</p>
			) : (
				<p>
					<Link href='/login'>Login</Link> to get started.
				</p>
			)}
		</div>
	);
}
