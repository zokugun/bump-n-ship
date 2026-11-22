/* eslint-disable no-console */

import { c, createCommand, isCI } from '@zokugun/cli-utils';
import fse from '@zokugun/fs-extra-plus/async';
import { createStdinStream, makeTempDir, respondToInteractiveProcess, YAML } from '@zokugun/vitest-toolkit';
import { afterEach, beforeEach, expect, it } from 'vitest';

import { createRepository } from './utils/createRepository.js';
import { git } from './utils/git.js';

const PROJECT_ROOT = fse.resolve(import.meta.dirname, '..');
const launcher = fse.resolve(PROJECT_ROOT, 'dist', 'cli.mjs');
const cli = createCommand('node', [launcher]);

let directory: string;

beforeEach(async () => {
	directory = await makeTempDir();
});

afterEach(async () => {
	await fse.remove(directory);
});

it('cfg.confirm.only.commit', async () => { // {{{
	const { remote, repository } = await createRepository(directory);

	await fse.outputFile(
		fse.join(repository, '.bumpnshiprc.yml'),
		YAML.stringify({
			interactive: { commit: 'confirm' }
		}
	));

	await git(repository, 'add', '.bumpnshiprc.yml');
	await git(repository, 'commit', '--message', 'use config file');

	const task = cli(['release', '--minor'], {
		cwd: repository,
		env: { FORCE_COLOR: '0' },
		timeout: 5_000,
	});

	respondToInteractiveProcess(
		task,
		[{
			on: [
				'M package.json',
				'Commit (1.1.0) (Y/n) › Yes'
			],
			send: '<enter>',
		}],
		{
			timeout: 200,
		},
	);

	const result = await task;

	expect(result).toSucceed();
	expect(await git(repository, 'log', '-1', '--pretty=%s')).to.eql('1.1.0');
	expect(await git(repository, 'tag', '--list')).to.contain('1.1.0');
	expect(await git(remote, '--git-dir', remote, 'show-ref', '--tags', '1.1.0')).to.contain('refs/tags/1.1.0');
	expect(await git(remote, '--git-dir', remote, 'rev-parse', 'refs/heads/main')).to.eql(await git(repository, 'rev-parse', 'HEAD'));
}, 20_000); // }}}

it('cfg.pause.combo.cv', async () => { // {{{
	const { remote, repository } = await createRepository(directory);

	await fse.outputFile(
		fse.join(repository, '.bumpnshiprc.yml'),
		YAML.stringify({
			interactive: {
				commit: 'pause',
				version: 'pause'
			}
		}
	));

	await git(repository, 'add', '.bumpnshiprc.yml');
	await git(repository, 'commit', '--message', 'use config file');

	const task = cli(['release', '--minor'], {
		cwd: repository,
		timeout: 5_000,
	});

	respondToInteractiveProcess(
		task,
		[
			{
				on: [
					`${c.gray(c.symbols.pointer)} Tag (1.1.0)`,
					'Press ENTER to continue...',
				],
				send: '<enter>',
			},
			{
				on: [
					'M package.json',
					'Press ENTER to continue...',
				],
				send: '<enter>',
			},
		],
		{
			timeout: 200,
		},
	);

	const result = await task;

	expect(result).toSucceed();
	expect(await git(repository, 'log', '-1', '--pretty=%s')).to.eql('1.1.0');
	expect(await git(repository, 'tag', '--list')).to.contain('1.1.0');
	expect(await git(remote, '--git-dir', remote, 'show-ref', '--tags', '1.1.0')).to.contain('refs/tags/1.1.0');
	expect(await git(remote, '--git-dir', remote, 'rev-parse', 'refs/heads/main')).to.eql(await git(repository, 'rev-parse', 'HEAD'));

	expect(result).toHaveStdout('Press ENTER to continue...');
	expect(result.value!.stderr).to.eql('');
}, 20_000); // }}}

it('cfg.pause.only.commit', async () => { // {{{
	const { remote, repository } = await createRepository(directory);

	await fse.outputFile(
		fse.join(repository, '.bumpnshiprc.yml'),
		YAML.stringify({
			interactive: { commit: 'pause' }
		}
	));

	await git(repository, 'add', '.bumpnshiprc.yml');
	await git(repository, 'commit', '--message', 'use config file');

	const task = cli(['release', '--minor'], {
		cwd: repository,
		timeout: 5_000,
	});

	respondToInteractiveProcess(
		task,
		[{
			on: [
				'M package.json',
				'Press ENTER to continue...',
			],
			send: '<enter>',
		}],
		{
			timeout: 200,
		},
	);

	const result = await task;

	expect(result).toSucceed();
	expect(await git(repository, 'log', '-1', '--pretty=%s')).to.eql('1.1.0');
	expect(await git(repository, 'tag', '--list')).to.contain('1.1.0');
	expect(await git(remote, '--git-dir', remote, 'show-ref', '--tags', '1.1.0')).to.contain('refs/tags/1.1.0');
	expect(await git(remote, '--git-dir', remote, 'rev-parse', 'refs/heads/main')).to.eql(await git(repository, 'rev-parse', 'HEAD'));

	expect(result).toHaveStdout('Press ENTER to continue...');
	expect(result.value!.stderr).to.eql('');
}, 20_000); // }}}

