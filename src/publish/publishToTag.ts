import type { AsyncDResult} from '@zokugun/xtry';
import type { Context, Settings } from './types.js';

import { logger } from '@zokugun/cli-utils';
import { getGitHubRepository } from '@zokugun/git-toolkit';
import { OK } from '@zokugun/xtry';

import { commitChanges } from './commitChanges.js';
import { pushBranch } from './pushBranch.js';
import { tagCommit } from './tagCommit.js';
import { propagateNewVersion } from '#/bump/propagateNewVersion.js';
import { runNpmScript } from '#utils/runNpmScript.js';

export async function publishToTag(context: Context, settings: Settings): AsyncDResult {
	const propagateResult = await propagateNewVersion(context.version, context.updatedFiles, settings);

	if(propagateResult.fails) {
		return propagateResult;
	}

	const commitResult = await commitChanges(context, settings);

	if(commitResult.fails) {
		return commitResult;
	}

	const tagResult = await tagCommit(context, settings);

	if(tagResult.fails) {
		return tagResult;
	}

	const scriptResult = await runNpmScript('postversion', settings)

	if(scriptResult.fails) {
		return scriptResult;
	}

	const pushResult = await pushBranch(context, settings);

	if(pushResult.fails) {
		return pushResult;
	}

	const repoResult = await getGitHubRepository(settings.remote, settings.cwd);

	if(repoResult.value) {
		logger.info(`New release pushed at https://github.com/${repoResult.value.owner}/${repoResult.value.repo}`);
	}

	return OK;
}
