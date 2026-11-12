import { unwrapFatal } from '@zokugun/cli-utils';

import { formatVersion } from '#utils/formatVersion.js';
import { getCurrentVersion } from '#utils/getCurrentVersion.js';

export async function getVersion(): Promise<void> {
	const root = process.cwd();
	const version = unwrapFatal(await getCurrentVersion(root));

	console.log(formatVersion(version));
}
