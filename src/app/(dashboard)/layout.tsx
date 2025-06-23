import { ReactQueryProvider } from '@/lib/react-query';
import { ThemeToggle } from '@/components/theme-toggle';
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
					<div className='container mx-auto flex items-center justify-between px-4 py-4'>
						<Link href='/dashboard'>
							<h2 className='text-lg font-semibold'>
								Karaoke Queue - Host Dashboard
							</h2>
						</Link>
						<ThemeToggle />
					</div>
				</header>
				<main>{children}</main>
				<Toaster />
			</div>
		</ReactQueryProvider>
	);
}
