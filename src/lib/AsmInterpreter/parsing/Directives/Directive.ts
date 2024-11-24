import { ProcessorDirectives } from '$lib/AsmInterpreter/parsing/Directives/processor';
import {
	InstructionLine, type InstructionLineOptions, type LineType, Parse, type LOC, type SegmentType, SegmentTypes
} from '$lib/AsmInterpreter/parsing/Parser';

export const DirectiveCategoryNames = ['code_labels', 'conditional_assembly', 'conditional_control_flow', 'conditional_error', 'data_allocation', 'equates', 'listing_control', 'macros', 'misc', 'processor', 'procedures', 'repeat_blocks', 'scope', 'segment', 'simplified_segment', 'string', 'structure'] as const;
export type DirectiveCategoryName = (typeof DirectiveCategoryNames)[number]

export abstract class Directive extends InstructionLine {
	type: 'Directive' = 'Directive';
	directive_catagory: string;

	protected constructor(options: DirectiveInstructionLineOptions, catagory: string) {
		options.unsupported_err_message = options.unsupported_err_message ?? 'Unsupported compiler directive';
		super(options, 'Directive');
		this.directive_catagory = catagory;
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

export const DirectiveCategories = [ProcessorDirectives];

export const Directives: Directive[] = (() => {
	let directives: Directive[] = [];
	for (let i = 0; i < DirectiveCategories.length; i++) {
		directives = DirectiveCategories[i].directives.concat(directives);
	}
	return directives
})();