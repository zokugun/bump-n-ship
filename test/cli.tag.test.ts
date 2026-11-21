/* eslint-disable no-console */

import { createCommand } from '@zokugun/cli-utils';
import fse from '@zokugun/fs-extra-plus/async';
import { makeTempDir } from '@zokugun/vitest-toolkit'
import { afterEach, beforeEach, expect, it } from 'vitest';

import { createRepository } from './utils/createRepository.js';
import { git } from './utils/git.js';

const PROJECT_ROOT = fse.resolve(import.meta.dirname, '..');
const launcher = fse.resolve(PROJECT_ROOT, 'dist', 'cli.mjs');
const cli = createCommand('node', [launcher], { env: { FORCE_COLOR: '0' } });

let directory: string;

beforeEach(async () => {
	directory = await makeTempDir();
});

afterEach(async () => {
	await fse.remove(directory);
});

it('default', async () => { // {{{
	const { remote, repository } = await createRepository(directory);

	const result = await cli(['tag'], {
		cwd: repository,
		timeout: 5_000,
	});

	expect(result).toSucceed();
	expect(await git(repository, 'log', '-1', '--pretty=%s')).to.eql('1.0.1');
	expect(await git(repository, 'tag', '--list')).to.contain('1.0.1');
	expect(await git(remote, '--git-dir', remote, 'show-ref', '--tags', '1.0.1')).to.contain('refs/tags/1.0.1');
	expect(await git(remote, '--git-dir', remote, 'rev-parse', 'refs/heads/main')).to.eql(await git(repository, 'rev-parse', 'HEAD'));
}, 20_000); // }}}

it('dirty.nopt', async () => { // {{{
	const { repository } = await createRepository(directory);
	const originalHead = await git(repository, 'rev-parse', 'HEAD');

	await fse.writeJSON(fse.join(repository, 'package.json'), { name: 'test', version: '1.0.2' });

	const result = await cli(['tag'], {
		cwd: repository,
		stripAnsi: true,
		timeout: 5_000,
	});

	expect(result).toFail();
	expect(result).toHaveStdout('The working directory must be clean.');
	expect(await git(repository, 'rev-parse', 'HEAD')).to.eql(originalHead);
	expect(await git(repository, 'tag', '--list')).not.to.contain('1.0.1');
}, 20_000); // }}}

it('dirty.wopt', async () => { // {{{
	const { remote, repository } = await createRepository(directory);

	await fse.writeJSON(fse.join(repository, 'package.json'), { name: 'test', version: '1.0.2' });

	const result = await cli(['tag', '--dirty'], {
		cwd: repository,
		timeout: 5_000,
	});

	expect(result).toSucceed();
	expect(await git(repository, 'log', '-1', '--pretty=%s')).to.eql('1.0.2');
	expect(await git(repository, 'tag', '--list')).to.contain('1.0.2');
	expect(await git(remote, '--git-dir', remote, 'show-ref', '--tags', '1.0.2')).to.contain('refs/tags/1.0.2');
}, 20_000); // }}}

it('opt.all.dirty=cfg', async () => { // {{{
	const { repository } = await createRepository(directory);

	await fse.writeJSON(fse.join(repository, '.bumpnshiprc.json'), { publish: { dirty: true } });
	await fse.writeFile(fse.join(repository, 'extra.txt'), 'included by --all');

	const result = await cli(['tag', '--all'], {
		cwd: repository,
		timeout: 5_000,
	});

	expect(result).toSucceed();
	expect(await git(repository, 'show', 'HEAD:extra.txt')).to.eql('included by --all');
}, 20_000); // }}}

it('opt.all.dirty=opt', async () => { // {{{
	const { repository } = await createRepository(directory);

	await fse.writeFile(fse.join(repository, 'extra.txt'), 'included by --all');

	const result = await cli(['tag', '--all', '--dirty'], {
		cwd: repository,
		timeout: 5_000,
	});

	expect(result).toSucceed();
	expect(await git(repository, 'show', 'HEAD:extra.txt')).to.eql('included by --all');
}, 20_000); // }}}

it('opt.commit', async () => { // {{{
	const { repository } = await createRepository(directory);

	const result = await cli(['tag', '--commit', 'release: 1.0.1'], {
		cwd: repository,
		timeout: 5_000,
	});

	expect(result).toSucceed();
	expect(await git(repository, 'log', '-1', '--pretty=%s')).to.eql('release: 1.0.1');
}, 20_000); // }}}

it('opt.dry-run', async () => { // {{{
	const { repository } = await createRepository(directory);
	const originalHead = await git(repository, 'rev-parse', 'HEAD');

	const result = await cli(['tag', '--dry-run'], {
		cwd: repository,
		timeout: 5_000,
	});

	expect(result).toSucceed();
	expect(result).toHaveStdout('git commit --quiet --allow-empty --message 1.0.1');
	expect(result).toHaveStdout('git tag --annotate 1.0.1 --message 1.0.1');
	expect(result).toHaveStdout('git push --quiet --tags');
	expect(await git(repository, 'rev-parse', 'HEAD')).to.eql(originalHead);
	expect(await git(repository, 'tag', '--list')).not.to.contain('1.0.1');
}, 20_000); // }}}

