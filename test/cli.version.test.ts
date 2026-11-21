import { createCommand } from '@zokugun/cli-utils';
import fse from '@zokugun/fs-extra-plus/async';
import { makeTempDir } from '@zokugun/vitest-toolkit'
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, expect, it } from 'vitest';

import pkg from '../package.json' with { type: 'json' };

const root = fse.parentPath(fileURLToPath(import.meta.url));
const launcher = fse.resolve(root, '../dist/cli.mjs');
const cli = createCommand('node', [launcher], { env: { FORCE_COLOR: '0' } });

let directory: string;

beforeEach(async () => {
	directory = await makeTempDir();
});

afterEach(async () => {
	await fse.remove(directory);
});

it('version', async () => {
	const result = await cli(['--version'], {
		cwd: directory,
		timeout: 1_000,
	});

	expect(result).toSucceed();
	expect(result).toHaveStdout(pkg.version);
});
