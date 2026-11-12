import type { AsyncDResult, DResult, YResult } from '@zokugun/xtry';

import path from 'node:path';
import fse from '@zokugun/fs-extra-plus/async';
import { isBoolean, isNonBlankString, isRecord } from '@zokugun/is-it-type';
import { err, ok, stringifyError, xtrySync, yerr, yresAsync } from '@zokugun/xtry';
import YAML from 'yaml';

export type Config = {
	bump: {
		preRelease: string
	},
	publish: {
		all: boolean;
		commit?: {
			header?: string;
			body?: string;
			footer?: string;
		};
		dirty: boolean;
		pullRequest?: {
			base?: string;
			body?: string;
			branch?: string;
			draft?: boolean;
			title?: string;
		};
		remote: string;
		sign: boolean;
		tag?: {
			name?: string;
			message?: string;
		};
		verify: boolean;
	}
}

const CONFIG_FILES: Array<{ name: string; type?: 'json' | 'yaml' }> = [
	{
		name: '.bumpnshiprc.yml',
		type: 'yaml',
	},
	{
		name: '.bumpnshiprc.yaml',
		type: 'yaml',
	},
	{
		name: '.bumpnshiprc.json',
		type: 'json',
	},
	{
		name: '.bumpnshiprc',
	},
];

export async function loadConfig(fileRoot: string): AsyncDResult<Config> { // {{{
	for(const { name, type } of CONFIG_FILES) {
		const filename = path.join(fileRoot, name);
		const result = await tryReadConfigFile(filename, fileRoot, name, type);

		if(result.fails || result.success) {
			return result;
		}
	}

	return normalizeConfig({}, fileRoot, '');
} // }}}

async function normalizeConfig(data: unknown, root: string, source: string): AsyncDResult<Config> { // {{{
	if(!isRecord(data)) {
		return err(`Config file ${source} must export an object.`);
	}

	const bump: Config['bump'] = { preRelease: 'beta.{index:1}' };

	if(isRecord(data.bump)) {
		const { preRelease } = data.bump;

		if(isNonBlankString<string>(preRelease)) {
			bump.preRelease = preRelease.trim();
		}
	}

	const publish: Config['publish'] = {
		all: false,
		dirty: false,
		remote: 'origin',
		sign: false,
		verify: true,
	};

	if(isRecord(data.publish)) {
		const { all, commit, dirty, pullRequest, remote, sign, tag, verify } = data.publish;

		if(isBoolean(all)) {
			publish.all = all;
		}

		if(isRecord(commit)) {
			publish.commit = {};

			if(isNonBlankString<string>(commit.header)) {
				publish.commit.header = commit.header.trim();
			}

			if(isNonBlankString<string>(commit.body)) {
				publish.commit.body = commit.body.trim();
			}

			if(isNonBlankString<string>(commit.footer)) {
				publish.commit.footer = commit.footer.trim();
			}
		}

		if(isBoolean(dirty)) {
			publish.dirty = dirty;
		}

		if(isRecord(pullRequest)) {
			publish.pullRequest = {};

			if(isNonBlankString<string>(pullRequest.base)) {
				publish.pullRequest.base = pullRequest.base.trim();
			}

			if(isNonBlankString<string>(pullRequest.body)) {
				publish.pullRequest.body = pullRequest.body.trim();
			}

			if(isNonBlankString<string>(pullRequest.branch)) {
				publish.pullRequest.branch = pullRequest.branch.trim();
			}

			if(isBoolean(pullRequest.draft)) {
				publish.pullRequest.draft = pullRequest.draft;
			}

			if(isNonBlankString<string>(pullRequest.title)) {
				publish.pullRequest.title = pullRequest.title.trim();
			}
		}

		if(isNonBlankString<string>(remote)) {
			publish.remote = remote.trim();
		}

		if(isBoolean(sign)) {
			publish.sign = sign;
		}

		if(isRecord(tag)) {
			publish.tag = {};

			if(isNonBlankString<string>(tag.name)) {
				publish.tag.name = tag.name.trim();
			}

			if(isNonBlankString<string>(tag.message)) {
				publish.tag.message = tag.message.trim();
			}
		}

		if(isBoolean(verify)) {
			publish.verify = verify;
		}
	}

	return ok({
		bump,
		publish,
	});
} // }}}

function parseConfigContent(content: string, type?: 'json' | 'yaml'): DResult<unknown> { // {{{
	if(type === 'json') {
		return xtrySync(() => JSON.parse(content) as unknown, stringifyError);
	}

	if(type === 'yaml') {
		return xtrySync(() => YAML.parse(content) as unknown, stringifyError);
	}

	let result = xtrySync(() => JSON.parse(content) as unknown, stringifyError);

	if(result.fails) {
		result = xtrySync(() => YAML.parse(content) as unknown, stringifyError);
	}

	return result;
} // }}}

async function tryReadConfigFile(filename: string, root: string, name: string, type?: 'json' | 'yaml'): Promise<YResult<Config, string, 'not-found'>> { // {{{
	const content = await fse.readFile(filename, 'utf8');

	if(content.fails) {
		if(content.error.code === 'ENOENT') {
			return yerr('not-found');
		}

		return err(`Failed to read ${name} from package: ${stringifyError(content.error)}`);
	}

	const parsed = parseConfigContent(content.value, type);

	if(parsed.fails) {
		return err(`Failed to parse ${name} from package: ${parsed.error}`);
	}

	return yresAsync(normalizeConfig(parsed.value, root, name));
} // }}}
