import type { AsyncDResult } from '@zokugun/xtry';
import type { Context, Settings } from './types.js';

import { confirm, enquirer, exec, logger } from '@zokugun/cli-utils';
import { err, OK, stringifyError } from '@zokugun/xtry';

import { successfulStep } from '#utils/successfulStep.js';

export async function pushBranch(_context: Context, settings: Settings): AsyncDResult {
	const { cwd, dryRun } = settings;

	let done: (() => void) | undefined

	if(settings.confirm) {
		await enquirer.prompt(confirm({
			name: 'push',
			message: `Push`,
			initial: true,
		}));
	}
	else {
		done = logger.createStep(`Push`, successfulStep);
	}

	if(dryRun) {
		logger.info('git push --quiet');
		logger.info('git push --quiet --tags');

		return OK;
	}

	const pushResult = await exec('git', ['push', '--quiet'], {	cwd });

	if(pushResult.fails) {
		return err(stringifyError(pushResult.error));
	}

	const tagResult = await exec('git', ['push', '--quiet', '--tags'], { cwd });

	if(tagResult.fails) {
		return err(stringifyError(tagResult.error));
	}

	done?.();

	return OK;
}
