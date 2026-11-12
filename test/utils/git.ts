import { exec } from '@zokugun/cli-utils';

export async function git(cwd: string, ...args: string[]): Promise<string> {
	const result = await exec('git', args, { cwd });

	if(result.fails) {
		return result.error.all?.trim() ?? '';
	}
	else {
		return result.value.all.trim();
	}
}
