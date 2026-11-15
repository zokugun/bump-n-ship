import type { AsyncDResult } from '@zokugun/xtry';
import type { SemVer } from 'verkit';
import type { FileSettings } from './types.js';

import { logger } from '@zokugun/cli-utils';
import { OK } from '@zokugun/xtry';

import { updateFiles } from './update-files.js';
import { formatVersion } from '#utils/formatVersion.js';
import { runNpmScript } from '#utils/runNpmScript.js';
import { successfulStep } from '#utils/successfulStep.js';

export async function propagateNewVersion(oldVersion: SemVer, newVersion: SemVer, updatedFiles: string[], settings: FileSettings): AsyncDResult {
	const done = logger.createStep(`Version (${formatVersion(newVersion)})`, successfulStep);

	const script1Result = await runNpmScript('preversion', oldVersion, newVersion, settings)

	if(script1Result.fails) {
		return script1Result;
	}

	const updateResult = await updateFiles(newVersion, updatedFiles, settings);

	if(updateResult.fails) {
		return updateResult;
	}

	const script2Result = await runNpmScript('version', oldVersion, newVersion, settings)

	if(script2Result.fails) {
		return script2Result;
	}

	done();

	return OK;
}
