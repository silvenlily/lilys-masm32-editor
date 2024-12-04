import {
	Directive,
	type DirectiveApplyParseReturnValue,
	type DirectiveCategory,
	type DirectiveInstructionLineOptions
} from '$lib/AsmInterpreter/parsing/Lines/Directives/Directive';
import type { UnparsedLOC } from '$lib/AsmInterpreter/parsing/SegmentType';
import type { ParseState } from '$lib/AsmInterpreter/parsing/ParseState';
import { ProcedureBuilder } from '$lib/AsmInterpreter/procedures/ProcedureBuilder';
import type { LineParserLinkReturnValue } from '$lib/AsmInterpreter/parsing/Lines/LineParser';

export class ProcedureDirective extends Directive {
	type: 'Directive' = 'Directive';
	segment_parse: ((line: UnparsedLOC, parse: ParseState) => DirectiveApplyParseReturnValue);
	segment_link: ((line: UnparsedLOC, parse: ParseState) => LineParserLinkReturnValue);

	constructor(options: SegmentDirectiveParserOptions) {
		super(options, 'procedures');
		this.segment_parse = options.segment_parse ?? ((line, p) => {
			return { line: { type: 'directive', instruction: this, loc: line } };
		});
		this.segment_link = options.segment_link ?? ((line, p) => {
			return { line: { type: 'directive', instruction: this, loc: line } };
		});
	};

	override apply_parse(line: UnparsedLOC, parse: ParseState): DirectiveApplyParseReturnValue {
		return this.segment_parse(line, parse);
	}

	override link(loc: UnparsedLOC, parse: ParseState): LineParserLinkReturnValue {
		return this.segment_link(loc, parse)!;
	}

}

export interface SegmentDirectiveParserOptions extends DirectiveInstructionLineOptions {
	segment_parse?: ((line: UnparsedLOC, parse: ParseState) => DirectiveApplyParseReturnValue);
	segment_link?: ((line: UnparsedLOC, parse: ParseState) => LineParserLinkReturnValue);
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

		let model = parse.file;
		if (model == undefined) {
			throw 'unset model';
		}
		let proc_builder = new ProcedureBuilder(label, model);

		if (parse.procedures.has(proc_builder.get_ref())) {
			return { line: { type: 'invalid', message: 'duplicate procedure label', loc: line } };
		}

		parse.procedures.set(proc_builder.get_ref(), proc_builder);
		parse.current_proc = proc_builder;
		parse.segment = 'procedure';
		return { line: { type: 'directive', instruction: ProcDirective, loc:line } };
	})
});

export const EndpDirective = new ProcedureDirective({
	name: 'ENDP',
	description: 'starts a code segment',
	supported: true,
	tag: /^(\w*[ \t]*endp)$/,
	legal_in_mode: ['procedure'],
	segment_parse: ((line, parse): DirectiveApplyParseReturnValue => {

		//let label = parse.current_proc!.proc_label;

		parse.current_proc = undefined;

		parse.segment = 'code';
		return { line: { type: 'directive', instruction: EndpDirective, loc: line  } };
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

		return { line: { type: 'directive', instruction: LabelDirective, loc: line  } };
	})
});

export const ProcedureDirectives: DirectiveCategory = {
	description: 'procedure directives',
	directives: [ProcDirective, EndpDirective, LabelDirective],
	name: 'procedures',
	category: 'procedures'
};
