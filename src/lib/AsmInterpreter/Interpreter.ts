import type Monaco from '$lib/Editor/monaco';

/**
 * Parses and executes masm32 asm
 */
export class Interpreter {

	private static singleton?: Interpreter;
	private static awaiting_singleton: ((value: Interpreter) => void)[] = [];
	public monaco: typeof Monaco;

	//monaco:typeof Monaco;

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

}