import type { AsyncDResult } from '@zokugun/xtry';
import type { Tokens } from './types.js';

import { exec } from '@zokugun/cli-utils/exec';
import { getHeadBranch } from '@zokugun/git-toolkit';
import { err, OK, stringifyError } from '@zokugun/xtry';

export async function loadGitTokens(tokens: Tokens, cwd: string): AsyncDResult {
	const branch = await getHeadBranch(cwd);

	if(branch.fails) {
		return branch;
	}

	const result = await exec('git', ['describe', '--long', '--tags']);

	if (result.fails) {
		return err(stringifyError(result.error));
	}

	const data = result.value.all.split('-');
	const commitId = data.pop()!;
	const distance = data.pop()!;

	tokens.git = {
		branch: branch.value,
		commitId,
		distance,
	}

	return OK;
}
