import type { IncrementType } from 'verkit';

export type Tokens = {
	git?: {
		branch: string;
		commitId: string;
		distance: string;
	};
	major?: string;
	minor?: string;
	oldVersion?: string;
	patch?: string;
	releaseType?: IncrementType | '';
	tag?: string;
	version?: string;
};

