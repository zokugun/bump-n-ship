import type { IncrementType } from 'verkit';

import { Mode } from '#/bump/mode.js';

export function toIncrementType(mode: Mode): IncrementType {
	if(mode & Mode.Major) {
		return `${mode & Mode.PreRelease ? 'pre' : ''}major`;
	}
	if(mode & Mode.Minor) {
		return `${mode & Mode.PreRelease ? 'pre' : ''}minor`;
	}
	if(mode & Mode.Patch) {
		return `${mode & Mode.PreRelease ? 'pre' : ''}patch`;
	}

	return `${mode & Mode.PreRelease ? 'pre' : ''}release`;
}
