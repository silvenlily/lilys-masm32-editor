import type { MemoryLocation } from '$lib/AsmInterpreter/vSystem/memoryLocation';
import type Monaco from '$lib/Editor/monaco';
import type { Procedure } from '$lib/AsmInterpreter/Procedure';
import { Interpreter } from '$lib/AsmInterpreter/Interpreter';

export interface InstructionLine {
	instruction: string;
	param1?: MemoryLocation | number;
	param2?: MemoryLocation | number;
}

export interface ParseError {
	severity: Monaco.MarkerSeverity;
	message: string;
	position: {
		startLineNumber: number, startColumn: number, endLineNumber: number, endColumn: number,
	};
}

abstract class LineParser {
	abstract type: 'Directive' | 'Instruction';
	abstract name: string;
	abstract tag: RegExp;
	abstract supported: boolean;
	abstract unsupported_err_message: string;
	abstract legal_in_mode: SegmentType[];

	abstract apply?(line: ParseLine, parse: Parse): undefined;
}

/**
 * parses a set of asm files into programs
 */
export class Parser {
	private static singleton: Parser;
	public line_keys: { [key in SegmentType]: LineParser[] };

	constructor() {
		let lk: { [key in SegmentType]?: LineParser[] } = {};
		for (let i = 0; i < SegmentTypes.length; i++) {
			lk[SegmentTypes[i]] = [];
		}
		this.line_keys = lk as { [key in SegmentType]: LineParser[] };
	}

	static get(): Parser {
		if (Parser.singleton == undefined) {
			Parser.singleton = new Parser();
		}
		return Parser.singleton;
	}

	public static register_key(key: LineParser, segments: SegmentType[]) {
		let self = Parser.get();
		for (let i = 0; i < segments.length; i++) {
			self.line_keys[segments[i]].push(key);
		}
	}

	public async validate(model: Monaco.editor.ITextModel, path: string) {
		let lines = model.getLinesContent();
		let parse = new Parse(lines);

		parse.strip_white();
		await parse.first_pass();
		parse.second_pass();
		let errors = parse.flush_errors();

	}

}

type LineType = 'Directive' | 'Instruction'

const SegmentTypes = ['uninitialized', 'initialized', 'code', 'data', 'const', 'procedure'] as const;
type SegmentType = (typeof SegmentTypes)[number]

interface ParseLine {
	text: string,
	type?: LineType,
	line_number: number
	whitespace_shift?: number,
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
		this.segment = SegmentTypes[0];
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

	async first_pass() {
		this.pass = 1;
		for (let i = 0; i < this.parse_lines.length; i++) {
			let line = this.parse_lines[i];
			let keys: LineParser[] = Parser.get().line_keys[this.segment];
			for (let j = 0; j < keys.length; j++) {
				let mhit = line.text.match(keys[j].tag);
				if (mhit != null) {
					let parser = keys[j];

					let hit = mhit[0];
					let starts_at = mhit.index! + (line.whitespace_shift ?? 0);
					let ends_at = starts_at + hit.length;

					if (!parser.supported) {
						this.errors.push({
							message: parser.unsupported_err_message ?? `${parser.name} is not supported`,
							position: { endColumn: 0, endLineNumber: 0, startColumn: 0, startLineNumber: 0 },
							severity: (await Interpreter.get_instance()).monaco.MarkerSeverity.Error
						});
						return;
					}

					if (!parser.legal_in_mode.includes(this.segment)) {
						this.errors.push({
							message: parser.unsupported_err_message ?? `${parser.name} is not a legal instruction in ${this.segment} segments, legal in segments: ${parser.legal_in_mode.join(', ')}`,
							position: { endColumn: 0, endLineNumber: 0, startColumn: 0, startLineNumber: 0 },
							severity: (await Interpreter.get_instance()).monaco.MarkerSeverity.Error
						});
					}

					if (parser.apply != undefined) {
						parser.apply!(line, this);
					}


					break;
				}
			}
		}
	}

	second_pass() {
		this.pass = 2;
	}

	flush_errors(): Monaco.editor.IMarkerData[] {
		const markers: Monaco.editor.IMarkerData[] = [];

		for (let i = 0; i < this.errors.length; i++) {
			let err = this.errors[i];
			let marker: Monaco.editor.IMarkerData = {
				startLineNumber: err.position.startColumn,
				startColumn: err.position.startLineNumber,
				endColumn: err.position.endColumn,
				endLineNumber: err.position.endLineNumber,
				message: err.message,
				severity: err.severity
			};
			markers.push(marker);
		}

		return markers;
	}

}


