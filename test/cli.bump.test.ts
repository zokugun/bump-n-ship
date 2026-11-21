import { createCommand } from '@zokugun/cli-utils/exec';
import fse from '@zokugun/fs-extra-plus';
import { defineTestsWithCommand } from '@zokugun/vitest-toolkit';

const launcher = fse.resolve(import.meta.dirname, '..', 'dist', 'cli.mjs');
const cli = createCommand('node', [launcher], { env: { FORCE_COLOR: '0' } });

await defineTestsWithCommand(
	cli,
	'bump',
	{
		timeout: 1_000,
	},
	{
		fixture: 'bump',
		stripAnsi: true,
		timeout: 20_000,
	},
);
