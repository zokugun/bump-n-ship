import type { Options as BumpOptions } from '#/bump/types.js';
import type { Options as PublishOptions } from '#/publish/types.js';

import { c, enquirer, logger, unwrapFatal } from '@zokugun/cli-utils';
import { isWorkingDirectoryClean, withGitTransaction } from '@zokugun/git-toolkit';

import { bump } from '#/bump/bump.js';
import { configure as configureBump } from '#/bump/configure.js';
import { Mode } from '#/bump/mode.js';
import { configure as configurePublish } from '#/publish/configure.js';
import { publishToPR } from '#/publish/publishToPR.js';
import { publishToTag } from '#/publish/publishToTag.js';
import { renderMessages } from '#/publish/renderMessages.js';
import { buildContext } from '#utils/buildContext.js';
import { buildTransactionOptions } from '#utils/buildTransactionOptions.js';
import { formatVersion } from '#utils/formatVersion.js';

type Options = BumpOptions & PublishOptions & {
	pause?: boolean;
};

export async function release(options: Options): Promise<void> {
	logger.beginTimer();

	const publishSettings = unwrapFatal(await configurePublish(options, true));

	if((publishSettings.pullRequest || !publishSettings.dirty) && !(await isWorkingDirectoryClean(publishSettings.cwd))) {
		logger.fatal('The working directory must be clean. Please commit or stash your changes.')
	}

	const bumpSettings = unwrapFatal(await configureBump(options));

	if(bumpSettings.ci) {
		logger.flagCI()
	}

	const result = unwrapFatal(await bump(bumpSettings));
	const context = unwrapFatal(await buildContext(result, publishSettings));

	unwrapFatal(await renderMessages(context, publishSettings));

	const txOptions = buildTransactionOptions(publishSettings);

	unwrapFatal(await withGitTransaction(async () => {
		if(options.pause) {
			if(bumpSettings.ci) {
				logger.fatal('Cannot pause in CI');
			}

			if(!(bumpSettings.mode & Mode.Prompt)) {
				logger.print(`${c.gray(c.symbols.pointer)} Next version (${formatVersion(result.version)})`);
			}

			if(publishSettings.pullRequest) {
				logger.print(`${c.gray(c.symbols.pointer)} Branch (${context.branchName})`);
				logger.print(`${c.gray(c.symbols.pointer)} Commit (${context.commitHeader})`);
			}
			else {
				logger.print(`${c.gray(c.symbols.pointer)} Commit (${context.commitHeader})`);
				logger.print(`${c.gray(c.symbols.pointer)} Tag (${context.tagName})`);
			}

			await enquirer.prompt({
				type: 'invisible',
				name: 'pause',
				message: !publishSettings.commit.all || publishSettings.pullRequest ? 'Press ENTER to continue...' : 'Modify the files as needed, then press ENTER to continue...',
			});
		}

		if(publishSettings.pullRequest) {
			return await publishToPR(context, publishSettings);
		}
		else {
			return await publishToTag(context, publishSettings);
		}
	}, txOptions));

	logger.finishTimer();
}
