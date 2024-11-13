import type { Directive, DirectiveCategory } from '$lib/AsmInterpreter/parsing/Directives/Directive';


export const ProcessorDirective386P: Directive = {
	category: 'processor',
	description: 'Enables all instructions (including privileged) for the 80386 processor',
	name: '.386P',
	supported: true,
	tag: /^(\.386P)$/
};

export const ProcessorDirective386: Directive = {
	category: 'processor',
	description: 'Enables all instructions (excluding privileged) for the 80386 processor',
	name: '.386',
	supported: false,
	unsupported_err_msg: 'Unprivileged execution is not yet supported, use privileged mode instead (.386P)',
	tag: /^\.386$/
};

const UnsupportedProcessorDirectives: string[] | RegExp[] = ['.387', '.486', '.486P', '.586', '.586P', '.686', '.686P', '.K3D', '.MMX', '.XMM'];


export const ProcessorDirectives: DirectiveCategory = {
	description: 'Enables a set of instructions for the given processor.',
	name: 'Processor',
	tag: 'processor',
	directives: ((() => {
		let directives = [ProcessorDirective386, ProcessorDirective386P];
		for (const unsupportedProcessorDirective of UnsupportedProcessorDirectives) {
			directives.push({
				category: 'processor',
				description: '',
				name: unsupportedProcessorDirective,
				supported: false,
				unsupported_err_msg: 'Only the 80386 processor in privileged mode is currently supported (.386P)',
				tag: unsupportedProcessorDirective
			});
		}

		return directives;
	})())
};



