'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Loader2 } from 'lucide-react';
import { addSinger } from '@/app/actions/add-singer';
import { toast } from 'sonner';

// Simplified schema for manual addition by host - matches original signup validation
const addAttendeeSchema = z
	.object({
		performanceType: z.enum(['SOLO', 'DUET', 'GROUP'], {
			required_error: 'Please select a performance type',
		}),
		singerName: z
			.string()
			.max(100, 'Singer name must be less than 100 characters')
			.optional(),
		singerName1: z
			.string()
			.max(100, 'Singer name must be less than 100 characters')
			.optional(),
		singerName2: z
			.string()
			.max(100, 'Singer name must be less than 100 characters')
			.optional(),
		singerName3: z
			.string()
			.max(100, 'Singer name must be less than 100 characters')
			.optional(),
		singerName4: z
			.string()
			.max(100, 'Singer name must be less than 100 characters')
			.optional(),
		songTitle: z
			.string()
			.min(1, 'Song title is required')
			.max(200, 'Song title must be less than 200 characters')
			.trim(),
		artist: z
			.string()
			.min(1, 'Artist name is required')
			.max(200, 'Artist name must be less than 200 characters')
			.trim(),
		notes: z
			.string()
			.max(500, 'Notes must be less than 500 characters')
			.optional(),
	})
	.superRefine((data, ctx) => {
		switch (data.performanceType) {
			case 'SOLO':
				if (!data.singerName || data.singerName.trim().length === 0) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: 'Singer name is required for solo performances',
						path: ['singerName'],
					});
				}
				break;
			case 'DUET':
				if (!data.singerName1 || data.singerName1.trim().length === 0) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: "First singer's name is required for duets",
						path: ['singerName1'],
					});
				}
				if (!data.singerName2 || data.singerName2.trim().length === 0) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: "Second singer's name is required for duets",
						path: ['singerName2'],
					});
				}
				break;
			case 'GROUP':
				// Require at least one singer name for group (matching original validation)
				const groupSingers = [
					data.singerName1,
					data.singerName2,
					data.singerName3,
					data.singerName4,
				].filter((name) => name && name.trim().length > 0);

				if (groupSingers.length === 0) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message:
							'At least one singer name is required for group performances',
						path: ['singerName1'],
					});
				}
				break;
		}
	});

type AddAttendeeFormData = z.infer<typeof addAttendeeSchema>;

interface AddAttendeeFormProps {
	eventId: string;
	onSuccess?: () => void;
}

export function AddAttendeeForm({ eventId, onSuccess }: AddAttendeeFormProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const form = useForm<AddAttendeeFormData>({
		resolver: zodResolver(addAttendeeSchema),
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

	const onSubmit = async (data: AddAttendeeFormData) => {
		setIsSubmitting(true);
		try {
			// Create FormData to match the existing server action
			const formData = new FormData();
			formData.append('performanceType', data.performanceType);

			// Only append non-empty string values
			if (data.singerName && data.singerName.trim()) {
				formData.append('singerName', data.singerName.trim());
			}
			if (data.singerName1 && data.singerName1.trim()) {
				formData.append('singerName1', data.singerName1.trim());
			}
			if (data.singerName2 && data.singerName2.trim()) {
				formData.append('singerName2', data.singerName2.trim());
			}
			if (data.singerName3 && data.singerName3.trim()) {
				formData.append('singerName3', data.singerName3.trim());
			}
			if (data.singerName4 && data.singerName4.trim()) {
				formData.append('singerName4', data.singerName4.trim());
			}

			formData.append('songTitle', data.songTitle.trim());
			formData.append('artist', data.artist.trim());

			if (data.notes && data.notes.trim()) {
				formData.append('notes', data.notes.trim());
			}

			const result = await addSinger(eventId, formData);

			if (result.success) {
				toast.success(result.message);
				form.reset();
				setIsOpen(false);
				onSuccess?.();
			} else {
				toast.error(result.message);
				// Handle field errors
				if (result.errors) {
					Object.entries(result.errors).forEach(([field, messages]) => {
						if (messages && field !== '_form') {
							form.setError(field as keyof AddAttendeeFormData, {
								message: messages[0],
							});
						}
					});
				}
			}
		} catch (error) {
			console.error('Error adding attendee:', error);
			toast.error('Failed to add attendee. Please try again.');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog
			open={isOpen}
			onOpenChange={setIsOpen}
		>
			<DialogTrigger asChild>
				<Button
					variant='outline'
					size='sm'
				>
					<Plus className='w-4 h-4 mr-2' />
					Add Attendee
				</Button>
			</DialogTrigger>
			<DialogContent className='sm:max-w-md'>
				<DialogHeader>
					<DialogTitle>Add Attendee Manually</DialogTitle>
					<DialogDescription>
						Manually add a new attendee to your karaoke event.
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className='space-y-4'
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
											<SelectItem value='GROUP'>Group (3+)</SelectItem>
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Singer Names based on performance type */}
						{performanceType === 'SOLO' && (
							<FormField
								control={form.control}
								name='singerName'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Singer Name</FormLabel>
										<FormControl>
											<Input
												placeholder='Enter singer name'
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						)}

						{performanceType === 'DUET' && (
							<>
								<FormField
									control={form.control}
									name='singerName1'
									render={({ field }) => (
										<FormItem>
											<FormLabel>First Singer</FormLabel>
											<FormControl>
												<Input
													placeholder='Enter first singer name'
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
											<FormLabel>Second Singer</FormLabel>
											<FormControl>
												<Input
													placeholder='Enter second singer name'
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</>
						)}

						{performanceType === 'GROUP' && (
							<>
								<FormField
									control={form.control}
									name='singerName1'
									render={({ field }) => (
										<FormItem>
											<FormLabel>Singer 1</FormLabel>
											<FormControl>
												<Input
													placeholder='Enter first singer name'
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
											<FormLabel>Singer 2</FormLabel>
											<FormControl>
												<Input
													placeholder='Enter second singer name'
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
											<FormLabel>Singer 3</FormLabel>
											<FormControl>
												<Input
													placeholder='Enter third singer name'
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
											<FormLabel>Singer 4 (Optional)</FormLabel>
											<FormControl>
												<Input
													placeholder='Enter fourth singer name'
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</>
						)}

						<FormField
							control={form.control}
							name='songTitle'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Song Title</FormLabel>
									<FormControl>
										<Input
											placeholder='Enter song title'
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
											placeholder='Enter artist name'
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
											placeholder='Any additional notes...'
											className='resize-none'
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className='flex justify-end gap-2 pt-4'>
							<Button
								type='button'
								variant='outline'
								onClick={() => setIsOpen(false)}
								disabled={isSubmitting}
							>
								Cancel
							</Button>
							<Button
								type='submit'
								disabled={isSubmitting}
							>
								{isSubmitting && (
									<Loader2 className='w-4 h-4 mr-2 animate-spin' />
								)}
								Add Attendee
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
