import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema, type SignupFormData } from '@/lib/validators/signup';
import { submitSignupForm } from '../utils/signup-submission';

export interface UseSignupFormProps {
	eventId: string;
	onSuccess?: () => void;
}

export function useSignupForm({ eventId, onSuccess }: UseSignupFormProps) {
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

	const handleSubmit = async (data: SignupFormData) => {
		setIsSubmitting(true);
		setSubmitMessage(null);

		try {
			const result = await submitSignupForm(eventId, data);

			if (result.success) {
				setSubmitMessage({
					type: 'success',
					text: result.message,
				});
				form.reset();
				onSuccess?.();
				return true;
			} else {
				handleSubmissionError(result);
				return false;
			}
		} catch (error) {
			console.error('Error submitting signup:', error);
			setSubmitMessage({
				type: 'error',
				text: 'Something went wrong. Please try again.',
			});
			return false;
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleSubmissionError = (result: {
		errors?: Record<string, string[]>;
		message: string;
	}) => {
		if (result.errors) {
			Object.entries(result.errors).forEach(([field, messages]) => {
				if (field !== '_form' && messages) {
					form.setError(field as keyof SignupFormData, {
						message: messages[0],
					});
				}
			});

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
	};

	return {
		form,
		performanceType,
		isSubmitting,
		submitMessage,
		handleSubmit: form.handleSubmit(handleSubmit),
	};
}
