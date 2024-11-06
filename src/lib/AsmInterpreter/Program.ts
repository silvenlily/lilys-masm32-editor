import type { Procedure } from '$lib/AsmInterpreter/Procedure';

/**
 * Represents an executable program
 */
export interface Program {
	main: Procedure;
	procedures: Map<String, Procedure>;
	variables: Map<String, number[]>;
}