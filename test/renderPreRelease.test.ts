import { expect, it } from 'vitest';
import dayjs from 'dayjs';

import { renderPreRelease } from '#utils/template/renderPreRelease.js';

const tokens = {
	git: {
		branch: 'master',
		commitId: 'ge15be67',
		distance: '2',
	},
};

it('date:YYYYMMDD', async () => { // {{{
	const result = await renderPreRelease('{date:YYYYMMDD}', null, tokens, '')

	expect(result.fails).to.be.false;
	expect(result.value).to.eql([dayjs().format('YYYYMMDD')]);
}); // }}}

it('date:eHY', async () => { // {{{
	const result = await renderPreRelease('{date:eHY}', null, tokens, '')

	expect(result.fails).to.be.false;
	expect(result.value).to.eql([dayjs().format('eHY')]);
	expect(result.value![0]).toMatch(/^\d+$/);
}); // }}}

it('git:branch', async () => { // {{{
	const result = await renderPreRelease('{git:branch}', null, tokens, '')

	expect(result.fails).to.be.false;
	expect(result.value).to.eql(['master']);
}); // }}}

it('git:commitId', async () => { // {{{
	const result = await renderPreRelease('{git:commitId}', null, tokens, '')

	expect(result.fails).to.be.false;
	expect(result.value).to.eql(['ge15be67']);
}); // }}}

it('git:distance', async () => { // {{{
	const result = await renderPreRelease('{git:distance}', null, tokens, '')

	expect(result.fails).to.be.false;
	expect(result.value).to.eql(['2']);
}); // }}}

it('index:0.null', async () => { // {{{
	const result = await renderPreRelease('{index:0}', null, tokens, '')

	expect(result.fails).to.be.false;
	expect(result.value).to.eql(['0']);
}); // }}}

it('index:0.0', async () => { // {{{
	const result = await renderPreRelease('{index:0}', [0], tokens, '')

	expect(result.fails).to.be.false;
	expect(result.value).to.eql(['1']);
}); // }}}

it('index:0.1', async () => { // {{{
	const result = await renderPreRelease('{index:0}', [1], tokens, '')

	expect(result.fails).to.be.false;
	expect(result.value).to.eql(['2']);
}); // }}}

it('index:1.null', async () => { // {{{
	const result = await renderPreRelease('{index:1}', null, tokens, '')

	expect(result.fails).to.be.false;
	expect(result.value).to.eql(['1']);
}); // }}}

it('alpha.index:0.null', async () => { // {{{
	const result = await renderPreRelease('alpha.{index:0}', null, tokens, '')

	expect(result.fails).to.be.false;
	expect(result.value).to.eql(['alpha', '0']);
}); // }}}

it('alpha.index:0.alpha.1', async () => { // {{{
	const result = await renderPreRelease('alpha.{index:0}', ['alpha', 1], tokens, '')

	expect(result.fails).to.be.false;
	expect(result.value).to.eql(['alpha', '2']);
}); // }}}

it('beta.index:0.alpha.1', async () => { // {{{
	const result = await renderPreRelease('beta.{index:0}', ['alpha', 1], tokens, '')

	expect(result.fails).to.be.false;
	expect(result.value).to.eql(['beta', '0']);
}); // }}}
