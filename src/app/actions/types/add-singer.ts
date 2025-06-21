export type AddSingerResult = {
	success: boolean;
	message: string;
	queuePosition?: number;
	errors?: {
		singerName?: string[];
		singerName1?: string[];
		singerName2?: string[];
		singerName3?: string[];
		singerName4?: string[];
		songTitle?: string[];
		artist?: string[];
		performanceType?: string[];
		notes?: string[];
		_form?: string[];
	};
};
