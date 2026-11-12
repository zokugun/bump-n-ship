import type { DResult } from '@zokugun/xtry';

import { err, ok } from '@zokugun/xtry';

import { Mode } from '#/bump/mode.js';

export function fromModeString(value: string): DResult<Mode> {
	let mode = Mode.Nil;
	let unpre = value;

	if(value.startsWith('pre')) {
		mode |= Mode.PreRelease

		unpre = value.slice(3);
	}

	if(unpre === 'major') {
		mode |= Mode.Major
	}
	else if(unpre === 'minor') {
		mode |= Mode.Minor
	}
	else if(unpre === 'patch') {
		mode |= Mode.Patch
	}
	else if(unpre !== 'release') {
		return err(`Invalid mode: ${value}`)
	}

	return ok(mode)
}
