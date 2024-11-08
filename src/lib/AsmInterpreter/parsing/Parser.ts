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
	message: Monaco.MarkerSeverity;
	position?: {
		startLineNumber: number, startColumn: number, endLineNumber: number, endColumn: number,
	};
}

abstract class LineKey {
	abstract tag: RegExp;

	abstract apply(line: ParseLine, parse: Parse): undefined
}

/**
 * parses a set of asm files into programs
 */
export class Parser {
	private static singleton: Parser;
	public line_keys: { [key in SegmentType]: LineKey[] };

	constructor() {
		let lk: { [key in SegmentType]?: LineKey[] } = {};
		for (let i = 0; i < SegmentTypes.length; i++) {
			lk[SegmentTypes[i]] = [];
		}
		this.line_keys = lk as { [key in SegmentType]: LineKey[] };
	}

	static get(): Parser {
		if (Parser.singleton == undefined) {
			Parser.singleton = new Parser();
		}
		return Parser.singleton;
	}

	public static register_key(key: LineKey, segments: SegmentType[]) {
		let self = Parser.get();
		for (let i = 0; i < segments.length; i++) {
			self.line_keys[segments[i]].push(key);
		}
	}

	public validate(model: Monaco.editor.ITextModel) {
		let lines = model.getLinesContent();
		let parse = new Parse(lines);

		parse.strip_white();
		parse.first_pass();
		parse.second_pass();

	}

}


type LineType = 'Directive' | 'Instruction'
type SegmentType = 'init' | 'code' | 'data' | 'proc'
const SegmentTypes: SegmentType[] = ['init', 'code', 'data', 'proc'];

interface ParseLine {
	text: string,
	type?: LineType,
	line_number: number
}

export class Parse {
	main?: Procedure;
	procedures: Map<String, Procedure>;
	variables: Map<String, number[]>;
	errors: ParseError[];

	segment: SegmentType;
	parse_lines: ParseLine[];
	pass: number;

	constructor(lines: string[]) {
		this.procedures = new Map();
		this.variables = new Map();
		this.segment = 'init';
		this.parse_lines = [];
		this.errors = [];
		this.pass = 0;

		for (let i = 0; i < lines.length; i++) {
			this.parse_lines.push({ text: lines[i], line_number: i + 1 });
		}

	}

	strip_white() {
		this.pass = 0;
		let new_lines: ParseLine[] = [];

		for (let i = 0; i < this.parse_lines.length; i++) {
			let line_text = this.parse_lines[i].text.trim();

			// remove comments
			if (line_text.includes(';')) {
				let c_start = line_text.search(';');
				line_text = line_text.substring(0, c_start);
				line_text = line_text.trim();
			}

			// exclude empty lines
			if (line_text.length > 0) {
				new_lines.push({ text: line_text, line_number: this.parse_lines[i].line_number });
			}
		}

		this.parse_lines = new_lines;

	}

	first_pass() {
		this.pass = 1;
		for (let i = 0; i < this.parse_lines.length; i++) {
			let line = this.parse_lines[i];
			let keys: LineKey[] = Parser.get().line_keys[this.segment];
			for (let j = 0; j < keys.length; j++) {
				if (line.text.search(keys[j].tag) != -1) {
					keys[j].apply(line, this);
					break;
				}
			}
		}
	}

	second_pass() {
		this.pass = 2;
	}

}