it('opt.ignore-scripts.ok', async () => { // {{{
	const { repository } = await createRepository(directory, { pkg: { scripts: { postversion: 'node -e "process.exit(1)"' } } });

	const result = await cli(['tag', '--ignore-scripts'], {
		cwd: repository,
		timeout: 5_000,
	});

	expect(result).toSucceed();
	expect(await git(repository, 'tag', '--list')).to.contain('1.0.1');
}, 20_000); // }}}

it('opt.ignore-scripts.nok.ndirt', async () => { // {{{
	const { repository } = await createRepository(directory, { pkg: { scripts: { postversion: 'node -e "process.exit(1)"' } } });
	const originalHead = await git(repository, 'rev-parse', 'HEAD');

	const result = await cli(['tag'], {
		cwd: repository,
		timeout: 5_000,
	});

	expect(result).toFail();
	expect(result).toHaveStdout('✖ Fatal!');
	expect(await git(repository, 'rev-parse', 'HEAD')).to.eql(originalHead);
	expect(await git(repository, 'status', '--porcelain')).to.eql('');
	expect(await git(repository, 'log', '-1', '--pretty=%s')).to.not.eql('1.0.1');
	expect(await git(repository, 'tag', '--list')).to.not.contain('1.0.1');
}, 20_000); // }}}

it('opt.ignore-scripts.nok.wdirt', async () => { // {{{
	const { repository } = await createRepository(directory, { pkg: { scripts: { postversion: 'node -e "process.exit(1)"' } } });
	const originalHead = await git(repository, 'rev-parse', 'HEAD');

	await fse.writeFile(fse.join(repository, 'extra.txt'), 'included by --all');

	const result = await cli(['tag', '--all', '--dirty'], {
		cwd: repository,
		timeout: 5_000,
	});

	expect(result).toFail();
	expect(result).toHaveStdout('✖ Fatal!');
	expect(await git(repository, 'rev-parse', 'HEAD')).to.eql(originalHead);
	expect(await git(repository, 'status', '--porcelain')).to.eql('?? extra.txt');
	expect(await git(repository, 'log', '-1', '--pretty=%s')).to.not.eql('1.0.1');
	expect(await git(repository, 'tag', '--list')).to.not.contain('1.0.1');
	expect(await git(repository, 'stash', 'list')).to.eql('');

	const content = await fse.readFile(fse.join(repository, 'extra.txt'), 'utf8');
	expect(content.fails).toBe(false);
	expect(content.value!).to.eql('included by --all');
}, 20_000); // }}}

it('opt.no-verify.ok', async () => { // {{{
	const { repository } = await createRepository(directory);
	const hook = fse.join(repository, '.git', 'hooks', 'pre-commit');

	await fse.writeFile(hook, '#!/bin/sh\nexit 1\n');
	await fse.chmod(hook, 0o755);

	const result = await cli(['tag', '--no-verify'], {
		cwd: repository,
		timeout: 5_000,
	});

	expect(result).toSucceed();
	expect(await git(repository, 'tag', '--list')).to.contain('1.0.1');
}, 20_000); // }}}

it('opt.no-verify.nok', async () => { // {{{
	const { repository } = await createRepository(directory);
	const hook = fse.join(repository, '.git', 'hooks', 'pre-commit');

	await fse.writeFile(hook, '#!/bin/sh\nexit 1\n');
	await fse.chmod(hook, 0o755);

	const result = await cli(['tag'], {
		cwd: repository,
		timeout: 5_000,
	});

	expect(result).toFail();
	expect(result).toHaveStdout('✖ Fatal!');
	expect(await git(repository, 'log', '-1', '--pretty=%s')).to.not.eql('1.0.1');
	expect(await git(repository, 'tag', '--list')).to.not.contain('1.0.1');
}, 20_000); // }}}

it('opt.pr', async () => { // {{{
	const { repository } = await createRepository(directory);

	const result = await cli(['tag', '--pr'], {
		cwd: repository,
		timeout: 5_000,
	});

	expect(result).toFail();
	expect(result).toHaveStderr('unknown option \'--pr\'');
}, 20_000); // }}}

it('opt.tag', async () => { // {{{
	const { repository } = await createRepository(directory);

	const result = await cli(['tag', '--tag', 'release-1.0.1'], {
		cwd: repository,
		timeout: 5_000,
	});

	expect(result).toSucceed();
	expect(await git(repository, 'tag', '--list')).to.contain('release-1.0.1');
}, 20_000); // }}}
