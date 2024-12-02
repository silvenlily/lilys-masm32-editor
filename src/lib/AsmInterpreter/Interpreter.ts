import type Monaco from '$lib/Editor/monaco';
import { vSystem } from '$lib/AsmInterpreter/system/vSystem';
import type { Program } from '$lib/AsmInterpreter/Program';

/**
 * executes masm32 asm
 */
export class Interpreter {

	private static singleton?: Interpreter;
	private static awaiting_singleton: ((value: Interpreter) => void)[] = [];
	public monaco: typeof Monaco;

	system?: vSystem;

	public constructor(monaco: typeof Monaco) {
		this.monaco = monaco;

		Interpreter.singleton = this;
		for (const waiting of Interpreter.awaiting_singleton) {
			waiting(this);
		}
	}

	public static async get_instance(): Promise<Interpreter> {
		return new Promise((resolve) => {
			if (Interpreter.singleton != undefined) {
				resolve(Interpreter.singleton);
				return;
			}
			Interpreter.awaiting_singleton.push(resolve);
		});
	}

	public run_program(program: Program) {
		// setup new system
		this.system = new vSystem(program.static_alloc.byteLength)
	}

}