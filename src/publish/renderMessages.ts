import type { AsyncDResult } from '@zokugun/xtry';
import type { Context, Settings } from './types.js';

import { isString } from '@zokugun/is-it-type';
import { OK } from '@zokugun/xtry';

import { renderMessage } from '#utils/template/renderMessage.js';

export async function renderMessages(context: Context, { commit: { body, footer, header }, cwd, pullRequest, tag }: Settings): AsyncDResult {
	let message = header;

	if(isString(body)) {
		message += `\n\n${body}`
	}

	if(isString(footer)) {
		message += `\n\n${footer}`
	}

	const commitMessage = await renderMessage(message, context.tokens, cwd);

	if(commitMessage.fails) {
		return commitMessage;
	}

	context.commitHeader = commitMessage.value.split('\n')[0]
	context.commitMessage = commitMessage.value

	if(pullRequest) {
		const branchName = await renderMessage(pullRequest.branch, context.tokens, cwd);

		if(branchName.fails) {
			return branchName;
		}

		context.branchName = branchName.value;
	}
	else {
		const tagName = await renderMessage(tag!.name, context.tokens, cwd);

		if(tagName.fails) {
			return tagName;
		}

		context.tagName = tagName.value

		const tagMessage = await renderMessage(tag!.message, context.tokens, cwd);

		if(tagMessage.fails) {
			return tagMessage;
		}

		context.tagMessage = tagMessage.value
	}

	return OK;
}
