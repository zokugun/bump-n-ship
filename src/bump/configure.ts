import type { AsyncDResult } from '@zokugun/xtry';
import type { Options, Settings } from './types.js';

import { isNonBlankString, isString } from '@zokugun/is-it-type';
import { isCI } from '@zokugun/cli-utils';
import { err, ok } from '@zokugun/xtry';
import { tryParse } from 'verkit';

import { Mode } from './mode.js';
import { loadConfig } from '#utils/load-config.js';
import { fromModeString } from '#utils/fromModeString.js';
import { getCurrentVersion } from '#/utils/getCurrentVersion.js';

export async function configure(options: Options): AsyncDResult<Settings> {
	const root = process.cwd();
	const configResult = await loadConfig(root);

	if(configResult.fails) {
		return configResult;
	}

	const config = configResult.value;
	const settings: Partial<Settings> = {
		ci: options.ci ?? isCI(),
		cwd: root,
		dryRun: options.dryRun ?? false,
		ignoreScripts: options.ignoreScripts ?? false,
		mode: Mode.Prompt,
		preRelease: config.bump.preRelease,
	};

	if(isNonBlankString(options.build)) {
		settings.build = options.build;
	}

	if(isNonBlankString<string>(options.currentVersion)) {
		const version = tryParse(options.currentVersion);

		if(!version) {
			return err(`Invalid SemVer version: ${options.currentVersion}`);
		}

		settings.currentVersion = version;
	}
	else {
		const result = await getCurrentVersion(root);

		if(result.fails) {
			return result;
		}

		settings.currentVersion = result.value;
	}

	if(options.setVersion) {
		if(options.auto || options.increment || options.major || options.minor || options.patch || options.release) {
			return err('"set-version" is exclusive to "auto", "increment", "major", "minor", "patch" and "release"');
		}

		const version = tryParse(options.setVersion);

		if(!version) {
			return err(`Invalid SemVer version: ${options.setVersion}`);
		}

		settings.mode = Mode.Version;
		settings.nextVersion = version;
	}


	if(options.increment) {
		if(options.auto || options.major || options.minor || options.patch || options.release || options.setVersion) {
			return err('"increment" is exclusive to "auto", "major", "minor", "patch" and "release" and "set-version"');
		}

		const result = fromModeString(options.increment);

		if(result.fails) {
			return result;
		}

		settings.mode = result.value;
	}

	if(options.auto) {
		if(options.major || options.minor || options.patch || options.pre === true || options.release || options.increment || options.setVersion) {
			return err('"auto" is exclusive to "increment", "major", "minor", "patch", "pre", "release" and "set-version"');
		}

		settings.mode = Mode.Auto;
	}

	if(options.major) {
		if(options.auto || options.minor || options.patch || options.release || options.increment || options.setVersion) {
			return err('"major" is exclusive to "auto", "increment", "minor", "patch", "release" and "set-version"');
		}

		settings.mode = Mode.Major;
	}

	if(options.minor) {
		if(options.auto || options.major || options.patch || options.release || options.increment || options.setVersion) {
			return err('"minor" is exclusive to "auto", "increment", "major", "patch", "release" and "set-version"');
		}

		settings.mode = Mode.Minor;
	}

	if(options.patch) {
		if(options.auto || options.major || options.minor || options.release || options.increment || options.setVersion) {
			return err('"patch" is exclusive to "auto", "increment", "major", "minor", "release" and "set-version"');
		}

		settings.mode = Mode.Patch;
	}

	if(options.release) {
		if(options.auto || options.major || options.minor || options.patch || options.increment || options.setVersion) {
			return err('"release" is exclusive to "auto", "increment", "major", "minor", "patch" and "set-version"');
		}

		settings.mode = Mode.Nil;
	}

	if(isString(options.pre)) {
		settings.mode = settings.mode! | Mode.PreRelease;
		settings.preRelease = options.pre;
	}
	else if(options.pre) {
		settings.mode = settings.mode! | Mode.PreRelease;
	}

	return ok(settings as Settings)
}
