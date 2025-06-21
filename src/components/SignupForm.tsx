'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema, type SignupFormData } from '@/lib/validators/signup';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';

interface SignupFormProps {
	eventId: string;
	onSuccess?: () => void;
}

export function SignupForm({ eventId, onSuccess }: SignupFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitMessage, setSubmitMessage] = useState<{
		type: 'success' | 'error';
		text: string;
	} | null>(null);

	const form = useForm<SignupFormData>({
		resolver: zodResolver(signupSchema),
		defaultValues: {
			singerName: '',
			songTitle: '',
			artist: '',
			performanceType: 'SOLO',
			notes: '',
		},
	});

	const onSubmit = async (data: SignupFormData) => {
		setIsSubmitting(true);
		setSubmitMessage(null);

		try {
			// TODO: Implement the server action to add the singer
			// This will use the addSinger server action with eventId and form data
			// await addSinger(eventId, data);

			// For now, we'll just simulate a successful submission
			console.log('Simulating signup for event:', eventId, 'with data:', data);
			await new Promise((resolve) => setTimeout(resolve, 1000));

			setSubmitMessage({
				type: 'success',
				text: "Successfully signed up! You've been added to the queue.",
			});

			// Reset the form
			form.reset();

			// Call the success callback if provided
			onSuccess?.();
		} catch (error) {
			console.error('Error submitting signup:', error);
			setSubmitMessage({
				type: 'error',
				text: 'Something went wrong. Please try again.',
			});
		} finally {
			setIsSubmitting(false);
		}
	};

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
						onSubmit={form.handleSubmit(onSubmit)}
						className='space-y-6'
					>
						<FormField
							control={form.control}
							name='singerName'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Your Name</FormLabel>
									<FormControl>
										<Input
											placeholder='Enter your name'
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name='songTitle'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Song Title</FormLabel>
									<FormControl>
										<Input
											placeholder='Enter the song title'
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name='artist'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Artist</FormLabel>
									<FormControl>
										<Input
											placeholder='Enter the artist name'
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name='performanceType'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Performance Type</FormLabel>
									<Select
										onValueChange={field.onChange}
										defaultValue={field.value}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder='Select performance type' />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value='SOLO'>Solo</SelectItem>
											<SelectItem value='DUET'>Duet</SelectItem>
											<SelectItem value='GROUP'>Group</SelectItem>
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name='notes'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Notes (Optional)</FormLabel>
									<FormControl>
										<Textarea
											placeholder='Any special notes or requests...'
											className='resize-none'
											{...field}
										/>
									</FormControl>
									<FormDescription>
										Add any special notes or requests for your performance.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

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
