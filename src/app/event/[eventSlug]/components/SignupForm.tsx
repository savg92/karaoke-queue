'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema, type SignupFormData } from '@/lib/validators/signup';
import { addSinger } from '@/app/actions/add-singer';
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
			performanceType: 'SOLO',
			singerName: '',
			singerName1: '',
			singerName2: '',
			singerName3: '',
			singerName4: '',
			songTitle: '',
			artist: '',
			notes: '',
		},
	});

	const performanceType = form.watch('performanceType');

	const onSubmit = async (data: SignupFormData) => {
		setIsSubmitting(true);
		setSubmitMessage(null);

		try {
			// Create FormData from the validated data
			const formData = new FormData();
			formData.append('performanceType', data.performanceType);
			formData.append('songTitle', data.songTitle);
			formData.append('artist', data.artist);
			formData.append('notes', data.notes || '');

			// Append names based on performance type
			if (data.performanceType === 'SOLO') {
				formData.append('singerName', data.singerName || '');
			} else if (data.performanceType === 'DUET') {
				formData.append('singerName1', data.singerName1 || '');
				formData.append('singerName2', data.singerName2 || '');
			} else if (data.performanceType === 'GROUP') {
				formData.append('singerName1', data.singerName1 || '');
				formData.append('singerName2', data.singerName2 || '');
				formData.append('singerName3', data.singerName3 || '');
				formData.append('singerName4', data.singerName4 || '');
			}

			// Call the server action
			const result = await addSinger(eventId, formData);

			if (result.success) {
				setSubmitMessage({
					type: 'success',
					text: result.message,
				});

				// Reset the form
				form.reset();

				// Call the success callback if provided
				onSuccess?.();
			} else {
				// Handle validation errors
				if (result.errors) {
					// Set field-specific errors
					Object.entries(result.errors).forEach(([field, messages]) => {
						if (field !== '_form' && messages) {
							form.setError(field as keyof SignupFormData, {
								message: messages[0],
							});
						}
					});

					// Set general form error if present
					if (result.errors._form) {
						setSubmitMessage({
							type: 'error',
							text: result.errors._form[0],
						});
					}
				} else {
					setSubmitMessage({
						type: 'error',
						text: result.message,
					});
				}
			}
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

						{performanceType === 'SOLO' && (
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
						)}

						{performanceType === 'DUET' && (
							<div className='space-y-4'>
								<FormField
									control={form.control}
									name='singerName1'
									render={({ field }) => (
										<FormItem>
											<FormLabel>Singer 1 Name</FormLabel>
											<FormControl>
												<Input
													placeholder="Enter first singer's name"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name='singerName2'
									render={({ field }) => (
										<FormItem>
											<FormLabel>Singer 2 Name</FormLabel>
											<FormControl>
												<Input
													placeholder="Enter second singer's name"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						)}

						{performanceType === 'GROUP' && (
							<div className='space-y-4'>
								<FormField
									control={form.control}
									name='singerName1'
									render={({ field }) => (
										<FormItem>
											<FormLabel>Singer 1 Name</FormLabel>
											<FormControl>
												<Input
													placeholder="Enter first singer's name"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name='singerName2'
									render={({ field }) => (
										<FormItem>
											<FormLabel>Singer 2 Name (Optional)</FormLabel>
											<FormControl>
												<Input
													placeholder="Enter second singer's name"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name='singerName3'
									render={({ field }) => (
										<FormItem>
											<FormLabel>Singer 3 Name (Optional)</FormLabel>
											<FormControl>
												<Input
													placeholder="Enter third singer's name"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name='singerName4'
									render={({ field }) => (
										<FormItem>
											<FormLabel>Singer 4 Name (Optional)</FormLabel>
											<FormControl>
												<Input
													placeholder="Enter fourth singer's name"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						)}

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
