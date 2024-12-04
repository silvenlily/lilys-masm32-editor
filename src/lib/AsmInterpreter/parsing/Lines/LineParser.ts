import { ParseState } from '$lib/AsmInterpreter/parsing/ParseState';
import {
	type LineOptions, type LineType, type SegmentType, type UnparsedLOC
} from '$lib/AsmInterpreter/parsing/SegmentType';
import type { ExecutableLine } from '$lib/AsmInterpreter/parsing/Lines/Line';

export const LineTags = ['unparsed', 'directive', 'instruction', 'invalid', 'linkable'] as const;
export type LineTag = (typeof LineTags)[number]

export type tagged_unparsed_line = {
	type: 'unparsed'; loc: UnparsedLOC;
}

export type tagged_directive_line = {
	type: 'directive'; instruction: LineParser; runtime?: ExecutableLine; loc: UnparsedLOC
}

export type tagged_executable_line = {
	type: 'instruction'; instruction?: LineParser; runtime: ExecutableLine; loc: UnparsedLOC;
}

export type tagged_invalid_line = {
	type: 'invalid'; message: string; loc: UnparsedLOC
}

export type tagged_linkable_line = {
	type: 'linkable'; instruction: LineParser; loc: UnparsedLOC
}

export type ParsingLine =
	tagged_directive_line
	| tagged_executable_line
	| tagged_unparsed_line
	| tagged_invalid_line
	| tagged_linkable_line;
export type RuntimeLine = tagged_directive_line | tagged_executable_line

export type LineParserApplyParseReturnValue = {
	line: tagged_directive_line | tagged_executable_line | tagged_invalid_line | tagged_linkable_line, state?: ParseState
};

export type LineParserLinkReturnValue = {
	line: tagged_directive_line | tagged_executable_line | tagged_invalid_line | tagged_linkable_line, state?: ParseState
};

export class LineParser {
	type: LineType;
	name: string;
	description?: string;
	tag: RegExp | string;
	supported: boolean;
	unsupported_err_message: string;
	legal_in_mode: SegmentType[];
	link_only: boolean;

	protected constructor(options: LineOptions, parser_type: LineType) {
		this.type = parser_type;
		this.name = options.name;
		this.description = options.description;
		this.tag = options.tag;
		this.supported = options.supported;
		this.unsupported_err_message = options.unsupported_err_message ?? 'Unsupported instruction';
		this.legal_in_mode = options.legal_in_mode;
		this.link_only = options.link_only ?? false;
	}

	apply_parse(loc: UnparsedLOC, _parse: ParseState): LineParserApplyParseReturnValue {
		if (this.link_only) {
			return { line: { type: 'linkable', instruction: this, loc: loc } };
		}

		return { line: { type: 'invalid', message: `Unimplemented parser: ${this.name}`, loc: loc } };
	}

	link(loc: UnparsedLOC, _parse: ParseState): LineParserLinkReturnValue {
		return { line: { type: 'invalid', message: `Unimplemented linker: ${this.name}`, loc: loc } };
	}

}

export type LineKeyMap = { [key in SegmentType]: LineParser[] }


