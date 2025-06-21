interface EventHeaderProps {
	name: string;
	date: Date;
}

export function EventHeader({ name, date }: EventHeaderProps) {
	return (
		<div className='flex justify-between items-start'>
			<div>
				<h1 className='text-3xl font-bold'>{name}</h1>
				<p className='text-muted-foreground'>
					{date.toLocaleDateString()} - Host Dashboard
				</p>
			</div>
		</div>
	);
}
