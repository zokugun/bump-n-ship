import type { AsyncDResult } from '@zokugun/xtry';
import type { BumpResult, Settings } from '#/bump/types.js';

import { err } from '@zokugun/xtry';

export async function determineNextVersion(settings: Settings): AsyncDResult<BumpResult> {
	return err('Function not implemented.');
}
