import type { AsyncDResult } from '@zokugun/xtry';
import type { BumpResult } from '#/bump/types.js';
import type { Tokens } from './types.js';

import { isNonBlankString } from '@zokugun/is-it-type';
import { ok } from '@zokugun/xtry';

import { formatVersion } from '../formatVersion.js';
import { renderMessage } from './renderMessage.js';

export async function buildTokens({ version, oldVersion, releaseType }: BumpResult, cwd: string, tagName?: string): AsyncDResult<Tokens> {
	const tokens: Tokens = {
		major: String(version.major),
		minor: String(version.minor),
		oldVersion: formatVersion(oldVersion),
		patch: String(version.patch),
		releaseType,
		version: formatVersion(version),
	};

	if(isNonBlankString<string>(tagName)) {
		const result = await renderMessage(tagName, tokens, cwd)

		if(result.fails) {
			return result;
		}

		tokens.tag = result.value;
	}
	else {
		tokens.tag = `v${tokens.version}`;
	}

	return ok(tokens);
}
