import type { AsyncDResult } from '@zokugun/xtry';
import type { Context, Settings } from './types.js';

import { confirm, enquirer, exec, logger } from '@zokugun/cli-utils';
import { err, OK, stringifyError } from '@zokugun/xtry';

import { successfulStep } from '#utils/successfulStep.js';

export async function tagCommit({ tagMessage, tagName }: Context, settings: Settings): AsyncDResult {
	const { cwd, dryRun, sign } = settings;

	let done: (() => void) | undefined

	if(settings.confirm) {
		await enquirer.prompt(confirm({
			name: 'commit',
			message: `Tag (${tagName})`,
			initial: true,
		}));
	}
	else {
		done = logger.createStep(`Tag (${tagName})`, successfulStep);
	}

	const args = ['--annotate', tagName!];

	if(sign) {
		args.push('--gpg-sign');
	}

	args.push('--message', tagMessage!);

	if(dryRun) {
		logger.info(['git', 'tag', ...args].join(' '));
	}
	else {
		const result = await exec('git', ['tag', ...args], { cwd });

		if(result.fails) {
			return err(stringifyError(result.error));
		}
	}

	done?.();

	return OK;
}
