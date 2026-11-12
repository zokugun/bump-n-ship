import type { IncrementType, SemVer } from 'verkit';

import { Mode } from './mode.js';

export type BumpResult = {
	oldVersion: SemVer;
	releaseType: IncrementType | '';
	version: SemVer;
	updatedFiles: string[];
};

export type FileSettings = {
	cwd: string;
	dryRun: boolean;
	ignoreScripts: boolean
}

export type Options = {
	auto?: boolean;
	build?: string;
	ci?: boolean;
	currentVersion?: string;
	dryRun?: boolean;
	ignoreScripts?: boolean;
	increment?: string;
	major?: boolean;
	minor?: boolean;
	patch?: boolean;
	pause?: boolean;
	pre?: boolean | string;
	release?: boolean;
	setVersion?: string;
};

export type Settings = {
	build?: string;
	ci: boolean;
	cwd: string;
	currentVersion: SemVer;
	dryRun: boolean;
	ignoreScripts: boolean;
	isCurrentlyPreRelease: boolean;
	mode: Mode;
	nextVersion?: SemVer;
	preRelease: string;
};
