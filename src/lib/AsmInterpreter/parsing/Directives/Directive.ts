import { ProcessorDirectives } from '$lib/AsmInterpreter/parsing/Directives/processor';

type DirectiveCategoryName =
	'code_labels'
	| 'conditional_assembly'
	| 'conditional_control_flow'
	| 'conditional_error'
	| 'data_allocation'
	| 'equates'
	| 'listing_control'
	| 'macros'
	| 'misc'
	| 'processor'
	| 'procedures'
	| 'repeat_blocks'
	| 'scope'
	| 'segment'
	| 'simplified_segment'
	| 'string'
	| 'structure'

export interface Directive {
	tag: RegExp | string,
	name: string,
	description: string,
	category: DirectiveCategoryName
	supported: boolean,
	unsupported_err_msg?: string,
}

export interface DirectiveCategory {
	tag: DirectiveCategoryName
	name: string,
	description: string,
	directives: Directive[]
}

export const Directives = [ProcessorDirectives];