import type Monaco from '$lib/Editor/monaco';

export const LineTypes = ['Directive', 'Instruction', 'Whitespace'] as const;
export type LineType = (typeof LineTypes)[number]

export const SegmentTypes = ['uninitialized', 'initialized', 'code', 'data', 'const', 'procedure', 'ended'] as const;
export type SegmentType = (typeof SegmentTypes)[number]

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

export interface LineOptions {
	name: string,
	description: string,
	tag: string | RegExp,
	supported: boolean,
	unsupported_err_message?: string;
	legal_in_mode: SegmentType[];
	link_only?: boolean,
}

export interface LineReference {
	name: string,
	proc: string,
	line_number: number,
	model: string,
	scope: 'local' | 'global'
}

export interface ProcReference {
	name: string,
	model: string,
}

export function proc_reference_to_key(ref: ProcReference): string {
	return `${ref.model}|${ref.name}`;
}

export interface InstructionLnReference {
	proc: ProcReference,
	ln: number
}

export function instruction_reference_to_key(ref: InstructionLnReference): string {
	return `${proc_reference_to_key(ref.proc)}:${ref.ln}`;
}
