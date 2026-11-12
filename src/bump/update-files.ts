import type { AsyncDResult } from '@zokugun/xtry';
import type { SemVer } from 'verkit';
import type { FileSettings } from './types.js';

import fse from '@zokugun/fs-extra-plus/async';
import { isString } from '@zokugun/is-it-type';
import { OK } from '@zokugun/xtry';

import { loadJSON } from '#utils/load-json.js';
import { writeJSON } from '#utils/write-json.js';
import { formatVersion } from '#/utils/formatVersion.js';

const FILES = ['package.json', 'package-lock.json']

export async function updateFiles(version: SemVer, updatedFiles: string[], { cwd }: FileSettings): AsyncDResult {
	const newVersion = formatVersion(version);

	for(const file of FILES) {
		const path = fse.join(cwd, file);

		if(await fse.isFile(path)) {
 			const result = await updateManifestFile(file, path, newVersion, updatedFiles);

			if(result.fails) {
				return result;
			}
		}
	}

	return OK;
}

async function updateManifestFile(file: string, path: string, newVersion: string, updatedFiles: string[]): AsyncDResult {
	const data = await loadJSON(path);

	if(data.fails) {
		return data;
	}

	if(data.value.data.version !== newVersion) {
		data.value.data.version = newVersion;

		if(isString(data.value.data.packages?.['']?.version)) {
			data.value.data.packages[''].version = newVersion;
		}

		const writeResult = await writeJSON(path, data.value)

		if(writeResult.fails) {
			return writeResult;
		}

		updatedFiles.push(file);
	}

	return OK;
}