it('cfg.pause.only.push', async () => { // {{{
	const { remote, repository } = await createRepository(directory);

	await fse.outputFile(
		fse.join(repository, '.bumpnshiprc.yml'),
		YAML.stringify({
			interactive: { push: 'pause' }
		}
	));

	await git(repository, 'add', '.bumpnshiprc.yml');
	await git(repository, 'commit', '--message', 'use config file');

	const task = cli(['release', '--minor'], {
		cwd: repository,
		timeout: 5_000,
	});

	respondToInteractiveProcess(
		task,
		[{
			on: [
				`${c.green(c.symbols.check)} Tag (1.1.0)`,
				'Press ENTER to continue...',
			],
			send: '<enter>',
		}],
		{
			timeout: 200,
		},
	);

	const result = await task;

	expect(result).toSucceed();
	expect(await git(repository, 'log', '-1', '--pretty=%s')).to.eql('1.1.0');
	expect(await git(repository, 'tag', '--list')).to.contain('1.1.0');
	expect(await git(remote, '--git-dir', remote, 'show-ref', '--tags', '1.1.0')).to.contain('refs/tags/1.1.0');
	expect(await git(remote, '--git-dir', remote, 'rev-parse', 'refs/heads/main')).to.eql(await git(repository, 'rev-parse', 'HEAD'));

	expect(result).toHaveStdout('Press ENTER to continue...');
	expect(result.value!.stderr).to.eql('');
}, 20_000); // }}}

it('cfg.pause.only.tag', async () => { // {{{
	const { remote, repository } = await createRepository(directory);

	await fse.outputFile(
		fse.join(repository, '.bumpnshiprc.yml'),
		YAML.stringify({
			interactive: { tag: 'pause' }
		}
	));

	await git(repository, 'add', '.bumpnshiprc.yml');
	await git(repository, 'commit', '--message', 'use config file');

	const task = cli(['release', '--minor'], {
		cwd: repository,
		timeout: 5_000,
	});

	respondToInteractiveProcess(
		task,
		[{
			on: [
				`${c.green(c.symbols.check)} Commit (1.1.0)`,
				'Press ENTER to continue...',
			],
			send: '<enter>',
		}],
		{
			timeout: 200,
		},
	);

	const result = await task;

	expect(result).toSucceed();
	expect(await git(repository, 'log', '-1', '--pretty=%s')).to.eql('1.1.0');
	expect(await git(repository, 'tag', '--list')).to.contain('1.1.0');
	expect(await git(remote, '--git-dir', remote, 'show-ref', '--tags', '1.1.0')).to.contain('refs/tags/1.1.0');
	expect(await git(remote, '--git-dir', remote, 'rev-parse', 'refs/heads/main')).to.eql(await git(repository, 'rev-parse', 'HEAD'));

	expect(result).toHaveStdout('Press ENTER to continue...');
	expect(result.value!.stderr).to.eql('');
}, 20_000); // }}}

it('cfg.pause.only.version', async () => { // {{{
	const { remote, repository } = await createRepository(directory);

	await fse.outputFile(
		fse.join(repository, '.bumpnshiprc.yml'),
		YAML.stringify({
			interactive: { version: 'pause' }
		}
	));

	await git(repository, 'add', '.bumpnshiprc.yml');
	await git(repository, 'commit', '--message', 'use config file');

	const task = cli(['release', '--minor'], {
		cwd: repository,
		timeout: 5_000,
	});

	respondToInteractiveProcess(
		task,
		[{
			on: [
				`${c.gray(c.symbols.pointer)} Tag (1.1.0)`,
				'Press ENTER to continue...',
			],
			send: '<enter>',
		}],
		{
			timeout: 200,
		},
	);

	const result = await task;

	expect(result).toSucceed();
	expect(await git(repository, 'log', '-1', '--pretty=%s')).to.eql('1.1.0');
	expect(await git(repository, 'tag', '--list')).to.contain('1.1.0');
	expect(await git(remote, '--git-dir', remote, 'show-ref', '--tags', '1.1.0')).to.contain('refs/tags/1.1.0');
	expect(await git(remote, '--git-dir', remote, 'rev-parse', 'refs/heads/main')).to.eql(await git(repository, 'rev-parse', 'HEAD'));

	expect(result).toHaveStdout('Press ENTER to continue...');
	expect(result.value!.stderr).to.eql('');
}, 20_000); // }}}

