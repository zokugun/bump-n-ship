import { SemVer } from 'verkit';
import { Tokens } from '#/utils/template/types.js';

export type Context = {
	branchName?: string;
	commitHeader?: string;
	commitMessage?: string;
	oldVersion: SemVer;
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
	currentVersion: SemVer;
	cwd: string;
	commit: {
		all: boolean;
		body?: string;
		footer?: string;
		header: string;
		verify: boolean;
	};
	dirty: boolean;
	dryRun: boolean;
	ignoreScripts: boolean;
	interactive: {
		commit?: 'confirm' | 'pause';
		push?: 'confirm' | 'pause';
		tag?: 'confirm' | 'pause';
		version?: 'confirm' | 'pause';
	},
	nextVersion?: SemVer;
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
