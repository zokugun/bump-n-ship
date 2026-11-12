import type { AsyncDResult } from '@zokugun/xtry';
import type { SemVer } from 'verkit';

import { err, ok } from '@zokugun/xtry';

import { Mode } from '#/bump/mode.js';
import { formatVersion } from './formatVersion.js';
import { renderBuild } from './template/renderBuild.js';
import { renderPreRelease } from './template/renderPreRelease.js';

export async function incrementVersion(version: SemVer, mode: Mode, options: { build?: string; cwd: string; preRelease: string }): AsyncDResult<SemVer> {
	const tokens = {}
	const buildResult = await renderBuild(options.build, tokens, options.cwd);

	if(buildResult.fails) {
		return buildResult;
	}

	const build = buildResult.value;

	if(mode & Mode.PreRelease) {
		if(mode & Mode.Major) {
			const prerelease = await renderPreRelease(options.preRelease, null, tokens, options.cwd);

			if(prerelease.fails) {
				return prerelease;
			}

			return ok({
				major: version.major + 1,
				minor: 0,
				patch: 0,
				prerelease: prerelease.value,
				build,
			})
		}

		if(mode & Mode.Minor) {
			const prerelease = await renderPreRelease(options.preRelease, null, tokens, options.cwd);

			if(prerelease.fails) {
				return prerelease;
			}

			return ok({
				major: version.major,
				minor: version.minor + 1,
				patch: 0,
				prerelease: prerelease.value,
				build,
			})
		}

		if(mode & Mode.Patch) {
			const prerelease = await renderPreRelease(options.preRelease, null, tokens, options.cwd);

			if(prerelease.fails) {
				return prerelease;
			}

			return ok({
				major: version.major,
				minor: version.minor,
				patch: version.patch + 1,
				prerelease: prerelease.value,
				build,
			})
		}

		const prerelease = await renderPreRelease(options.preRelease, version.prerelease, tokens, options.cwd);

		if(prerelease.fails) {
			return prerelease;
		}

		return ok({
			major: version.major,
			minor: version.minor,
			patch: version.patch + (version.prerelease ? 0 : 1),
			prerelease: prerelease.value,
			build,
		})
	}
	else {
		if(mode & Mode.Major) {
			return ok({
				major: version.major + 1,
				minor: 0,
				patch: 0,
				build,
			})
		}

		if(mode & Mode.Minor) {
			return ok({
				major: version.major,
				minor: version.minor + 1,
				patch: 0,
				build,
			})
		}

		if(mode & Mode.Patch) {
			return ok({
				major: version.major,
				minor: version.minor,
				patch: version.prerelease?.length ? version.patch : version.patch + 1,
				build,
			})
		}

		if(!version.prerelease?.length) {
			return err(`version ${formatVersion(version)} is not a prerelease`)
		}

		return ok({
			major: version.major,
			minor: version.minor,
			patch: version.patch,
			build,
		})
	}
}
