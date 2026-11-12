import type { Choice } from '@zokugun/cli-utils/enquirer';
import type { AsyncDResult } from '@zokugun/xtry';
import type { IncrementType } from 'verkit';
import type { BumpResult, Settings } from '../bump/types.js';

import { enquirer } from '@zokugun/cli-utils/enquirer';
import logger from '@zokugun/cli-utils/logger';
import { err, ok } from '@zokugun/xtry';
import { isValid as isValidVersion, tryParse } from 'verkit';

import { Mode } from '#/bump/mode.js';
import { formatVersion } from '#utils/formatVersion.js';
import { incrementVersion } from '#utils/incrementVersion.js';
import { toIncrementType } from '#utils/toIncrementType.js';

const DEFAULT_CHOICES: Mode[] = [
	Mode.Patch,
	Mode.Minor,
	Mode.Major,
	Mode.PreRelease | Mode.Patch,
	Mode.PreRelease | Mode.Minor,
	Mode.PreRelease | Mode.Major,
];
const IS_PRERELEASE_CHOICES: Mode[] = [
	Mode.PreRelease,
	Mode.Patch,
	Mode.Minor,
	Mode.Major,
];
const TO_PRERELEASE_CHOICES: Mode[] = [
	Mode.PreRelease | Mode.Patch,
	Mode.PreRelease | Mode.Minor,
	Mode.PreRelease | Mode.Major,
];

export async function promptNextVersion(settings: Settings): AsyncDResult<BumpResult> {
	const choices = await getIncrementChoices(settings);

	if(choices.fails) {
		return choices;
	}

	const { increment } = await enquirer.prompt<{ increment: IncrementType | 'exit' | '' }>([
		{
			type: 'select',
			name: 'increment',
			message: 'Select increment (next version):',
			choices: choices.value,
		},
	]);

	if(increment === 'exit') {
		logger.exit();
	}

	let input: string;

	if(increment) {
		input = increment;
	}
	else {
		({input} = await enquirer.prompt<{ input: string }>([
			{
				type: 'input',
				name: 'input',
				required: true,
				message: 'Please enter a valid version:',
				validate: (input) => isValidVersion(input) || 'The version must follow the SemVer standard.',
			},
		]));
	}

	const version = tryParse(input);

	if(!version) {
		return err(`Invalid SemVer version: ${input}`);
	}

	return ok({
		oldVersion: settings.currentVersion,
		releaseType: increment,
		version,
		updatedFiles: [],
	});
}

async function getIncrementChoices({ isCurrentlyPreRelease, preRelease, build, mode, currentVersion, cwd }: Settings): AsyncDResult<Choice[]> {
	const increments = isCurrentlyPreRelease ? IS_PRERELEASE_CHOICES : (mode & Mode.PreRelease) ? TO_PRERELEASE_CHOICES : DEFAULT_CHOICES;
	const options = { preRelease, build, cwd };
	const choices: Choice[] = [];

	for(const increment of increments) {
		const result = await incrementVersion(currentVersion, increment, options);

		if(result.fails) {
			return result;
		}

		const name = formatVersion(result.value)

		choices.push({
			message: `${toIncrementType(increment)} (${name})`,
			name,
		})
	}

	choices.push(
		{
			message: 'Other, please specify...',
			name: '',
		},
		{
			message: 'Exit',
			name: 'exit',
		},
	);

	return ok(choices);
}
