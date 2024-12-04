import {
	Directive, type DirectiveApplyParseReturnValue, type DirectiveInstructionLineOptions
} from '$lib/AsmInterpreter/parsing/Lines/Directives/Directive';
import type { UnparsedLOC } from '$lib/AsmInterpreter/parsing/SegmentType';
import type { ParseState } from '$lib/AsmInterpreter/parsing/ParseState';

export class ExternDirective extends Directive {
	type: 'Directive' = 'Directive';
	supported = true;

	constructor() {
		let options: DirectiveInstructionLineOptions = {
			description: '', legal_in_mode: ['initialized'], name: '', supported: false, tag: /^(extern\s+[^\s:]+):?.*$/
		};
		super(options, 'segment');
	}

	override apply_parse(line: UnparsedLOC, parse: ParseState): DirectiveApplyParseReturnValue {

		try {

			let parts = line.text.split(' ');
			let param = parts[1].trim();

			parse.enabled_native_procs.push(param);
			return { line: { type: 'directive', instruction: this, loc: line } };

		} catch {
			return { line: { type: 'invalid', message: 'could not parse extern directive', loc: line } };
		}

		return { line: { type: 'invalid', message: 'could not parse extern directive', loc: line } };

	}
}
