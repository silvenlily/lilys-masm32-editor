import {
	Directive,
	type DirectiveApplyParseReturnValue,
	type DirectiveCategory,
	type DirectiveInstructionLineOptions
} from '$lib/AsmInterpreter/parsing/Lines/Directives/Directive';
import type { SegmentType, UnparsedLOC } from '$lib/AsmInterpreter/parsing/SegmentType';
import type { ParseState } from '$lib/AsmInterpreter/parsing/ParseState';
import { Variable, type VariableIdentifier } from '$lib/AsmInterpreter/parsing/Variable';

export class SegmentDirective extends Directive {
	type: 'Directive' = 'Directive';
	next_segment: SegmentType;
	segment_parse: ((line: UnparsedLOC, parse: ParseState) => DirectiveApplyParseReturnValue);


	constructor(options: SegmentDirectiveParserOptions) {
		super(options, 'segment');
		this.next_segment = options.next_segment;
		this.segment_parse = options.segment_parse ?? ((loc, p) => {
			p.segment = this.next_segment;
			return { line: { type: 'directive', instruction: this, loc: loc } };
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
		return { line: { type: 'directive', instruction: ModelDirective, loc: line } };
	})
});

export const CodeDirective = new SegmentDirective({
	name: '.CODE',
	description: 'starts a code segment',
	supported: true,
	tag: new RegExp('^(\.code)'),
	legal_in_mode: ['data', 'const', 'initialized'],
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
		return { line: { type: 'directive', instruction: ModelDirective, loc: line  } };
	})
});

export const DataDirective = new SegmentDirective({
	name: '.DATA',
	description: 'starts a code segment',
	supported: true,
	tag: new RegExp('^(\.data)'),
	legal_in_mode: ['code', 'const', 'initialized'],
	next_segment: 'data',
	segment_parse: ((line, parse): DirectiveApplyParseReturnValue => {
		let args = line.text.substring(5).trim();

		if (args != '') {
			return {
				line: {
					type: 'invalid', message: 'Naming data segments is currently not supported', loc: line
				}
			};
		}

		parse.segment = 'data';
		return { line: { type: 'directive', instruction: DataDirective, loc: line  } };
	})
});

export const DataItemDirective = new SegmentDirective({
	name: 'data item',
	description: 'declares a new variable',
	supported: true,
	tag: /^(\s*\w+\s+\w+\s.+)$/,
	legal_in_mode: ['data'],
	next_segment: 'data',
	segment_parse: ((line, parse): DirectiveApplyParseReturnValue => {

		console.log("parsing data item")

		try {
			let text = line.text.trim()
			let index = text.search(/\s/)
			let var_name = text.substring(0,index)

			text = text.substring(index).trim()
			index = text.search(/\s/)
			let var_size = text.substring(0,index)

			let data_str = text.substring(index).trim().split(",")
			let bytes: number[] = []

			for (let index = 0; index < data_str.length; index++) {
				if(data_str[index].charAt(0) ==  '"') {
					let trimmed = data_str[index].substring(1,data_str[index].length-1)
					for (let j = 0; j < trimmed.length; j++) {
						bytes.push(trimmed.charCodeAt(j))
					}
				} else {
					let num = Number.parseInt(data_str[index])
					bytes.push(num)
				}
			}

			let var_identifier: VariableIdentifier = { model: parse.file!, variable_name: var_name }

			let variable = new Variable(bytes, 1)

			parse.variables.set(var_identifier,variable)

			return { line: { type: 'directive', instruction: DataItemDirective, loc: line  } };
		} catch {
			return { line: { type: 'invalid', message: "could not parse data item", loc: line  } };
		}

	})
});


export const EndDirective = new SegmentDirective({
	name: 'END',
	description: 'Ends a file',
	supported: true,
	tag: new RegExp('^(end)$'),
	legal_in_mode: ['code', 'data', 'const'],
	next_segment: 'ended',
	segment_parse: ((line, parse): DirectiveApplyParseReturnValue => {
		parse.segment = 'ended';
		return { line: { type: 'directive', instruction: EndDirective, loc: line  } };
	})
});

export const SegmentDirectives: DirectiveCategory = {
	description: 'Directives that set the segment type',
	directives: [ModelDirective, CodeDirective, EndDirective, DataDirective, DataItemDirective],
	name: 'simplified segment',
	category: 'simplified_segment'
};
