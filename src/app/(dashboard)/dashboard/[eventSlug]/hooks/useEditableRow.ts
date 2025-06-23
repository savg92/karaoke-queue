import { useState } from 'react';
import { useEditSignup } from './useEditSignup';
import { useParams } from 'next/navigation';

export interface EditData {
	singerName: string;
	songTitle: string;
	artist: string;
}

export function useEditableRow(initialData: EditData) {
	const [isEditing, setIsEditing] = useState(false);
	const [editData, setEditData] = useState(initialData);
	const { eventSlug } = useParams() as { eventSlug: string };

	const editMutation = useEditSignup(eventSlug);

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
		try {
			const formData = new FormData();
			formData.append('singerName', editData.singerName);
			formData.append('songTitle', editData.songTitle);
			formData.append('artist', editData.artist);

			await editMutation.mutateAsync({ signupId, formData });
			setIsEditing(false);
			return true;
		} catch (error) {
			console.error('Error saving signup:', error);
			return false;
		}
	};

	return {
		isEditing,
		editData,
		isSaving: editMutation.isPending,
		startEditing,
		cancelEditing,
		updateField,
		saveChanges,
	};
}
