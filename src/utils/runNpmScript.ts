import type { AsyncDResult } from '@zokugun/xtry';
import type { FileSettings } from '#/bump/types.js';

import { exec } from '@zokugun/cli-utils/exec';
import fse from '@zokugun/fs-extra-plus/async';
import { err, OK, stringifyError } from '@zokugun/xtry';

import { loadJSON } from './load-json.js';
import { isNonBlankString } from '@zokugun/is-it-type';
import { logger } from '@zokugun/cli-utils';

export async function runNpmScript(script: 'postversion' | 'preversion' | 'version', { cwd, dryRun, ignoreScripts }: FileSettings): AsyncDResult {
	if(ignoreScripts) {
		return OK;
	}

	const path = fse.join(cwd, 'package.json');

	if(!(await fse.isFile(path))) {
		return OK;
	}

	const data = await loadJSON(path);

	if(data.fails) {
		return data;
	}

	if(isNonBlankString(data.value.data.scripts?.[script])) {
		if(dryRun) {
			logger.info(`npm run ${script} --silent`);
		}
		else {
			const result = await exec('npm', ['run', script, '--silent'], {
				cwd,
				stdio: 'inherit',
			});

			if(result.fails) {
				return err(stringifyError(result.error));
			}
		}
	}

	return OK;
}
