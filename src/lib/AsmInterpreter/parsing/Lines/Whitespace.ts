import {
	LineParser, type tagged_directive_line
} from '$lib/AsmInterpreter/parsing/Lines/LineParser';
import { type LineOptions, SegmentTypes, type UnparsedLOC } from '$lib/AsmInterpreter/parsing/SegmentType';
import type { ParseState } from '$lib/AsmInterpreter/parsing/ParseState';

export class Whitespace extends LineParser {
	type: 'Whitespace' = 'Whitespace';
	whitespace_type: 'comment' | 'empty_ln';

	public constructor(options: LineOptions, type: 'comment' | 'empty_ln') {
		super(options, 'Whitespace');
		this.whitespace_type = type;
	}

	override apply_parse(line: UnparsedLOC, _parse: ParseState): { line: tagged_directive_line } {
		return { line: { type: 'directive', instruction: this, loc: line } };
	}
}

export const EmptyInstructionLine = new Whitespace({
	description: 'Empty line',
	legal_in_mode: JSON.parse(JSON.stringify(SegmentTypes)),
	supported: true,
	tag: /^\s*$/,
	name: 'Empty Line'
}, 'empty_ln');

export const CommentInstructionLine = new Whitespace({
	description: 'Comment only line',
	legal_in_mode: JSON.parse(JSON.stringify(SegmentTypes)),
	supported: true,
	tag: /^\s*;.*$/,
	name: 'Comment Line'
}, 'comment');

export const WhitespaceLineTypes: Whitespace[] = [EmptyInstructionLine, CommentInstructionLine];
