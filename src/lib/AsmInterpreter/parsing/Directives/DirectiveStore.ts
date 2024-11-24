import { Directive } from '$lib/AsmInterpreter/parsing/Directives/Directive';
import { ProcessorDirectives } from '$lib/AsmInterpreter/parsing/Directives/processor';

export const DirectiveCategories = [ProcessorDirectives];

export const Directives: Directive[] = (() => {
	let directives: Directive[] = [];
	for (let i = 0; i < DirectiveCategories.length; i++) {
		directives = DirectiveCategories[i].directives.concat(directives);
	}
	return directives;
})();