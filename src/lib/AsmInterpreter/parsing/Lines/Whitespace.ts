import { LineParser } from '$lib/AsmInterpreter/parsing/Lines/LineParser';
import { type InstructionLineOptions, SegmentTypes } from '$lib/AsmInterpreter/parsing/Types';

export class Whitespace extends LineParser {
	type: 'Whitespace' = 'Whitespace';
	whitespace_type: 'comment' | 'emptyln';

	public constructor(options: InstructionLineOptions, type: 'comment' | 'emptyln') {
		super(options, 'Whitespace');
		this.whitespace_type = type;
	}
}

export const EmptyInstructionLine = new Whitespace({
	description: 'Empty line',
	legal_in_mode: JSON.parse(JSON.stringify(SegmentTypes)),
	supported: true,
	tag: /^\s+$/,
	name: 'Empty Line'
}, 'emptyln');

export const CommentInstructionLine = new Whitespace({
	description: 'Comment only line',
	legal_in_mode: JSON.parse(JSON.stringify(SegmentTypes)),
	supported: true,
	tag: /^\s+$/,
	name: 'Comment Line'
}, 'comment');

export const WhitespaceLineTypes: Whitespace[] = [EmptyInstructionLine, CommentInstructionLine];
