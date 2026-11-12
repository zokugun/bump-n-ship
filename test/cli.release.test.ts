/* eslint-disable no-console */

import { c } from '@zokugun/cli-utils';
import fse from '@zokugun/fs-extra-plus/async';
import { afterEach, beforeEach, expect, it } from 'vitest';
import { commandLine, extendMatchers, type ScratchDirectory, scratchDirectory } from 'vitest-command-line';

import { createRepository } from './utils/createRepository.js';
import { encodeInput } from './utils/encodeInput.js';
import { git } from './utils/git.js';

extendMatchers();

const PROJECT_ROOT = fse.resolve(import.meta.dirname, '..');
const launcher = fse.resolve(PROJECT_ROOT, 'dist', 'cli.mjs');
const cli = commandLine({
	command: ['node', launcher],
	name: 'bump-n-ship',
});

let directory: ScratchDirectory;

beforeEach(async () => {
	directory = scratchDirectory();

	await directory.create();
});

afterEach(async () => {
	await directory.remove();
});

it('default', async () => { // {{{
	const { remote, repository } = await createRepository(directory);

	const result = await cli.run(['release'], {
		cwd: repository,
		input: [encodeInput('<enter>')],
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
	expect(result.stderr).to.eql('');
}, 20_000); // }}}

it('opt.patch.ci', async () => { // {{{
	const { remote, repository } = await createRepository(directory);

	const result = await cli.run(['release', '--patch', '--ci'], {
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
	expect(result.stderr).to.eql('');
}, 20_000); // }}}

// it('opt.patch.pause', async () => { // {{{
// 	const { remote, repository } = await createRepository(directory);

// 	const result = await cli.run(['release', '--patch', '--pause'], {
// 		cwd: repository,
// 		input: [encodeInput('<enter>'), encodeInput('<enter>')],
// 		timeout: 5_000,
// 	});

// 	expect(result).toSucceed();
// 	expect(await git(repository, 'log', '-1', '--pretty=%s')).to.eql('1.0.2');
// 	expect(await git(repository, 'tag', '--list')).to.contain('1.0.2');
// 	expect(await git(remote, '--git-dir', remote, 'show-ref', '--tags', '1.0.2')).to.contain('refs/tags/1.0.2');
// 	expect(await git(remote, '--git-dir', remote, 'rev-parse', 'refs/heads/main')).to.eql(await git(repository, 'rev-parse', 'HEAD'));

// 	expect(result).toHaveStdout(`${c.gray(c.symbols.pointer)} Version (1.0.2)`);
// 	expect(result).toHaveStdout(`${c.gray(c.symbols.pointer)} Commit (1.0.2)`);
// 	expect(result).toHaveStdout(`${c.gray(c.symbols.pointer)} Tag (1.0.2)`);
// 	expect(result).toHaveStdout('Press ENTER to continue...');
// 	expect(result.stderr).to.eql('');
// }, 20_000); // }}}

it('opt.patch.pr', async () => { // {{{
	const { repository } = await createRepository(directory);

	const result = await cli.run(['release', '--patch', '--pr'], {
		cwd: repository,
		input: [encodeInput('<enter>')],
		timeout: 5_000,
	});

	expect(result).toSucceed();
	expect(await git(repository, 'log', '-1', '--pretty=%s')).to.eql('1.0.2');

	expect(result).toHaveStdout('Open a pull request from your release branch on your Git host.');
	expect(result).toHaveStdout(`  ${c.gray('branch')} release/v1.0.2 ${c.gray('→')} main`);
	expect(result).toHaveStdout(`  ${c.gray('title ')} chore: release v1.0.2`);
	expect(result.stderr).to.eql('');
}, 20_000); // }}}
