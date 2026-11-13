/* eslint-disable no-console */

import fse from '@zokugun/fs-extra-plus';
import { isArray, isRecord, isString } from '@zokugun/is-it-type';
import { stringifyError, xtry } from '@zokugun/xtry';
import { afterEach, beforeEach, expect, it } from 'vitest';
import { commandLine, extendMatchers, type ScratchDirectory, scratchDirectory } from 'vitest-command-line';
import YAML from 'yaml';

import { encodeInput } from './utils/encodeInput.js';
import { isCI } from '@zokugun/cli-utils';

extendMatchers();

const DEBUG = process.env.DEBUG === '1' || process.env.DEBUG === 'true' || process.env.DEBUG === 'on';
const PROJECT_ROOT = fse.resolve(import.meta.dirname, '..');
const FIXTURE_ROOT = fse.join('.', 'test', 'fixtures', 'bump');

const files = fse.walkSync(FIXTURE_ROOT, {
	absolute: true,
	onlyFiles: true,
	collect: true,
	filter: (item) => item.path.endsWith('.yml'),
});

if(files.fails) {
	throw files.error;
}

const launcher = fse.resolve(PROJECT_ROOT, 'dist', 'cli.mjs');
const cli = commandLine({
	command: ['node', launcher],
	name: 'bump-n-ship',
	env: { FORCE_COLOR: '0' },
});

let directory: ScratchDirectory;

beforeEach(async () => {
	directory = scratchDirectory();

	await directory.create();
});

afterEach(async () => {
	await directory.remove();
});

for(const file of files.value) {
	const name = fse.leafName(file.path, 1);

	const readResult = fse.readFileSync(file.path, 'utf8');
	if(readResult.fails) {
		throw readResult.error;
	}

	const manifestResult = xtry(() => YAML.parse(readResult.value) as unknown);
	if(manifestResult.fails) {
		console.error(file.path);

		throw manifestResult.error;
	}

	const manifest = manifestResult.value as Record<string, unknown>;

	if(!isRecord(manifest)) {
		throw new Error(`The file "${fse.relative(FIXTURE_ROOT, file.path)}" isn't an object.`);
	}

	it(name, async () => {
		const expectedFiles: Record<string, string | { error: string }> = {};

		for(const [key, data] of Object.entries(manifest)) {
			if(key.startsWith('/input/')) {
				directory.file({ filename: key.slice(7), content: data as string })
			}
			else if(key.startsWith('/output/')) {
				expectedFiles[key.slice(8)] = data as string;
			}
		}

		const args = ['bump'];
		const input: string[] = []

		if(isArray<string>(manifest.args, isString)) {
			args.push(...manifest.args);
		}

		if(isString(manifest.input)) {
			input.push(encodeInput(manifest.input));
		}
		else if(isArray<string>(manifest.input, isString)) {
			input.push(...manifest.input.map(encodeInput));
		}

		if(input.length > 0 && isCI()) {
			return;
		}

		const result = await cli.run(args, {
			cwd: directory.path,
			input,
			stripAnsi: true,
			timeout: 1_000,
		});

		if(isString(manifest.error)) {
			if(DEBUG && (result.success || !result.stdout.includes('✖ Fatal!') || !result.stdout.includes(manifest.error))) {
				console.log(result)
			}

			expect(result).toFail();
			expect(result).toHaveStdout('✖ Fatal!');
			expect(result).toHaveStdout(manifest.error);
		}
		else if(isString(manifest.output)) {
			if(DEBUG && (!result.success || !result.stdout.includes(manifest.output))) {
				console.log(result)
			}

			expect(result).toSucceed();
			expect(result).toHaveStdout(manifest.output);
		}
		else {
			if(DEBUG && (!result.success || !result.output.includes('🏁 Done'))) {
				console.log(result)
			}

			expect(result).toSucceed();
			expect(result).toHaveStdout('🏁 Done');

			for(const [file, data] of Object.entries(expectedFiles)) {
				const content = await fse.readFileAsync(fse.join(directory.path, file), 'utf8');

				if(isString(data)) {
					if(DEBUG && content.fails) {
						console.log(`Expecting file at "${file}"`);
					}

					if(DEBUG && content.value !== data) {
						console.log(result)
					}

					expect(content.fails).to.be.false;
					expect(content.value).to.eql(data);
				}
				else {
					expect(content.fails).to.be.true;
					expect(stringifyError(content.error)).to.eql(`${data.error}, open '${fse.join(directory.path, file)}'`);
				}
			}
		}
	}, 20_000);
}

