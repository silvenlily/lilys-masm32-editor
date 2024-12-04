import type { Procedure } from '$lib/AsmInterpreter/procedures/Procedure';
import type { InstructionLnReference } from '$lib/AsmInterpreter/parsing/SegmentType';

/**
 * Represents an executable program
 */
export interface Program {
	static_alloc: DataView;
	static_offset: number;
	main: Procedure;
	procedures: Map<string, Procedure>;
	ln_mapping: InstructionLnReference[];
}