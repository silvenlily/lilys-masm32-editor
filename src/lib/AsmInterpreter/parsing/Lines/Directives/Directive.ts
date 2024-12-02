import {
	LineParser, type tagged_directive_line, type tagged_executable_line, type tagged_invalid_line
} from '$lib/AsmInterpreter/parsing/Lines/LineParser';
import type { LineOptions, UnparsedLOC } from '$lib/AsmInterpreter/parsing/SegmentType';
import type { ParseState } from '$lib/AsmInterpreter/parsing/ParseState';


const DirectiveCategoryNames = ['code_labels', 'conditional_assembly', 'conditional_control_flow', 'conditional_error', 'data_allocation', 'equates', 'listing_control', 'macros', 'misc', 'processor', 'procedures', 'repeat_blocks', 'scope', 'segment', 'simplified_segment', 'string', 'structure'] as const;
type DirectiveCategoryName = (typeof DirectiveCategoryNames)[number]

export type DirectiveApplyParseReturnValue = {
	line: tagged_directive_line | tagged_invalid_line, state?: ParseState
}

export class Directive extends LineParser {
	type: 'Directive' = 'Directive';
	directive_category: string;

	override apply_parse(_line: UnparsedLOC, parse: ParseState): DirectiveApplyParseReturnValue {
		return { line: { type: 'directive', instruction: this } };
	}

	public constructor(options: DirectiveInstructionLineOptions, category: DirectiveCategoryName) {
		options.unsupported_err_message = options.unsupported_err_message ?? 'Unsupported compiler directive';
		super(options, 'Directive');
		this.directive_category = category;
	}
}

export interface DirectiveInstructionLineOptions extends LineOptions {
}


export interface DirectiveCategory {
	category: DirectiveCategoryName
	name: string,
	description: string,
	directives: Directive[]
}


