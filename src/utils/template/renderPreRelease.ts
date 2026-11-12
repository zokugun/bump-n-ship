import type { AsyncDResult } from '@zokugun/xtry';
import type { PrereleaseIdentifier } from 'verkit';
import type { Tokens } from './types.js';

import { isNumber } from '@zokugun/is-it-type';
import { err, ok } from '@zokugun/xtry';
import dayjs from 'dayjs';

import { extended } from '../extended-dayjs.js';
import { loadGitTokens } from './loadGitTokens.js';

const CAPTURE_REGEX = /\{(date|git|index)(?::([0-9A-Za-z]+))?\}/g;
const DETECT_REGEX = /\{(?:date|git|index)(?::[0-9A-Za-z]+)?\}/;
const GIT_PROPERTIES = ['branch', 'commitId', 'distance'];

dayjs.extend(extended);

export async function renderPreRelease(template: string, current: PrereleaseIdentifier[] | null | undefined, tokens: Tokens, cwd: string): AsyncDResult<string[]> {
	if(!DETECT_REGEX.test(template)) {
		return ok(template.split('.'));
	}

	const parts = template.split('.');
	const result: string[] = []
	let continuous = true;

	for(const [i, part] of parts.entries()) {
		let replaced = '';
		let lastIndex = 0;

		for(const match of part.matchAll(CAPTURE_REGEX)) {
			const [token, name, property] = match;

			replaced += part.slice(lastIndex, match.index);

			if(name === 'date') {
				replaced += dayjs().format(property);
			}
			else if(name === 'git') {
				if(!tokens.git) {
					const result = await loadGitTokens(tokens, cwd);

					if(result.fails) {
						return result;
					}
				}

				if(!GIT_PROPERTIES.includes(property)) {
					return err(`Undefined git property: ${property}`);
				}

				replaced += tokens.git![property]
			}
			else {
				if(match.index === 0 && token.length === part.length && continuous && isNumber(current?.[i])) {
					replaced += (current[i] + 1);
				}
				else {
					replaced += property ?? 0;
				}
			}

			lastIndex = match.index + token.length;
		}

		if(continuous && lastIndex === 0 && part !== current?.[i]) {
			continuous = false;
		}

		replaced += part.slice(lastIndex);

		result.push(replaced);
	}

	return ok(result);
}
