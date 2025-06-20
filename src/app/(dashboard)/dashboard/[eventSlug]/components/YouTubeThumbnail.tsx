import { Play } from 'lucide-react';
import Image from 'next/image';

interface YouTubeThumbnailProps {
	thumbnailUrl: string;
	title: string;
	onOpen: () => void;
}

export function YouTubeThumbnail({
	thumbnailUrl,
	title,
	onOpen,
}: YouTubeThumbnailProps) {
	// Debug: Log the thumbnail URL to see what we're receiving
	console.log('YouTubeThumbnail received URL:', thumbnailUrl);

	return (
		<button
			onClick={onOpen}
			className='relative w-full cursor-pointer group overflow-hidden rounded-md bg-gray-200 dark:bg-gray-800'
		>
			<div className='relative w-full h-0 pb-[56.25%]'>
				<Image
					src={thumbnailUrl}
					alt={title}
					fill
					className='absolute top-0 left-0 w-full h-full object-cover transition-transform duration-200 group-hover:scale-105'
					loading='lazy'
					placeholder='blur'
					blurDataURL={thumbnailUrl} // Use the thumbnail URL as the blur placeholder
				/>
			</div>
			<div className='absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm opacity-0 transition-opacity duration-300 group-hover:opacity-100'>
				<Play className='h-12 w-12 text-white drop-shadow-lg' />
			</div>
			{/* <div className='absolute bottom-0 left-0 w-full p-2 bg-black bg-opacity-50 text-white text-xs line-clamp-2'>
				{title}
			</div> */}
		</button>
	);
}
