import { useState } from 'react';
import { toast } from 'sonner';
import { editSignup } from '@/app/actions/edit-signup';

export interface EditData {
	singerName: string;
	songTitle: string;
	artist: string;
}

export function useEditableRow(initialData: EditData) {
	const [isEditing, setIsEditing] = useState(false);
	const [editData, setEditData] = useState(initialData);
	const [isSaving, setIsSaving] = useState(false);

	const startEditing = () => {
		setIsEditing(true);
	};

	const cancelEditing = () => {
		setEditData(initialData);
		setIsEditing(false);
	};

	const updateField = (field: keyof EditData, value: string) => {
		setEditData((prev) => ({ ...prev, [field]: value }));
	};

	const saveChanges = async (signupId: string): Promise<boolean> => {
		setIsSaving(true);
		try {
			const formData = new FormData();
			formData.append('singerName', editData.singerName);
			formData.append('songTitle', editData.songTitle);
			formData.append('artist', editData.artist);

			const result = await editSignup(signupId, formData);

			if (result.success) {
				toast.success(result.message);
				setIsEditing(false);
				return true;
			} else {
				toast.error(result.message);
				return false;
			}
		} catch (error) {
			console.error('Error saving signup:', error);
			toast.error('Failed to save changes');
			return false;
		} finally {
			setIsSaving(false);
		}
	};

	return {
		isEditing,
		editData,
		isSaving,
		startEditing,
		cancelEditing,
		updateField,
		saveChanges,
	};
}
