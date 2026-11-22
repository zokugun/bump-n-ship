
import { logger } from '@zokugun/cli-utils';
import { stringifyError } from '@zokugun/xtry';
import open from 'tiny-open';

export async function openWhenComplete(url: string | undefined, dryRun: boolean): Promise<void> {
	if(!url || dryRun) {
		return;
	}

	try {
		if(!(await open(url))) {
			logger.info(`Failed to open ${url}.`);
		}
	}
	catch(error) {
		logger.info(`Failed to open ${url}: ${stringifyError(error)}`);
	}
}
