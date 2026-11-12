import type { Options } from '#/publish/types.js';

import { c, enquirer, logger, unwrapFatal } from '@zokugun/cli-utils';
import { isWorkingDirectoryClean, withGitTransaction } from '@zokugun/git-toolkit';
import { difference } from 'verkit';

import { BumpResult } from '#/bump/types.js';
import { configure } from '#/publish/configure.js';
import { publishToTag } from '#/publish/publishToTag.js';
import { renderMessages } from '#/publish/renderMessages.js';
import { buildContext } from '#utils/buildContext.js';
import { buildTransactionOptions } from '#utils/buildTransactionOptions.js';
import { formatVersion } from '#utils/formatVersion.js';
import { getCurrentVersion } from '#utils/getCurrentVersion.js';
import { getPreviousVersion } from '#utils/getPreviousVersion.js';

export async function tag(options: Options): Promise<void> {
	logger.beginTimer();

	const settings = unwrapFatal(await configure(options, false));

	if(settings.ci) {
		logger.flagCI()
	}

	if(!settings.dirty && !(await isWorkingDirectoryClean(settings.cwd))) {
		logger.fatal('The working directory must be clean. Please commit or stash your changes.')
	}

	const version = unwrapFatal(await getCurrentVersion(settings.cwd));
	const oldVersion = unwrapFatal(await getPreviousVersion(settings.cwd));

	const result: BumpResult = {
		oldVersion,
		releaseType: difference(oldVersion, version) ?? '',
		version,
		updatedFiles: [],
	}

	const context = unwrapFatal(await buildContext(result, settings));

	unwrapFatal(await renderMessages(context, settings));

	const txOptions = buildTransactionOptions(settings);

	unwrapFatal(await withGitTransaction(async () => {
		if(options.pause) {
			if(settings.ci) {
				logger.fatal('Cannot pause in CI');
			}

			logger.print(`${c.gray(c.symbols.pointer)} Version (${formatVersion(result.version)})`);
			logger.print(`${c.gray(c.symbols.pointer)} Commit (${context.commitHeader})`);
			logger.print(`${c.gray(c.symbols.pointer)} Tag (${context.tagName})`);

			await enquirer.prompt({
				type: 'invisible',
				name: 'pause',
				message: settings.commit.all ? 'Modify the files as needed, then press ENTER to continue...' : 'Press ENTER to continue...',
			});
		}


		return await publishToTag(context, settings);
	}, txOptions));

	logger.finishTimer();
}
