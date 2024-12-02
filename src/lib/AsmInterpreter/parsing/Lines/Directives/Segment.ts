import {
	Directive,
	type DirectiveApplyParseReturnValue,
	type DirectiveCategory,
	type DirectiveInstructionLineOptions
} from '$lib/AsmInterpreter/parsing/Lines/Directives/Directive';
import type { SegmentType, UnparsedLOC } from '$lib/AsmInterpreter/parsing/SegmentType';
import type { ParseState } from '$lib/AsmInterpreter/parsing/ParseState';

export class SegmentDirective extends Directive {
	type: 'Directive' = 'Directive';
	next_segment: SegmentType;
	segment_parse: ((line: UnparsedLOC, parse: ParseState) => DirectiveApplyParseReturnValue);


	constructor(options: SegmentDirectiveParserOptions) {
		super(options, 'segment');
		this.next_segment = options.next_segment;
		this.segment_parse = options.segment_parse ?? ((_l, p) => {
			p.segment = this.next_segment;
			return { line: { type: 'directive', instruction: this } };
		});
	}

	override apply_parse(line: UnparsedLOC, parse: ParseState): DirectiveApplyParseReturnValue {
		return this.segment_parse(line, parse);
	}

}

export interface SegmentDirectiveParserOptions extends DirectiveInstructionLineOptions {
	next_segment: SegmentType;
	segment_parse?: ((line: UnparsedLOC, parse: ParseState) => DirectiveApplyParseReturnValue);
}

export const ModelDirective = new SegmentDirective({
	name: '.MODEL',
	description: 'sets the memory model',
	supported: true,
	tag: new RegExp('^(\.model)'),
	legal_in_mode: ['uninitialized'],
	next_segment: 'initialized',
	segment_parse: ((line, parse): DirectiveApplyParseReturnValue => {
		let args = line.text.substring(6).trim().toLowerCase();

		if (args != 'flat') {
			return {
				line: {
					type: 'invalid',
					message: 'The only legal memory model for 32-bit masm is FLAT, language-type is not currently supported and stack-option is invalid in 32-bit masm',
					loc: line
				}
			};
		}

		parse.segment = 'initialized';
		return { line: { type: 'directive', instruction: ModelDirective } };
	})
});

export const CodeDirective = new SegmentDirective({
	name: '.CODE',
	description: 'starts a code segment',
	supported: true,
	tag: new RegExp('^(\.code)'),
	legal_in_mode: ['initialized'],
	next_segment: 'code',
	segment_parse: ((line, parse): DirectiveApplyParseReturnValue => {
		let args = line.text.substring(5).trim();

		if (args != '') {
			return {
				line: {
					type: 'invalid', message: 'Naming code segments is currently not supported', loc: line
				}
			};
		}

		parse.segment = 'code';
		return { line: { type: 'directive', instruction: ModelDirective } };
	})
});

export const EndDirective = new SegmentDirective({
	name: 'END',
	description: 'Ends a file',
	supported: true,
	tag: new RegExp('^(end)$'),
	legal_in_mode: ['code', 'data', 'const'],
	next_segment: 'ended',
	segment_parse: ((_line, parse): DirectiveApplyParseReturnValue => {
		parse.segment = 'ended';
		return { line: { type: 'directive', instruction: EndDirective } };
	})
});

export const SegmentDirectives: DirectiveCategory = {
	description: 'Directives that set the segment type',
	directives: [ModelDirective, CodeDirective, EndDirective],
	name: 'simplified segment',
	category: 'simplified_segment'
};
