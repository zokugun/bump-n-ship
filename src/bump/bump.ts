import type { AsyncDResult } from '@zokugun/xtry';
import type { BumpResult, Settings } from './types.js';

import logger from '@zokugun/cli-utils/logger';
import { err, ok } from '@zokugun/xtry';
import { isLessThanOrEqual } from 'verkit';

import { formatVersion } from '#/utils/formatVersion.js';
import { calculateNextVersion } from './calculateNextVersion.js';
import { determineNextVersion } from './determineNextVersion.js';
import { promptNextVersion } from './promptNextVersion.js';
import { Mode } from './mode.js';

export async function bump(settings: Settings): AsyncDResult<BumpResult> {
	const { dryRun, mode } = settings;

	let result: BumpResult;

	if(mode & Mode.Auto) {
		const nextVersion = await determineNextVersion(settings);

		if(nextVersion.fails) {
			return nextVersion;
		}

		result = nextVersion.value;
	}
	else if(mode & Mode.Prompt) {
		if(settings.ci) {
			return err('Cannot prompt in CI');
		}

		const nextVersion = await promptNextVersion(settings);

		if(nextVersion.fails) {
			return nextVersion;
		}

		result = nextVersion.value;
	}
	else if(mode & Mode.Version) {
		result = {
			oldVersion: settings.currentVersion,
			releaseType: '',
			version: settings.nextVersion!,
			updatedFiles: [],
		};
	}
	else {
		const nextVersion = await calculateNextVersion(settings);

		if(nextVersion.fails) {
			return nextVersion;
		}

		result = nextVersion.value;
	}

	if(isLessThanOrEqual(result.version, settings.currentVersion)) {
		logger.fatal(`Next version "${formatVersion(result.version)}" must be greater than current version "${formatVersion(settings.currentVersion)}"`);
	}

	if(dryRun) {
		logger.info(`VERSION=${formatVersion(result.version)}`);

		return ok(result);
	}

	return ok(result);
}