it.skipIf(isCI())('default', async () => { // {{{
	const { remote, repository } = await createRepository(directory);

	const result = await cli(['release'], {
		cwd: repository,
		stdin: createStdinStream('<enter>'),
		timeout: 5_000,
	});

	expect(result).toSucceed();
	expect(await git(repository, 'log', '-1', '--pretty=%s')).to.eql('1.0.2');
	expect(await git(repository, 'tag', '--list')).to.contain('1.0.2');
	expect(await git(remote, '--git-dir', remote, 'show-ref', '--tags', '1.0.2')).to.contain('refs/tags/1.0.2');
	expect(await git(remote, '--git-dir', remote, 'rev-parse', 'refs/heads/main')).to.eql(await git(repository, 'rev-parse', 'HEAD'));

	expect(result).toHaveStdout(`🏁 ${c.bold('Done')}`);
	expect(result).not.toHaveStdout(/insertions?\(\+\)/);
	expect(result).not.toHaveStdout(/deletions?\(\-\)/);
	expect(result.value!.stderr).to.eql('');
}, 20_000); // }}}

it('opt.patch.ci', async () => { // {{{
	const { remote, repository } = await createRepository(directory);

	const result = await cli(['release', '--patch', '--ci'], {
		cwd: repository,
		timeout: 5_000,
	});

	expect(result).toSucceed();
	expect(await git(repository, 'log', '-1', '--pretty=%s')).to.eql('1.0.2');
	expect(await git(repository, 'tag', '--list')).to.contain('1.0.2');
	expect(await git(remote, '--git-dir', remote, 'show-ref', '--tags', '1.0.2')).to.contain('refs/tags/1.0.2');
	expect(await git(remote, '--git-dir', remote, 'rev-parse', 'refs/heads/main')).to.eql(await git(repository, 'rev-parse', 'HEAD'));

	expect(result).toHaveStdout(`${c.green(c.symbols.check)} Version (1.0.2)`);
	expect(result).toHaveStdout(`${c.green(c.symbols.check)} Commit (1.0.2)`);
	expect(result).toHaveStdout(`${c.green(c.symbols.check)} Tag (1.0.2)`);
	expect(result).toHaveStdout(`${c.green(c.symbols.check)} Push`);
	expect(result).toHaveStdout(`🏁 ${c.bold('Done')}`);
	expect(result.value!.stderr).to.eql('');
}, 20_000); // }}}

it('opt.patch.pause', async () => { // {{{
	const { remote, repository } = await createRepository(directory);

	const task = cli(['release', '--patch', '--pause'], {
		cwd: repository,
		timeout: 5_000,
	});

	respondToInteractiveProcess(
		task,
		[
			{
				on: [
					`${c.gray(c.symbols.pointer)} Tag (1.0.2)`,
					'Press ENTER to continue...',
				],
				send: '<enter>',
			},
			{
				on: [
					'M package.json',
					'Press ENTER to continue...',
				],
				send: '<enter>',
			},
		],
		{
			timeout: 200,
		},
	);

	const result = await task;

	expect(result).toSucceed();
	expect(await git(repository, 'log', '-1', '--pretty=%s')).to.eql('1.0.2');
	expect(await git(repository, 'tag', '--list')).to.contain('1.0.2');
	expect(await git(remote, '--git-dir', remote, 'show-ref', '--tags', '1.0.2')).to.contain('refs/tags/1.0.2');
	expect(await git(remote, '--git-dir', remote, 'rev-parse', 'refs/heads/main')).to.eql(await git(repository, 'rev-parse', 'HEAD'));

	expect(result).toHaveStdout(`${c.gray(c.symbols.pointer)} Next version (1.0.2)`);
	expect(result).toHaveStdout(`${c.gray(c.symbols.pointer)} Commit (1.0.2)`);
	expect(result).toHaveStdout(`${c.gray(c.symbols.pointer)} Tag (1.0.2)`);
	expect(result).toHaveStdout('Press ENTER to continue...');
	expect(result.value!.stderr).to.eql('');
}, 20_000); // }}}

it('opt.patch.pr', async () => { // {{{
	const { repository } = await createRepository(directory);

	const result = await cli(['release', '--patch', '--pr'], {
		cwd: repository,
		stdin: createStdinStream('<enter>'),
		timeout: 5_000,
	});

	expect(result).toSucceed();
	expect(await git(repository, 'log', '-1', '--pretty=%s')).to.eql('1.0.2');

	expect(result).toHaveStdout('Open a pull request from your release branch on your Git host.');
	expect(result).toHaveStdout(`  ${c.gray('branch')} release/v1.0.2 ${c.gray('→')} main`);
	expect(result).toHaveStdout(`  ${c.gray('title ')} chore: release v1.0.2`);
	expect(result.value!.stderr).to.eql('');
}, 20_000); // }}}
