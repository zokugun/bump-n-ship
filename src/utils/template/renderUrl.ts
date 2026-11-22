import type { AsyncDResult } from '@zokugun/xtry';
import type { Tokens } from '#/utils/template/types.js';

import { err } from '@zokugun/xtry';
import { URL } from 'node:url'

import { renderMessage } from './renderMessage.js';

export async function renderUrl(template: string, tokens: Tokens, cwd: string): AsyncDResult<string> {
	const completionUrl = await renderMessage(template, tokens, cwd);

	if(completionUrl.fails) {
		return completionUrl;
	}

	if(!URL.canParse(completionUrl.value)) {
		return err('Invalid URL');
	}

	const url = new URL(completionUrl.value);

	if(url.protocol !== 'http:' && url.protocol !== 'https:') {
		return err('URL must use the http or https protocol');
	}

	return completionUrl;
}
