import type { AsyncDResult } from '@zokugun/xtry';
import type { SemVer } from 'verkit';

import fse from '@zokugun/fs-extra-plus/async';
import { err, ok } from '@zokugun/xtry';
import { tryParse } from 'verkit';

import { loadJSON } from './load-json.js';

export async function getCurrentVersion(root: string): AsyncDResult<SemVer> {
	const packageJsonPath = fse.join(root, 'package.json');
	const packageJsonData = await loadJSON(packageJsonPath);

	if(packageJsonData.fails) {
		return packageJsonData;
	}

	const version = tryParse(packageJsonData.value.data.version as string);

	if(!version) {
		return err(`Invalid SemVer version: ${packageJsonData.value.data.version}`);
	}

	return ok(version);
}
