const INPUT_KEYS: Record<string, string> = {
	'<up>': '\x1b[A',
	'<down>': '\x1b[B',
	'<enter>': '\r',
	'<escape>': '\x1b',
};

export function encodeInput(input: string): string {
	return input.replace(/<(up|down|enter|escape)>/gi, (key) => INPUT_KEYS[key.toLowerCase()]);
}
