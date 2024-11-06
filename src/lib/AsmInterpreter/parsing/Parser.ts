import type { MemoryLocation } from '$lib/AsmInterpreter/vSystem/memoryLocation';
import type Monaco from '$lib/Editor/monaco';
import type { Procedure } from '$lib/AsmInterpreter/Procedure';

export interface InstructionLine {
	instruction: string;
	param1?: MemoryLocation | number;
	param2?: MemoryLocation | number;
}

export interface ParseError {
	severity: string;
	message: string;
}


/**
 * parses a set of asm files into programs
 */
export class Parser {
	private static singleton: Parser;

	static get(): Parser {
		if (Parser.singleton == undefined) {
			Parser.singleton = new Parser();
		}
		return Parser.singleton;
	}


	public validate(model: Monaco.editor.ITextModel) {
		let lines = model.getLinesContent();
		let parse = new Parse(lines);


		parse.strip_white();
		parse.first_pass();
		parse.second_pass();

	}

}

export class Parse {
	main?: Procedure;
	procedures: Map<String, Procedure>;
	variables: Map<String, number[]>;
	errors: ParseError[];

	segment: string;
	parse_lines: ParseLine[];

	constructor(lines: string[]) {
		this.procedures = new Map();
		this.variables = new Map();
		this.segment = 'init';
		this.parse_lines = [];
		this.errors = [];

		for (const line in lines) {
			this.parse_lines.push({ text: line });
		}
	}

	strip_white() {
		let new_lines: ParseLine[] = [];

		for (let i = 0; i < this.parse_lines.length; i++) {
			let line_text = this.parse_lines[i].text.trim();
			// exclude empty lines
			if (line_text.length > 0) {
				// exclude comment only lines
				if (line_text.charAt(0) != ';') {
					new_lines.push({ text: line_text });
				}
			}
		}

		this.parse_lines = new_lines;
	}

	first_pass() {
	}

	second_pass() {
	}


}

type LineType = 'Directive' | 'Instruction'

interface ParseLine {
	text: string,
	type?: LineType,

}

