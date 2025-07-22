/**
 * Skeleton Loading Components for Role Monitoring Dashboard
 * Provides smooth loading states while data is being fetched
 */

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function AnalyticsCardsSkeleton() {
	return (
		<div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
			{[...Array(4)].map((_, i) => (
				<Card key={i}>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<Skeleton className='h-4 w-24' />
						<Skeleton className='h-4 w-4' />
					</CardHeader>
					<CardContent>
						<Skeleton className='h-8 w-16' />
					</CardContent>
				</Card>
			))}
		</div>
	);
}

export function RoleDistributionSkeleton() {
	return (
		<Card>
			<CardHeader>
				<Skeleton className='h-6 w-32' />
				<Skeleton className='h-4 w-48' />
			</CardHeader>
			<CardContent>
				<div className='grid grid-cols-2 md:grid-cols-5 gap-4'>
					{[...Array(5)].map((_, i) => (
						<div
							key={i}
							className='text-center'
						>
							<Skeleton className='h-6 w-20 mx-auto mb-2' />
							<Skeleton className='h-8 w-8 mx-auto' />
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}

export function UserTableSkeleton() {
	return (
		<Card>
			<CardHeader>
				<Skeleton className='h-6 w-32' />
				<Skeleton className='h-4 w-48' />
			</CardHeader>
			<CardContent>
				<div className='space-y-3'>
					{/* Table header */}
					<div className='grid grid-cols-5 gap-4 pb-2 border-b'>
						<Skeleton className='h-4 w-16' />
						<Skeleton className='h-4 w-24' />
						<Skeleton className='h-4 w-20' />
						<Skeleton className='h-4 w-16' />
						<Skeleton className='h-4 w-16' />
					</div>
					{/* Table rows */}
					{[...Array(5)].map((_, i) => (
						<div
							key={i}
							className='grid grid-cols-5 gap-4 py-2'
						>
							<Skeleton className='h-4 w-24' />
							<Skeleton className='h-4 w-32' />
							<Skeleton className='h-6 w-16' />
							<Skeleton className='h-4 w-20' />
							<Skeleton className='h-8 w-20' />
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}

export function RecentEventsSkeleton() {
	return (
		<Card>
			<CardHeader>
				<Skeleton className='h-6 w-36' />
				<Skeleton className='h-4 w-48' />
			</CardHeader>
			<CardContent>
				<div className='space-y-3'>
					{/* Table header */}
					<div className='grid grid-cols-6 gap-4 pb-2 border-b'>
						<Skeleton className='h-4 w-20' />
						<Skeleton className='h-4 w-16' />
						<Skeleton className='h-4 w-16' />
						<Skeleton className='h-4 w-16' />
						<Skeleton className='h-4 w-20' />
						<Skeleton className='h-4 w-24' />
					</div>
					{/* Table rows */}
					{[...Array(8)].map((_, i) => (
						<div
							key={i}
							className='grid grid-cols-6 gap-4 py-2'
						>
							<Skeleton className='h-6 w-24' />
							<Skeleton className='h-4 w-28' />
							<Skeleton className='h-6 w-16' />
							<Skeleton className='h-4 w-4' />
							<Skeleton className='h-4 w-24' />
							<Skeleton className='h-4 w-20' />
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}

export function SuspiciousActivitySkeleton() {
	return (
		<Card>
			<CardHeader>
				<div className='flex items-center space-x-2'>
					<Skeleton className='h-5 w-5' />
					<Skeleton className='h-6 w-32' />
				</div>
				<Skeleton className='h-4 w-64' />
			</CardHeader>
			<CardContent>
				<div className='space-y-4'>
					<div>
						<Skeleton className='h-4 w-40 mb-2' />
						<div className='space-y-2'>
							{[...Array(3)].map((_, i) => (
								<div
									key={i}
									className='flex justify-between items-center p-2 bg-gray-50 rounded'
								>
									<Skeleton className='h-4 w-32' />
									<Skeleton className='h-6 w-24' />
								</div>
							))}
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
