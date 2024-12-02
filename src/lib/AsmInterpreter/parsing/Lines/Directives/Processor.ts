import {
	Directive,
	type DirectiveCategory,
	type DirectiveInstructionLineOptions
} from '$lib/AsmInterpreter/parsing/Lines/Directives/Directive';

export class ProcessorDirective extends Directive {
	type: 'Directive' = 'Directive';

	constructor(options: ProcessorDirectiveParserOptions) {
		super(options, 'processor');
	}
}

export interface ProcessorDirectiveParserOptions extends DirectiveInstructionLineOptions {
}

export const ProcessorDirective386P = new ProcessorDirective({
	name: '.386P',
	description: 'Enables all instructions (including privileged) for the 80386 processor',
	supported: true,
	tag: new RegExp("^(\.386p)$"),
	legal_in_mode: ["uninitialized"]
});

export const ProcessorDirective386 = new ProcessorDirective({
	description: 'Enables all instructions (excluding privileged) for the 80386 processor',
	name: '.386',
	supported: false,
	unsupported_err_message: 'Unprivileged execution is not yet supported, use privileged mode instead (.386P)',
	tag: new RegExp("^\.386$"),
	legal_in_mode: ["uninitialized"]
});

const UnsupportedProcessorDirectives: string[] | RegExp[] = ['.387', '.486', '.486P', '.586', '.586P', '.686', '.686P', '.K3D', '.MMX', '.XMM'];
export const ProcessorDirectives: DirectiveCategory = {
	description: 'Enables a set of instructions for the given processor.',
	name: 'Processor',
	category: 'processor',
	directives: ((() => {
		let directives:ProcessorDirective[] = [];
		for (const unsupportedProcessorDirective of UnsupportedProcessorDirectives) {
			directives.push(new ProcessorDirective({
				description: '',
				name: unsupportedProcessorDirective,
				supported: false,
				unsupported_err_message: 'Only the 80386 processor in privileged mode is currently supported (.386P)',
				tag: unsupportedProcessorDirective,
				legal_in_mode: ['uninitialized']
			}));
		}
		directives.push(ProcessorDirective386, ProcessorDirective386P)
		console.debug(`loaded ${directives.length} processor directives`)
		return directives;
	})())
};



