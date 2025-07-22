import { ReactQueryProvider } from '@/lib/react-query';
import { ThemeToggle } from '@/components/theme-toggle';
import { AdminHeaderMenu } from './components/AdminHeaderMenu';
import Link from 'next/link';
import { Toaster } from 'sonner';
import React from 'react';
import { RBACDebugGate } from './components/RBACDebugGate';

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
						<div className='flex items-center gap-4'>
							<AdminHeaderMenu />
							<ThemeToggle />
						</div>
					</div>
				</header>
				<main>
					<div className='container mx-auto px-4 py-4'>
						<RBACDebugGate />
					</div>
					{children}
				</main>
				<Toaster />
			</div>
		</ReactQueryProvider>
	);
}
