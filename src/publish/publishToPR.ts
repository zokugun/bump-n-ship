import type { AsyncDResult } from '@zokugun/xtry';
import type { Context, Settings } from './types.js';

import { c, confirm, enquirer, logger } from '@zokugun/cli-utils';
import { checkoutNewBranch, fetchBranch, getDefaultBranch, getGitHubRepository, isLocalBranchBehindRemote, isLocalBranchExists, isRemoteBranchExists, isWorkingDirectoryClean } from '@zokugun/git-toolkit';
import { err, OK } from '@zokugun/xtry';

import { commitChanges } from './commitChanges.js';
import { printManualInstructions } from './printManualInstructions.js';
import { propagateNewVersion } from '#/bump/propagateNewVersion.js';
import { runNpmScript } from '#utils/runNpmScript.js';

export async function publishToPR(context: Context, settings: Settings): AsyncDResult {
	const { cwd, pullRequest, remote } = settings;

	if(!(await isWorkingDirectoryClean(cwd))) {
		return err('The working directory must be clean. Please commit or stash your changes.')
	}

	let baseBranch = pullRequest!.base;

	if(!baseBranch) {
		const result = await getDefaultBranch(remote, cwd);

		if(result.fails) {
			return result;
		}

		baseBranch = result.value;
	}

	const fetchResult = await fetchBranch(baseBranch, remote, cwd);

	if(fetchResult.fails) {
		return fetchResult;
	}

	if (await isLocalBranchBehindRemote(baseBranch, remote, cwd)) {
		return err(`Local "${baseBranch}" is behind "${settings.remote}/${baseBranch}". Pull the latest changes before releasing.`)
	}

	const existsLocal = await isLocalBranchExists(context.branchName!, cwd);
	const existsRemote = await isRemoteBranchExists(context.branchName!, remote, cwd);

	let forcePush = false;

	if(existsLocal || existsRemote) {
		const where = [existsLocal && 'locally', existsRemote && `on ${settings.remote}`].filter(Boolean).join(' and ');
    	const message = `Release branch "${context.branchName}" already exists ${where}.`;

		if(settings.ci) {
			return err(`${message} Delete it or re-run without --ci to recreate it.`);
		}

		logger.info(message);

		({ forcePush } = await enquirer.prompt<{ forcePush: boolean }>([
			confirm({
				name: 'forcePush',
				message: 'Recreate it and force-push?',
			}),
		]));

		if(!forcePush) {
			return err('Aborted.');
		}
	}

	const checkoutResult = await checkoutNewBranch(context.branchName!, forcePush, cwd)

	if(checkoutResult.fails) {
		return checkoutResult;
	}

	logger.success(`Created release branch ${c.bold(context.branchName!)}`)

	const propagateResult = await propagateNewVersion(context.version, context.updatedFiles, settings);

	if(propagateResult.fails) {
		return propagateResult;
	}

	const commitResult = await commitChanges(context, settings);

	if(commitResult.fails) {
		return commitResult;
	}

	const scriptResult = await runNpmScript('postversion', settings)

	if(scriptResult.fails) {
		return scriptResult;
	}

	const repoResult = await getGitHubRepository(settings.remote, settings.cwd);

	if(repoResult.fails) {
		return repoResult;
	}

	const manualResult = await printManualInstructions(repoResult.value, context, settings);

	if(manualResult.fails) {
		return manualResult;
	}

	return OK;
}
