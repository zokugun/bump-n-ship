import { c } from '@zokugun/cli-utils';

export function successfulStep(label: string): string {
	return `${c.green(c.symbols.check)} ${label}`;
}
