import { createCommand } from '@zokugun/cli-utils/exec';

export const git = createCommand(
	'git',
	null,
	{
		onSuccess: ({value}) => value.merged.trim(),
		onFailure: ({error}) => error.merged?.trim() ?? '',
	},
).toCwdFirst();
