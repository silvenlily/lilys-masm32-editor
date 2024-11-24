import type { MemoryLocation } from '$lib/AsmInterpreter/vSystem/memoryLocation';
import type Monaco from '$lib/Editor/monaco';
import type { Procedure } from '$lib/AsmInterpreter/Procedure';
import { Interpreter } from '$lib/AsmInterpreter/Interpreter';
import type { vSystem } from '$lib/AsmInterpreter/vSystem/vSystem';
import { Directives } from '$lib/AsmInterpreter/parsing/Directives/Directive';


export const LineTypes = ['Directive', 'Instruction'] as const;
export type LineType = (typeof LineTypes)[number]
export const SegmentTypes = ['uninitialized', 'initialized', 'code', 'data', 'const', 'procedure'] as const;
export type SegmentType = (typeof SegmentTypes)[number]

export interface ParseError {
	severity: Monaco.MarkerSeverity;
	message: string;
	position: {
		startLineNumber: number, startColumn: number, endLineNumber: number, endColumn: number,
	};
}


export interface InstructionLineOptions {
	name: string,
	description: string,
	tag: string | RegExp,
	supported: boolean,
	unsupported_err_message?: string;
	legal_in_mode: SegmentType[]
}

export class InstructionLine {
	type: LineType;
	name: string;
	description?: string;
	tag: RegExp | string;
	supported: boolean;
	unsupported_err_message: string;
	legal_in_mode: SegmentType[];

	apply_parse?(line: LOC, parse: Parse): undefined

	execute?(line: LOC, parse: Parse, system: vSystem): undefined

	register(parser: Parser) {
		for (let i = 0; i < this.legal_in_mode.length; i++) {
			parser.line_keys[this.legal_in_mode[i]].push(this);
		}
	}

	constructor(options: InstructionLineOptions, parser_type: LineType) {
		this.type = parser_type;
		this.name = options.name;
		this.description = options.description;
		this.tag = options.tag;
		this.supported = options.supported;
		this.unsupported_err_message = options.unsupported_err_message ?? 'Unsupported instruction';
		this.legal_in_mode = options.legal_in_mode;
	}
}

/**
 * parses a set of asm files into programs
 */
export class Parser {
	private static singleton: Parser;
	public line_keys: { [key in SegmentType]: InstructionLine[] };

	constructor() {
		let lk: { [key in SegmentType]?: InstructionLine[] } = {};
		for (let i = 0; i < SegmentTypes.length; i++) {
			lk[SegmentTypes[i]] = [];
		}
		this.line_keys = lk as { [key in SegmentType]: InstructionLine[] };

		for (let i = 0; i < Directives.length; i++) {
			Directives[i].register(this);
		}

		/*
		for (let i = 0; i < Instructions.length; i++) {
			Instructions[i].register(this)
		}*/



	}

	static get(): Parser {
		if (Parser.singleton == undefined) {
			Parser.singleton = new Parser();
		}
		return Parser.singleton;
	}

	public static register_key(key: InstructionLine, segments: SegmentType[]) {
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

		(await Interpreter.get_instance()).monaco.editor.setModelMarkers(model, path, errors);

	}

}

export interface LOC {
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
	parse_lines: LOC[];
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
		let new_lines: LOC[] = [];

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
			console.log(`checking line: ${i}`);
			let line = this.parse_lines[i];
			let keys: InstructionLine[] = Parser.get().line_keys[this.segment];
			for (let j = 0; j < keys.length; j++) {
				console.log(`checking line: ${i} for key ${j}`);
				let mhit = line.text.match(keys[j].tag);
				if (mhit != null) {
					let parser = keys[j];

					let hit = mhit[0];
					let starts_at = mhit.index! + (line.whitespace_shift ?? 0);
					let ends_at = starts_at + hit.length;

					if (!parser.supported) {
						this.errors.push({
							message: parser.unsupported_err_message ?? `${parser.name} is not supported`, position: {
								endColumn: ends_at,
								endLineNumber: line.line_number,
								startColumn: starts_at,
								startLineNumber: line.line_number
							}, severity: (await Interpreter.get_instance()).monaco.MarkerSeverity.Error
						});
						break;
					}

					if (!parser.legal_in_mode.includes(this.segment)) {
						this.errors.push({
							message: parser.unsupported_err_message ?? `${parser.name} is not a legal instruction in ${this.segment} segments, legal in segments: ${parser.legal_in_mode.join(', ')}`,
							position: { endColumn: 0, endLineNumber: 0, startColumn: 0, startLineNumber: 0 },
							severity: (await Interpreter.get_instance()).monaco.MarkerSeverity.Error
						});
					}

					if (parser.apply_parse != undefined) {
						parser.apply_parse!(line, this);
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

		console.log(`flushing ${this.errors.length} errors`);

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


