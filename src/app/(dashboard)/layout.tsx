import { ReactQueryProvider } from '@/lib/react-query';
import Link from 'next/link';
import { Toaster } from 'sonner';

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<ReactQueryProvider>
			<div className='min-h-screen bg-background'>
				<header className='border-b'>
					<div className='container mx-auto px-4 py-4'>
                        <Link href='/dashboard'>
							<h2 className='text-lg font-semibold'>
								Karaoke Queue - Host Dashboard
							</h2>
						</Link>
					</div>
				</header>
				<main>{children}</main>
				<Toaster />
			</div>
		</ReactQueryProvider>
	);
}
