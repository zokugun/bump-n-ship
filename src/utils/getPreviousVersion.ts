import type { AsyncDResult } from '@zokugun/xtry';
import type { SemVer } from 'verkit';

import { exec } from '@zokugun/cli-utils/exec';
import { err, ok, stringifyError } from '@zokugun/xtry';
import { tryParse } from 'verkit';

export async function getPreviousVersion(root: string): AsyncDResult<SemVer> {
	const result = await exec('git', ['describe', '--tags', '--abbrev=0'], { cwd: root });

	if(result.fails) {
		return err(stringifyError(result.error));
	}

	const version = tryParse(result.value.merged);

	if(!version) {
		return err(`Invalid SemVer version: ${result.value.merged}`);
	}

	return ok(version);
}
