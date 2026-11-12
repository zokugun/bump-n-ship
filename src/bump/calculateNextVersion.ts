import type { AsyncDResult } from '@zokugun/xtry';
import type { BumpResult, Settings } from '../bump/types.js';

import { ok } from '@zokugun/xtry';

import { incrementVersion } from '#/utils/incrementVersion.js';
import { toIncrementType } from '#/utils/toIncrementType.js';

export async function calculateNextVersion(settings: Settings): AsyncDResult<BumpResult> {
	const result = await incrementVersion(settings.currentVersion, settings.mode, settings);

	if(result.fails) {
		return result;
	}

	return ok({
		oldVersion: settings.currentVersion,
		releaseType: toIncrementType(settings.mode),
		version: result.value,
		updatedFiles: [],
	});
}
