import type { GithubRepo } from '@zokugun/git-toolkit/lib/cjs/types.cjs';
import type { AsyncDResult } from '@zokugun/xtry';
import type { Context, Settings } from './types.js';

import { c, logger } from '@zokugun/cli-utils';
import { OK } from '@zokugun/xtry';

import { renderMessage } from '#utils/template/renderMessage.js';

export async function printManualInstructions(repo: GithubRepo | undefined, context: Context, settings: Settings): AsyncDResult {
	const { cwd, pullRequest } = settings;

	logger.newLine();

	if(repo) {
		const url = `https://github.com/${repo.owner}/${repo.repo}/compare/${encodeURIComponent(pullRequest!.base)}...${encodeURIComponent(pullRequest!.branch)}?expand=1`;

		logger.print(`  Open a pull request here: ${c.bold.cyan(url)}`);
	}
	else {
		logger.print('  Open a pull request from your release branch on your Git host.');
	}

	const titleResult = await renderMessage(pullRequest!.title, context.tokens, cwd);

	if(titleResult.fails) {
		return titleResult;
	}

	const bodyResult = await renderMessage(pullRequest!.body, context.tokens, cwd);

	if(bodyResult.fails) {
		return bodyResult;
	}

	logger.print(`  ${c.gray('branch')} ${context.branchName} ${c.gray('→')} ${pullRequest!.base}`);
	logger.print(`  ${c.gray('title ')} ${titleResult.value}`);

	if(pullRequest!.draft) {
		console.log(`  ${c.gray('draft ')} yes`);
	}

	logger.newLine();
	logger.print(c.gray(bodyResult.value.split('\n').map((line) => `  ${line}`).join('\n')));
	logger.newLine();

	return OK;
}
