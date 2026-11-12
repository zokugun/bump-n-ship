import fse from '@zokugun/fs-extra-plus/async';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, expect, it } from 'vitest';
import { commandLine, extendMatchers, type ScratchDirectory, scratchDirectory } from 'vitest-command-line';

extendMatchers();

const root = fse.parentPath(fileURLToPath(import.meta.url));
const launcher = fse.resolve(root, '../dist/cli.mjs');
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

it('get-version', async () => {
	await directory.copyFrom(fse.resolve(root, './fixtures/get-version'));

	const result = await cli.run(['get-version'], {
		cwd: directory.path,
		timeout: 1_000,
	});

	expect(result).toSucceed();
	expect(result).toHaveStdout('0.1.0');
});
