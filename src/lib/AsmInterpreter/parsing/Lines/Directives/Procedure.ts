import {
	Directive, type DirectiveApplyParseReturnValue, type DirectiveCategory, type DirectiveInstructionLineOptions
} from '$lib/AsmInterpreter/parsing/Lines/Directives/Directive';
import type { UnparsedLOC } from '$lib/AsmInterpreter/parsing/SegmentType';
import type { ParseState } from '$lib/AsmInterpreter/parsing/ParseState';
import { ProcedureBuilder } from '$lib/AsmInterpreter/procedures/ProcedureBuilder';

export class ProcedureDirective extends Directive {
	type: 'Directive' = 'Directive';
	segment_parse: ((line: UnparsedLOC, parse: ParseState) => DirectiveApplyParseReturnValue);


	constructor(options: SegmentDirectiveParserOptions) {
		super(options, 'procedures');
		this.segment_parse = options.segment_parse ?? ((_l, p) => {
			return { line: { type: 'directive', instruction: this } };
		});
	}

	override apply_parse(line: UnparsedLOC, parse: ParseState): DirectiveApplyParseReturnValue {
		return this.segment_parse(line, parse);
	}

}

export interface SegmentDirectiveParserOptions extends DirectiveInstructionLineOptions {
	segment_parse?: ((line: UnparsedLOC, parse: ParseState) => DirectiveApplyParseReturnValue);
}

export const ProcDirective = new ProcedureDirective({
	name: 'PROC',
	description: 'starts a procedure',
	supported: true,
	tag: /^(\w*[ \t]*proc[ \t]*)/,
	legal_in_mode: ['code'],
	segment_parse: ((line, parse): DirectiveApplyParseReturnValue => {
		let line_sections = line.text.split(' ');

		let label = line_sections[0].trim();
		let proc = line_sections[1].trim();
		let params = line_sections.slice(2);

		if (proc != 'proc') {
			return { line: { type: 'invalid', message: 'procedures must have a label', loc: line } };
		}

		if (label.length == 0) {
			return { line: { type: 'invalid', message: 'procedures must have a label', loc: line } };
		}

		if (parse.procedures.has(label)){
			return { line: { type: 'invalid', message: 'duplicate procedure label', loc: line } };
		}

		let proc_builder = new ProcedureBuilder(label)
		parse.procedures.set(label,proc_builder)
		parse.current_proc = proc_builder;
		parse.segment = 'procedure';
		return { line: { type: 'directive', instruction: ProcDirective } };
	})
});

export const EndpDirective = new ProcedureDirective({
	name: 'ENDP',
	description: 'starts a code segment',
	supported: true,
	tag: /^(\w*[ \t]*endp)$/,
	legal_in_mode: ['procedure'],
	segment_parse: ((line, parse): DirectiveApplyParseReturnValue => {

		let label = parse.current_proc!.proc_label;
		parse.procedures.set(label, parse.current_proc!);
		parse.current_proc = undefined;

		parse.segment = 'code';
		return { line: { type: 'directive', instruction: EndpDirective } };
	})
});

export const LabelDirective = new ProcedureDirective({
	name: 'label',
	description: 'defines a local label',
	supported: true,
	tag: /^(\w*:)$/,
	legal_in_mode: ['procedure'],
	segment_parse: ((line, parse): DirectiveApplyParseReturnValue => {
		let label = line.text.substring(0, line.text.length - 1);

		if (label.length == 0) {
			return { line: { type: 'invalid', message: 'local label names must be at least one character long', loc: line } };
		}

		parse.current_proc?.label_map.set(label, line.line_number);

		return { line: { type: 'directive', instruction: LabelDirective } };
	})
});

export const ProcedureDirectives: DirectiveCategory = {
	description: 'procedure directives',
	directives: [ProcDirective, EndpDirective, LabelDirective],
	name: 'procedures',
	category: 'procedures'
};