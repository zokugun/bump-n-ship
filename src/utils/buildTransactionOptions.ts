import type { TxOptions } from '@zokugun/git-toolkit/lib/cjs/types.cjs';
import type { Settings } from '#/publish/types.js';

export function buildTransactionOptions(settings: Settings): TxOptions {
	const options: TxOptions = {
		cwd: settings.cwd,
		remote: settings.remote,
	}

	if(settings.pullRequest) {
		options.branchMode = 'any';
	}
	else {
		options.branchMode = 'only-main';
		options.keepCopies = settings.dirty;
	}

	return options;
}
