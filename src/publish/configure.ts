import type { AsyncDResult } from '@zokugun/xtry';
import type { Options, Settings } from './types.js';

import { isCI } from '@zokugun/cli-utils';
import { getDefaultBranch } from '@zokugun/git-toolkit';
import { err, ok } from '@zokugun/xtry';

import { loadConfig } from '#/utils/load-config.js';
import { isNonBlankString, isString } from '@zokugun/is-it-type';

export async function configure(options: Options, allowPR: boolean): AsyncDResult<Settings> {
	const root = process.cwd();
	const configResult = await loadConfig(root);

	if(configResult.fails) {
		return configResult;
	}

	const config = configResult.value;

	if(allowPR) {
		if((options.pr ?? config.publish.pullRequest) && (options.tag ?? config.publish.tag)) {
			return err('"pr" and "tag" are exclusives')
		}
	}

	const settings: Partial<Settings> = {
		ci: options.ci ?? isCI(),
		cwd: root,
		dirty: options.dirty ?? config.publish.dirty,
		dryRun: options.dryRun ?? false,
		ignoreScripts: options.ignoreScripts ?? false,
		interactive: config.interactive,
		remote: config.publish.remote,
		sign: options.sign ?? config.publish.sign,
	};

	if(allowPR && (options.pr ?? config.publish.pullRequest)) {
		const pullRequest: Partial<Settings['pullRequest']> = {
			branch: config.publish.pullRequest?.branch ?? 'release/{tag}',
			draft: config.publish.pullRequest?.draft ?? false,
			title: config.publish.pullRequest?.title ?? 'chore: release {tag}',
			body: config.publish.pullRequest?.body ?? '{oldVersion} → {version}'
		};

		if(isString(config.publish.pullRequest?.base)) {
			pullRequest.base = config.publish.pullRequest.base;
		}
		else {
			const result = await getDefaultBranch(config.publish.remote, root);

			if(result.fails) {
				return result;
			}

			pullRequest.base = result.value;
		}

		settings.pullRequest = pullRequest as Settings['pullRequest'];
	}
	else {
		if(isNonBlankString<string>(options.tag)) {
			settings.tag = {
				name: options.tag.trim(),
				message: '',
			}
		}
		else {
			settings.tag = {
				name: config.publish.tag?.name ?? '{version}',
				message: config.publish.tag?.message ?? '{version}',
			}
		}
	}

	if(isNonBlankString<string>(options.commit)) {
		settings.commit = {
			all: options.all ?? config.publish.all,
			header: options.commit.trim(),
			verify: options.verify ?? config.publish.verify,
		}
	}
	else {
		settings.commit = {
			all: options.all ?? config.publish.all,
			body: config.publish.commit?.body,
			footer: config.publish.commit?.footer,
			header: config.publish.commit?.header ?? '{version}',
			verify: options.verify ?? config.publish.verify,
		}
	}

	if(options.pause) {
		settings.interactive ??= {};

		settings.interactive.version = 'pause';
		settings.interactive.commit = 'pause';
	}

	if(options.confirm) {
		settings.interactive ??= {};

		settings.interactive.version = 'confirm';
		settings.interactive.commit = 'confirm';
		settings.interactive.tag = 'confirm';
		settings.interactive.push = 'confirm';
	}

	if(settings.ci && settings.interactive) {
		return err('Cannot be interactive in CI');
	}

	return ok(settings as Settings);
}
