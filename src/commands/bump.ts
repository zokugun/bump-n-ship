import type { Options } from '../bump/types.js';

import { c, enquirer, logger, unwrapFatal } from '@zokugun/cli-utils';

import { bump as doBump } from '#/bump/bump.js';
import { configure } from '#/bump/configure.js';
import { Mode } from '#/bump/mode.js';
import { propagateNewVersion } from '#/bump/propagateNewVersion.js';
import { formatVersion } from '#utils/formatVersion.js';

export async function bump(options: Options): Promise<void> {
	logger.beginTimer();

	const settings = unwrapFatal(await configure(options));

	if(settings.ci) {
		logger.flagCI()
	}

	const result = unwrapFatal(await doBump(settings));

	if(options.pause) {
		if(settings.ci) {
			logger.fatal('Cannot pause in CI');
		}

		if(!(settings.mode & Mode.Prompt)) {
			logger.print(`${c.gray(c.symbols.pointer)} Next version (${formatVersion(result.version)})`);
		}

		await enquirer.prompt({
			type: 'invisible',
			name: 'pause',
			message: 'Press ENTER to continue...',
		});
	}

	unwrapFatal(await propagateNewVersion(result.version, result.updatedFiles, settings));

	logger.finishTimer();
}
