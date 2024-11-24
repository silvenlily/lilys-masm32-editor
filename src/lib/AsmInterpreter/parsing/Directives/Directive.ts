import { InstructionLine } from '$lib/AsmInterpreter/parsing/Line';
import type { InstructionLineOptions } from '$lib/AsmInterpreter/parsing/Types';

const DirectiveCategoryNames = ['code_labels', 'conditional_assembly', 'conditional_control_flow', 'conditional_error', 'data_allocation', 'equates', 'listing_control', 'macros', 'misc', 'processor', 'procedures', 'repeat_blocks', 'scope', 'segment', 'simplified_segment', 'string', 'structure'] as const;
type DirectiveCategoryName = (typeof DirectiveCategoryNames)[number]

export class Directive extends InstructionLine {
	type: 'Directive' = 'Directive';
	directive_category: string;

	public constructor(options: DirectiveInstructionLineOptions, category: string) {
		options.unsupported_err_message = options.unsupported_err_message ?? 'Unsupported compiler directive';
		super(options, 'Directive');
		this.directive_category = category;
	}
}

export interface DirectiveInstructionLineOptions extends InstructionLineOptions {
}


export interface DirectiveCategory {
	tag: DirectiveCategoryName
	name: string,
	description: string,
	directives: Directive[]
}


