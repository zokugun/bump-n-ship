import { expect, it } from 'vitest';
import dayjs from 'dayjs';

import { renderBuild } from '#utils/template/renderBuild.js';

const tokens = {
	git: {
		branch: 'master',
		commitId: 'ge15be67',
		distance: '2',
	},
};

it('date:YYYYMMDD', async () => { // {{{
	const result = await renderBuild('{date:YYYYMMDD}', tokens, '')

	expect(result.fails).to.be.false;
	expect(result.value).to.eql([dayjs().format('YYYYMMDD')]);
}); // }}}

it('date:eHY', async () => { // {{{
	const result = await renderBuild('{date:eHY}', tokens, '')

	expect(result.fails).to.be.false;
	expect(result.value).to.eql([dayjs().format('eHY')]);
	expect(result.value![0]).toMatch(/^\d+$/);
}); // }}}

it('git:branch', async () => { // {{{
	const result = await renderBuild('{git:branch}', tokens, '')

	expect(result.fails).to.be.false;
	expect(result.value).to.eql(['master']);
}); // }}}

it('git:commitId', async () => { // {{{
	const result = await renderBuild('{git:commitId}', tokens, '')

	expect(result.fails).to.be.false;
	expect(result.value).to.eql(['ge15be67']);
}); // }}}

it('git:distance', async () => { // {{{
	const result = await renderBuild('{git:distance}', tokens, '')

	expect(result.fails).to.be.false;
	expect(result.value).to.eql(['2']);
}); // }}}
