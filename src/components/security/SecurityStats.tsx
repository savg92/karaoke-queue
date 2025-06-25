import { AttackDetector } from '@/lib/security/attack-detector';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, Users, Activity } from 'lucide-react';

interface SecurityStatsProps {
	stats: {
		blockedIps: number;
		recentEvents: Record<string, number>;
	};
}

export function SecurityStats({ stats }: SecurityStatsProps) {
	const totalEvents = Object.values(stats.recentEvents).reduce(
		(sum, count) => sum + count,
		0
	);

	return (
		<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
			<Card>
				<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
					<CardTitle className='text-sm font-medium'>Blocked IPs</CardTitle>
					<Shield className='h-4 w-4 text-muted-foreground' />
				</CardHeader>
				<CardContent>
					<div className='text-2xl font-bold'>{stats.blockedIps}</div>
					<p className='text-xs text-muted-foreground'>
						Currently blocked addresses
					</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
					<CardTitle className='text-sm font-medium'>Security Events</CardTitle>
					<AlertTriangle className='h-4 w-4 text-muted-foreground' />
				</CardHeader>
				<CardContent>
					<div className='text-2xl font-bold'>{totalEvents}</div>
					<p className='text-xs text-muted-foreground'>Last 24 hours</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
					<CardTitle className='text-sm font-medium'>Brute Force</CardTitle>
					<Users className='h-4 w-4 text-muted-foreground' />
				</CardHeader>
				<CardContent>
					<div className='text-2xl font-bold'>
						{stats.recentEvents.brute_force}
					</div>
					<Badge
						variant={
							stats.recentEvents.brute_force > 0 ? 'destructive' : 'secondary'
						}
					>
						{stats.recentEvents.brute_force > 0 ? 'Active' : 'None'}
					</Badge>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
					<CardTitle className='text-sm font-medium'>Rate Limits</CardTitle>
					<Activity className='h-4 w-4 text-muted-foreground' />
				</CardHeader>
				<CardContent>
					<div className='text-2xl font-bold'>
						{stats.recentEvents.rate_limit_exceeded}
					</div>
					<p className='text-xs text-muted-foreground'>Limits exceeded today</p>
				</CardContent>
			</Card>
		</div>
	);
}

export async function getSecurityStats() {
	const detector = AttackDetector.getInstance();
	return await detector.getSecurityStats();
}
