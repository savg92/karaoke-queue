'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';

interface SignupFormProps {
	eventId: string;
}

export function SignupForm({ eventId }: SignupFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [message, setMessage] = useState('');

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsSubmitting(true);
		// TODO: Implement actual form submission using eventId
		// This will use the addSinger server action with eventId
		console.log('Submitting to event:', eventId);
		setMessage(
			'Feature coming soon! This form will submit to the karaoke queue.'
		);
		setIsSubmitting(false);
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Sign Up to Sing</CardTitle>
				<CardDescription>Add your song to the karaoke queue</CardDescription>
			</CardHeader>
			<CardContent>
				<form
					onSubmit={handleSubmit}
					className='space-y-4'
				>
					<div>
						<label
							htmlFor='singerName'
							className='block text-sm font-medium mb-1'
						>
							Your Name
						</label>
						<Input
							id='singerName'
							name='singerName'
							placeholder='Enter your name'
							required
						/>
					</div>

					<div>
						<label
							htmlFor='songTitle'
							className='block text-sm font-medium mb-1'
						>
							Song Title
						</label>
						<Input
							id='songTitle'
							name='songTitle'
							placeholder='Enter song title'
							required
						/>
					</div>

					<div>
						<label
							htmlFor='artist'
							className='block text-sm font-medium mb-1'
						>
							Artist
						</label>
						<Input
							id='artist'
							name='artist'
							placeholder='Enter artist name'
							required
						/>
					</div>

					<Button
						type='submit'
						disabled={isSubmitting}
						className='w-full'
					>
						{isSubmitting ? 'Adding to Queue...' : 'Add to Queue'}
					</Button>

					{message && (
						<div className='p-4 rounded-md bg-blue-50 text-blue-700 border border-blue-200'>
							{message}
						</div>
					)}
				</form>
			</CardContent>
		</Card>
	);
}
