import type { BumpResult, Settings } from '../src/bump/types.js';

import { defineTestsWithResult } from '@zokugun/vitest-toolkit';
import { parse } from 'verkit';
import { expect } from 'vitest';

import { calculateNextVersion } from '#/bump/calculateNextVersion.js';
import { formatVersion } from '#/utils/formatVersion.js';
import { fromModeString } from '#utils/fromModeString.js';

await defineTestsWithResult<{ input: Record<string, string>; output: string }, BumpResult>(
	async ({ input }) => {
		const currentVersion = parse(input.version);

		const settings: Settings = {
			ci: true,
			currentVersion,
			cwd: '',
			dryRun: false,
			ignoreScripts: true,
			isCurrentlyPreRelease: Boolean(currentVersion.prerelease),
			mode: fromModeString(input.mode).value!,
			preRelease: input.preRelease ?? 'beta.{index:1}',
			build: input.build,
		};

		return await calculateNextVersion(settings);
	},
	(value, { output }) => {
		expect(formatVersion(value.version)).to.eql(output);
	},
	{
		fixture: 'calculate-next-version',
	},
);
