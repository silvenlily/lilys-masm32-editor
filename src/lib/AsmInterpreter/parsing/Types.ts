import type Monaco from '$lib/Editor/monaco';

export const LineTypes = ['Directive', 'Instruction', 'Whitespace'] as const;
export type LineType = (typeof LineTypes)[number]

export const SegmentTypes = ['uninitialized', 'initialized', 'code', 'data', 'const', 'procedure'] as const;
export type Types = (typeof SegmentTypes)[number]

export interface UnparsedLOC {
	text: string,
	line_number: number
	whitespace_shift: number
}

export interface ParseError {
	severity: Monaco.MarkerSeverity;
	message: string;
	position: {
		startLineNumber: number, startColumn: number, endLineNumber: number, endColumn: number,
	};
}

export interface InstructionLineOptions {
	name: string,
	description: string,
	tag: string | RegExp,
	supported: boolean,
	unsupported_err_message?: string;
	legal_in_mode: Types[]
}