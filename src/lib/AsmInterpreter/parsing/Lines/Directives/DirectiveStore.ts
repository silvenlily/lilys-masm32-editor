import type { Directive } from '$lib/AsmInterpreter/parsing/Lines/Directives/Directive';
import { ProcessorDirectives } from '$lib/AsmInterpreter/parsing/Lines/Directives/Processor';
import { SegmentDirectives } from '$lib/AsmInterpreter/parsing/Lines/Directives/Segment';
import { ProcedureDirectives } from '$lib/AsmInterpreter/parsing/Lines/Directives/Procedure';
import { ExternDirective } from '$lib/AsmInterpreter/parsing/Lines/Directives/Extern';

export const DirectiveCategories = [ProcessorDirectives, SegmentDirectives, ProcedureDirectives];

export function get_directives() {
	let directives: Directive[] = [];
	for (let i = 0; i < DirectiveCategories.length; i++) {
		directives = DirectiveCategories[i].directives.concat(directives);
	}

	// uncategorized directives
	directives = directives.concat([new ExternDirective()])
	console.debug(`store loaded ${directives.length} directives`)
	return directives;
}