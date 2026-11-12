import type { JsonData } from '../types.js';

import fse from '@zokugun/fs-extra-plus/async';
import { toEOL, toSpaces } from '@zokugun/text-line-utils';
import { err, OK, type Result, stringifyError } from '@zokugun/xtry';

export async function writeJSON(file: string, jsonData: JsonData): Promise<Result<void, string>> {
	const result = await fse.writeJSON(file, jsonData.data, {
		EOL: toEOL(jsonData.eol),
		finalEOL: jsonData.finalEOL,
		spaces: toSpaces(jsonData.indent),
	});

	if(result.fails) {
		return err(stringifyError(result.error));
	}

	return OK;
}
