import { Command, createOption } from '@zokugun/cli-utils/commander';
import { registerSafetyHandlers } from '@zokugun/cli-utils/utils';

import pkg from '../package.json' with { type: 'json' };
import { bump } from './commands/bump.js';
import { getVersion } from './commands/getVersion.js';
import { release } from './commands/release.js';
import { tag } from './commands/tag.js';

registerSafetyHandlers();

const program = new Command();

program
	.version(pkg.version, '-v, --version')
	.description(pkg.description);

program
	.command('bump')
	.description('Bump the project version and update configured files.')
	.option('-a, --auto', 'choose the next version for you (based on feature commit, bug fixes commit and BREAKING_CHANGE commit).')
	.option('-b, --build <build>', 'set the build metadata.')
	.option('--ci', 'no prompts, no user interaction; activated automatically in CI environments.')
	.option('-c, --current-version <version>', 'current version.')
	.option('-d, --dry-run', 'do not touch or write anything, but show the commands.')
	.option('--ignore-scripts', 'ignore scripts.')
	.addOption(createOption('-i, --increment <level>', 'specify the version part to bump.').choices(['major', 'minor', 'patch', 'release', 'premajor', 'preminor', 'prepatch', 'prerelease']))
	.option('--major', 'increment the MAJOR version.')
	.option('--minor', 'increment the MINOR version.')
	.option('--patch', 'increment the PATCH version.')
	.option('-p, --pause', 'pause after incrementing the version and before any file operations.')
	.option('--pre [pre]', 'set or increment the pre-release version.')
	.option('-r, --release', 'increment to a full-release version (only from a pre-release version).')
	.option('-s, --set-version <version>', 'set version manually.')
	.action(bump);

program
	.command('get-version')
	.description('Display the current project version.')
	.action(getVersion);

program
	.command('release')
	.description('Bump the project version and publish the release to Git.')
	.option('--all', 'include all files.')
	.option('-a, --auto', 'choose the next version for you (based on feature commit, bug fixes commit and BREAKING_CHANGE commit).')
	.option('-b, --build <build>', 'set the build metadata.')
	.option('--ci', 'no prompts, no user interaction; activated automatically in CI environments.')
	.option('-c, --current-version <version>', 'current version.')
	.option('--commit <message>', 'commit message.')
	.option('--confirm', 'confirm each publish steps.')
	.option('--dirty', 'continue even if the working directory is dirty.')
	.option('-d, --dry-run', 'do not touch or write anything, but show the commands.')
	.option('--ignore-scripts', 'ignore scripts.')
	.addOption(createOption('-i, --increment <level>', 'specify the version part to bump.').choices(['major', 'minor', 'patch', 'release', 'premajor', 'preminor', 'prepatch', 'prerelease']))
	.option('--major', 'increment the MAJOR version.')
	.option('--minor', 'increment the MINOR version.')
	.option('--no-verify', 'bypass Git commit hooks')
	.option('--patch', 'increment the PATCH version.')
	.option('-p, --pause', 'pause after incrementing the version and before any file/git operations.')
	.option('--pr', 'release via a pull request.')
	.option('--pre [pre]', 'set or increment the pre-release version.')
	.option('-r, --release', 'increment to a full-release version (only from a pre-release version).')
	.option('--sign', 'sign commit and tag.')
	.option('--tag <tag>', 'tag name.')
	.option('-s, --set-version <version>', 'set version manually.')
	.action(release);

program
	.command('tag')
	.description('Commit and tag the current version to Git.')
	.option('--all', 'include all files.')
	.option('--ci', 'no prompts, no user interaction; activated automatically in CI environments.')
	.option('--commit <message>', 'commit message.')
	.option('--confirm', 'confirm each steps.')
	.option('--dirty', 'continue even if the working directory is dirty.')
	.option('-d, --dry-run', 'do not touch or write anything, but show the commands.')
	.option('--ignore-scripts', 'ignore scripts.')
	.option('--no-verify', 'bypass Git commit hooks.')
	.option('-p, --pause', 'pause before any file/git operations.')
	.option('--sign', 'sign commit and tag.')
	.option('--tag <tag>', 'tag name.')
	.action(tag);

program.parse();
