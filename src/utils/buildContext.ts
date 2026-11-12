import type { AsyncDResult } from '@zokugun/xtry';
import type { BumpResult } from '#/bump/types.js';
import type { Settings, Context } from '#/publish/types.js';

import { ok } from '@zokugun/xtry';

import { buildTokens } from './template/buildTokens.js';

export async function buildContext(result: BumpResult, settings: Settings): AsyncDResult<Context> {
	const tokens = await buildTokens(result, settings.cwd, settings.tag?.name);

	if(tokens.fails) {
		return tokens;
	}

	return ok({
		tokens: tokens.value,
		updatedFiles: result.updatedFiles,
		version: result.version,
	});
}
