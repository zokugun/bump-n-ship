import type { Settings } from '../src/bump/types.js';

import process from 'node:process';
import fse from '@zokugun/fs-extra-plus/sync';
import { xtry } from '@zokugun/xtry/sync';
import { parse } from 'verkit';
import { expect, it } from 'vitest';
import YAML from 'yaml';

import { calculateNextVersion } from '#/bump/calculateNextVersion.js';
import { formatVersion } from '#/utils/formatVersion.js';
import { fromModeString } from '#utils/fromModeString.js';

const DEBUG = process.env.DEBUG === '1' || process.env.DEBUG === 'true' || process.env.DEBUG === 'on';
const ROOT = fse.join('.', 'test', 'fixtures', 'calculate-next-version');

const files = fse.walk(ROOT, {
	absolute: true,
	onlyFiles: true,
	collect: true,
	filter: (item) => item.path.endsWith('.yml'),
});

if(files.fails) {
	throw files.error;
}

for(const file of files.value) {
	const name = fse.leafName(file.path, 1);

	it(name, async () => {
		const content = fse.readFile(file.path, 'utf8');
		if(content.fails) {
			throw content.error;
		}

		const document = xtry(() => YAML.parse(content.value) as unknown);
		if(document.fails) {
			throw document.error;
		}

		const { input, output, error } = document.value as { error?: string; input: Record<string, string>; output?: string };

		const currentVersion = parse(input.version)

		const settings: Settings = {
			ci: true,
			currentVersion,
			cwd: '',
			dryRun: false,
			isCurrentlyPreRelease: Boolean(currentVersion.prerelease),
			mode: fromModeString(input.mode).value!,
			preRelease: input.preRelease ?? 'beta.{index:1}',
			build: input.build,
		};

		const result = await calculateNextVersion(settings);

		if(error) {
			try {
				expect(result.fails).to.be.true;

				expect(result.error).to.eql(error);
			}
			catch (error) {
				if(DEBUG) {
					console.log(result.error);
				}

				throw error;
			}
		}
		else {
			try {
				expect(result.fails).to.be.false;

				expect(formatVersion(result.value!.version!)).to.eql(output);
			}
			catch (error) {
				if(DEBUG) {
					console.log(YAML.stringify(result));
				}

				throw error;
			}
		}
	});
}
