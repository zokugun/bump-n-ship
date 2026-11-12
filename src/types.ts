import type { EOLStyle, Indent } from '@zokugun/text-line-utils';

export type JsonData = {
	data: Record<string, unknown>;
	eol: EOLStyle;
	finalEOL: boolean;
	indent: Indent;
};
