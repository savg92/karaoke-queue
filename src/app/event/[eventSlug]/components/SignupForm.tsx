'use client';

import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { useSignupForm } from '../hooks/useSignupForm';
import { PerformanceTypeSelect } from './PerformanceTypeSelect';
import { SingerNameInputs } from './SingerNameInputs';
import { SongDetailsInputs } from './SongDetailsInputs';

interface SignupFormProps {
	eventId: string;
	onSuccess?: () => void;
}

export function SignupForm({ eventId, onSuccess }: SignupFormProps) {
	const { form, performanceType, isSubmitting, submitMessage, handleSubmit } =
		useSignupForm({
			eventId,
			onSuccess,
		});

	return (
		<Card>
			<CardHeader>
				<CardTitle>Sign Up to Sing</CardTitle>
				<CardDescription>
					Fill out the form below to add yourself to the karaoke queue.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form
						onSubmit={handleSubmit}
						className='space-y-6'
					>
						<PerformanceTypeSelect control={form.control} />
						<SingerNameInputs
							control={form.control}
							performanceType={performanceType}
						/>
						<SongDetailsInputs control={form.control} />

						<Button
							type='submit'
							className='w-full'
							disabled={isSubmitting}
						>
							{isSubmitting ? 'Adding to Queue...' : 'Add Me to the Queue'}
						</Button>

						{submitMessage && (
							<div
								className={`p-4 rounded-md text-sm ${
									submitMessage.type === 'success'
										? 'bg-green-50 text-green-700 border border-green-200'
										: 'bg-red-50 text-red-700 border border-red-200'
								}`}
							>
								{submitMessage.text}
							</div>
						)}
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
