import { exec } from '@zokugun/cli-utils/exec'
import fse from '@zokugun/fs-extra-plus/async';
import { makeTempDir } from '@zokugun/vitest-toolkit'
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, expect, it } from 'vitest';

const root = fse.parentPath(fileURLToPath(import.meta.url));
const launcher = fse.resolve(root, '../dist/cli.mjs');

let directory: string;

beforeEach(async () => {
	directory = await makeTempDir();
});

afterEach(async () => {
	await fse.remove(directory);
});

it('get-version', async () => {
	await fse.copy(fse.join(root, './fixtures/get-version'), directory)

	const result = await exec('node', [launcher, 'get-version'], {
		cwd: directory,
		env: { FORCE_COLOR: '0' },
		timeout: 1_000,
	})

	expect(result).toSucceed();
	expect(result).toHaveStdout('0.1.0');
});
