import { SemVer } from 'verkit';
import { Tokens } from '#/utils/template/types.js';

export type Context = {
	branchName?: string;
	commitHeader?: string;
	commitMessage?: string;
	tagMessage?: string;
	tagName?: string;
	tokens: Tokens;
	updatedFiles: string[];
	version: SemVer;
}

export type Options = {
	all?: boolean;
	ci?: boolean;
	commit?: string;
	confirm?: boolean;
	dirty?: boolean;
	dryRun?: boolean;
	ignoreScripts?: boolean;
	pause?: boolean;
	pr?: boolean;
	sign?: boolean;
	tag?: string;
	verify?: boolean;
};

export type Settings = {
	ci: boolean;
	cwd: string;
	commit: {
		all: boolean;
		body?: string;
		footer?: string;
		header: string;
		verify: boolean;
	};
	confirm: boolean;
	dirty: boolean;
	dryRun: boolean;
	ignoreScripts: boolean;
	pause: boolean;
	pullRequest?: {
		base: string;
		body: string;
		branch: string;
		draft: boolean;
		title: string;
	};
	remote: string;
	sign: boolean;
	tag?: {
		name: string;
		message: string;
	};
}
