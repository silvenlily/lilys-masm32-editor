import type Monaco from '$lib/Editor/monaco';
import { vSystem } from '$lib/AsmInterpreter/system/vSystem';
import type { Program } from '$lib/AsmInterpreter/Program';
import { RuntimeTrace } from '$lib/AsmInterpreter/Trace';
import Parser from '$lib/AsmInterpreter/parsing/Parser';
import { proc_reference_to_key } from '$lib/AsmInterpreter/parsing/SegmentType';
import { UnknownRuntimeException } from '$lib/AsmInterpreter/RuntimeError';

/**
 * executes masm32 asm
 */
export class Interpreter {

	private static singleton?: Interpreter;
	private static awaiting_singleton: ((value: Interpreter) => void)[] = [];
	public monaco: typeof Monaco;

	current_program?: Program;
	system?: vSystem;
	trace: RuntimeTrace = new RuntimeTrace();
	models: Map<string, Monaco.editor.ITextModel>;
	editor: Monaco.editor.IStandaloneCodeEditor;
	decorations;

	public constructor(monaco: typeof Monaco, models: Map<string, Monaco.editor.ITextModel>, editor: Monaco.editor.IStandaloneCodeEditor) {
		this.monaco = monaco;
		this.models = models;
		this.editor = editor;
		this.decorations = this.editor.createDecorationsCollection([]);

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


	public static async build(): Promise<vSystem> {
		let interpreter = await Interpreter.get_instance();

		// create parser singleton and run validate on default main file
		let program = await Parser.get_parser().build(interpreter.models);
		interpreter.setup_program(program);
		return interpreter.system!;
	}

	public setup_program(program: Program) {
		// setup new system
		this.system = new vSystem(program.static_alloc, program.static_offset, program.main.ref, program.ln_mapping);
		this.current_program = program;
	}

	public step_program(): vSystem {
		if (this.system == undefined || this.current_program == undefined) {
			throw `tried ticking undefined program`;
		}

		console.debug(`stepping program`);
		let ip = this.system.instruction_pointer;
		let instruction = this.system.memory_instruction_mapping[ip];
		if (instruction == undefined) {
			throw new UnknownRuntimeException('Segmentation Fault', this.trace, 'Attempted to execute code outside of a code segment (did you remember your \'ret\' instruction?)');
		}

		let current_proc = this.current_program.procedures.get(proc_reference_to_key(instruction.proc))!;

		console.debug(`proc has ${current_proc.lines.length} lines`);
		let line = current_proc.lines[instruction.ln];
		let rt_line = line.runtime;
		if (rt_line != undefined) {
			console.debug(`line is valid, executing`);
			rt_line.execute(this.trace, this.system);
		}

		this.system.instruction_pointer += 1;

		console.log(`eax: ${this.system.registers.get('eax')!.get_int()}`);

		let model = this.models.get(current_proc.ref.model);

		if (model != undefined) {


			let decoration: Monaco.editor.IModelDeltaDecoration = {

				options: {
					isWholeLine: true, inlineClassName: 'highlighted_line_decoration'

				}, range: {
					startLineNumber: line.loc.line_number, startColumn: 0, endLineNumber: line.loc.line_number, endColumn: 1
				}
			};
			this.decorations.set([decoration]);
			console.debug(`highlighting: ${model.uri.toString()}:${line.loc.line_number}`);
		} else {
			console.error(`could not get model current model for text highlighting ${current_proc.ref.model}`);
		}

		return this.system;
	}

}