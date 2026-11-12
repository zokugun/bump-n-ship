import type { AsyncDResult } from '@zokugun/xtry';
import type { Context, Settings } from './types.js';

import { c, confirm, enquirer, exec, logger } from '@zokugun/cli-utils';
import { err, OK, stringifyError } from '@zokugun/xtry';

import { successfulStep } from '#utils/successfulStep.js';

export async function commitChanges({ commitHeader, commitMessage, updatedFiles }: Context, settings: Settings): AsyncDResult {
	const { dryRun, commit: { all, verify }, cwd, sign } = settings;

	logger.print(`${c.gray(c.symbols.pointer)} Changeset:`);

	const changesetArgs = ['status', '--short'];

	if(!all) {
		changesetArgs.push(...updatedFiles);
	}

	const result = await exec('git', changesetArgs, { cwd: settings.cwd, stdio: 'inherit' });

	if (result.fails) {
		return err(stringifyError(result.error));
	}

	let done: (() => void) | undefined

	if(settings.confirm) {
		await enquirer.prompt(confirm({
			name: 'commit',
			message: `Commit (${commitHeader})`,
			initial: true,
		}));
	}
	else {
		if(settings.pause) {
			await enquirer.prompt({
				type: 'invisible',
				name: 'pause',
				message: 'Press ENTER to continue...',
			});
		}

		done = logger.createStep(`Commit (${commitHeader})`, successfulStep);
	}

	const args = ['--allow-empty'];

	if(all) {
		const result = await exec('git', ['add', '--all'], {
			cwd: cwd,
			stdio: 'inherit',
		});

		if(result.fails) {
			return err(stringifyError(result.error));
		}

		args.push('--all');
	}

	if(!verify) {
		args.push('--no-verify');
	}

	if(sign) {
		args.push('--gpg-sign');
	}

  	args.push('--message', commitMessage!);

	if(!all) {
		args.push(...updatedFiles);
	}

	if(dryRun) {
		logger.info(['git', 'commit', '--quiet', ...args].join(' '));
	}
	else {
		const result = await exec('git', ['commit', '--quiet', ...args], { cwd });

		if(result.fails) {
			return err(stringifyError(result.error));
		}
	}

	done?.()

	return OK;
}
