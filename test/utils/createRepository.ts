import type { ScratchDirectory } from 'vitest-command-line';

import fse from '@zokugun/fs-extra-plus/async';
import { parse } from 'verkit';

import { Mode } from '#/bump/mode.js';
import { formatVersion } from '#/utils/formatVersion.js';
import { incrementVersion } from '#/utils/incrementVersion.js';
import { git } from './git.js';

export async function createRepository(directory: ScratchDirectory, options?: { pkg?: Record<string, unknown>; nextVersion?: string }): Promise<{ remote: string; repository: string; }> {
	const repository = fse.join(directory.path, 'repository');
	const remote = fse.join(directory.path, 'remote.git');
	const pkg = { name: 'test', version: '1.0.0', ...options?.pkg };

	await fse.mkdir(repository, { recursive: true });
	await git(directory.path, 'init', '--bare', remote);
	await git(repository, 'init', '--initial-branch=main');
	await git(repository, 'config', 'user.name', 'Test User');
	await git(repository, 'config', 'user.email', 'test@example.com');
	await git(repository, 'remote', 'add', 'origin', remote);

	await fse.writeJSON(fse.join(repository, 'package.json'), pkg);
	await git(repository, 'add', '--all');
	await git(repository, 'commit', '--message', 'feat: initial commit');
	await git(repository, 'tag', '1.0.0');
	await git(repository, 'push', '--quiet', '--set-upstream', 'origin', 'main', '--tags');
	await git(repository, 'remote', 'set-head', 'origin', 'main');

	let nextVersion = options?.nextVersion;

	if(!nextVersion) {
		const result = await incrementVersion(parse(String(pkg.version)), Mode.Patch, {
			cwd: repository,
			preRelease: 'beta.{index:1}',
		});

		if(result.fails) {
			throw result.error;
		}

		nextVersion = formatVersion(result.value);
	}

	await fse.writeJSON(fse.join(repository, 'package.json'), { ...pkg, version: nextVersion });
	await git(repository, 'add', 'package.json');
	await git(repository, 'commit', '--message', 'bump version');

	return { remote, repository };
}
