import { Button } from '@/components/ui/button';
import { Loader2, Check, X } from 'lucide-react';

type FormActionsVariant = 'default' | 'compact' | 'inline';

interface FormActionsProps {
	variant?: FormActionsVariant;
	isSubmitting?: boolean;
	isSaving?: boolean;
	submitText?: string;
	submitingText?: string;
	onSubmit?: () => void;
	onCancel: () => void;
	showLoader?: boolean;
	disabled?: boolean;
	cancelVariant?: 'outline' | 'destructive' | 'ghost';
}

/**
 * Reusable form actions component for submit/cancel patterns
 * Supports multiple variants for different UI contexts
 */
export function FormActions({
	variant = 'default',
	isSubmitting = false,
	isSaving = false,
	submitText = 'Submit',
	submitingText,
	onSubmit,
	onCancel,
	showLoader = true,
	disabled = false,
	cancelVariant = 'outline',
}: FormActionsProps) {
	const isLoading = isSubmitting || isSaving;
	const isDisabled = disabled || isLoading;
	const loadingText = submitingText || `${submitText}...`;

	if (variant === 'compact') {
		return (
			<div className='flex gap-1'>
				<Button
					size='sm'
					onClick={onSubmit}
					disabled={isDisabled}
					className='h-8 w-8 p-0'
					type={onSubmit ? 'button' : 'submit'}
				>
					<Check className='h-4 w-4' />
				</Button>
				<Button
					size='sm'
					variant='outline'
					onClick={onCancel}
					disabled={isDisabled}
					className='h-8 w-8 p-0'
					type='button'
				>
					<X className='h-4 w-4' />
				</Button>
			</div>
		);
	}

	if (variant === 'inline') {
		return (
			<div className='flex justify-end gap-2 pt-4'>
				<Button
					type='button'
					variant={cancelVariant}
					onClick={onCancel}
					disabled={isDisabled}
				>
					Cancel
				</Button>
				<Button
					type={onSubmit ? 'button' : 'submit'}
					onClick={onSubmit}
					disabled={isDisabled}
				>
					{isLoading && showLoader && (
						<Loader2 className='w-4 h-4 mr-2 animate-spin' />
					)}
					{isLoading ? loadingText : submitText}
				</Button>
			</div>
		);
	}

	// Default variant
	return (
		<div className='flex gap-4 pt-4'>
			<Button
				type={onSubmit ? 'button' : 'submit'}
				onClick={onSubmit}
				disabled={isDisabled}
				className='flex-1'
			>
				{isLoading ? loadingText : submitText}
			</Button>
			<Button
				type='button'
				variant={cancelVariant}
				onClick={onCancel}
				disabled={isDisabled}
			>
				Cancel
			</Button>
		</div>
	);
}
