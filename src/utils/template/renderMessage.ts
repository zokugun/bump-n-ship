import type { AsyncDResult } from '@zokugun/xtry';
import type { Tokens } from './types.js';

import { err, ok } from '@zokugun/xtry';
import dayjs from 'dayjs';

import { extended } from '../extended-dayjs.js';
import { loadGitTokens } from './loadGitTokens.js';

const CAPTURE_REGEX = /\{(date|git|major|minor|oldVersion|patch|releaseType|tag|version)(?::([0-9A-Za-z]+))?\}/g;
const DETECT_REGEX = /\{(?:date|git|major|minor|oldVersion|patch|releaseType|tag|version)(?::[0-9A-Za-z]+)?\}/;
const GIT_PROPERTIES = ['branch', 'commitId', 'distance'];

dayjs.extend(extended);

export async function renderMessage(template: string, tokens: Tokens, cwd: string): AsyncDResult<string> {
	if(!DETECT_REGEX.test(template)) {
		return ok(template);
	}

	let replaced = '';
	let lastIndex = 0;

	for(const match of template.matchAll(CAPTURE_REGEX)) {
		const [token, name, property] = match;

		replaced += template.slice(lastIndex, match.index);

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
			replaced += tokens[name] ?? ''
		}

		lastIndex = match.index + token.length;
	}

	replaced += template.slice(lastIndex);

	return ok(replaced);
}
