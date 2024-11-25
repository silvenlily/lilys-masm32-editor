import type Monaco from '$lib/Editor/monaco';
import { Interpreter } from '$lib/AsmInterpreter/Interpreter';
import {
	type LineParser,
	type LineKeyMap,
	type ParsingLine,
	type tagged_executable_line,
	type tagged_directive_line,
	type tagged_unparsed_line
} from '$lib/AsmInterpreter/parsing/Lines/LineParser';
import { Parse } from '$lib/AsmInterpreter/parsing/Parse';
import { type Types, SegmentTypes, type UnparsedLOC } from '$lib/AsmInterpreter/parsing/Types';
import { Directives } from '$lib/AsmInterpreter/parsing/Lines/Directives/DirectiveStore';
import { EmptyInstructionLine, Whitespace, WhitespaceLineTypes } from '$lib/AsmInterpreter/parsing/Lines/Whitespace';

class Parser {
	private static singleton: Parser;
	public line_keys: LineKeyMap;

	private constructor() {
		let lk: { [key in Types]?: LineParser[] } = {};
		for (let i = 0; i < SegmentTypes.length; i++) {
			lk[SegmentTypes[i]] = [];
		}
		this.line_keys = lk as LineKeyMap;

		Directives.forEach(directive => {
			directive.legal_in_mode.forEach(mode => {
				console.log(`registering directive: ${directive.name} for ${mode}`);
				this.line_keys[mode].push(directive);
			});
		});

		WhitespaceLineTypes.forEach(ws_category => {
			ws_category.legal_in_mode.forEach(mode => {
				console.log(`registering whitespace category: ${ws_category.name} for ${mode}`);
				this.line_keys[mode].push(ws_category);
			});
		});

	}

	static get(): Parser {
		if (Parser.singleton == undefined) {
			Parser.singleton = new Parser();
		}
		return Parser.singleton;
	}

	public static register_key(key: LineParser, segments: Types[]) {
		let self = Parser.get();
		for (let i = 0; i < segments.length; i++) {
			self.line_keys[segments[i]].push(key);
		}
	}

	private create_parsing_lines(str_lines: string[]): ParsingLine[] {
		let parsing_lines: ParsingLine[] = [];

		for (let i = 0; i < str_lines.length; i++) {
			let p = {
				text: str_lines[i], line_number: i + 1, whitespace_shift: 0
			};
			parsing_lines[i] = { type: 'unparsed', loc: p };
		}

		return parsing_lines;
	}

	public async validate(model: Monaco.editor.ITextModel, path: string) {
		let raw_lines = model.getLinesContent();

		let ParsingLines = this.create_parsing_lines(raw_lines);

		let parse = new Parse();

		this.cleanup_whitespace(ParsingLines);
		await this.first_pass(parse, ParsingLines);
		await this.second_pass(parse, ParsingLines);
		await this.error_unparsed(parse, ParsingLines);
		let errors = this.flush_errors(parse);

		(await Interpreter.get_instance()).monaco.editor.setModelMarkers(model, path, errors);

	}

	cleanup_whitespace(parsing_lines: ParsingLine[]) {
		for (let i = 0; i < parsing_lines.length; i++) {
			if (parsing_lines[i].type == 'unparsed') {
				let line = (parsing_lines[i] as tagged_unparsed_line);
				let start_trimmed = line.loc.text.trimStart();
				let offset = line.loc.text.length - start_trimmed.length;
				line.loc.text = start_trimmed.trimEnd();
				line.loc.whitespace_shift = offset;

				if (line.loc.text.length == 0) {
					parsing_lines[i] = { type: 'directive', instruction: EmptyInstructionLine };
				}

			}
		}
	}

	async first_pass(parse: Parse, parsing_lines: ParsingLine[]) {
		for (let i = 0; i < parsing_lines.length; i++) {
			//console.log(`checking line: ${i}`);
			let line = parsing_lines[i];
			let keys: LineParser[] = this.line_keys[parse.segment];
			for (let j = 0; j < keys.length; j++) {
				if (line.type == 'unparsed') {
					let loc = line.loc;
					//console.log(`checking line: ${i} for key ${j}`);
					let mhit = loc.text.match(keys[j].tag);
					if (mhit != null) {
						let lineParser = keys[j];

						let hit = mhit[0];
						let starts_at = mhit.index! + loc.whitespace_shift;
						let ends_at = starts_at + hit.length;

						if (!lineParser.supported) {
							parse.errors.push({
								message: lineParser.unsupported_err_message ?? `${lineParser.name} is not supported`,
								position: {
									endColumn: ends_at,
									endLineNumber: loc.line_number,
									startColumn: starts_at,
									startLineNumber: loc.line_number
								},
								severity: (await Interpreter.get_instance()).monaco.MarkerSeverity.Error
							});
							break;
						}

						if (!lineParser.legal_in_mode.includes(parse.segment)) {
							parse.errors.push({
								message: lineParser.unsupported_err_message ?? `${lineParser.name} is not a legal instruction in ${parse.segment} segments, legal in segments: ${lineParser.legal_in_mode.join(', ')}`,
								position: {
									startLineNumber: loc.line_number,
									endLineNumber: loc.line_number,
									startColumn: loc.whitespace_shift,
									endColumn: loc.text.length + loc.whitespace_shift
								},
								severity: (await Interpreter.get_instance()).monaco.MarkerSeverity.Error
							});
							break;
						}

						lineParser.apply_parse(loc, parse);



						break;
					}
				}
			}
		}
	}

	async second_pass(parse: Parse, parsing_lines: ParsingLine[]) {
	}

	async error_unparsed(parse: Parse, parsing_lines: ParsingLine[]) {
		for (let line_index = 0; line_index < parsing_lines.length; line_index++) {
			if (parsing_lines[line_index].type == 'unparsed') {
				let loc = (parsing_lines[line_index] as tagged_unparsed_line).loc;
				parse.errors.push({
					message: `Could not parse line`,
					position: {
						startLineNumber: loc.line_number,
						endLineNumber: loc.line_number,
						startColumn: loc.whitespace_shift,
						endColumn: loc.text.length + loc.whitespace_shift
					},
					severity: (await Interpreter.get_instance()).monaco.MarkerSeverity.Error
				});

			}
		}
	}

	flush_errors(parse: Parse): Monaco.editor.IMarkerData[] {

		console.log(`flushing ${parse.errors.length} errors`);

		const markers: Monaco.editor.IMarkerData[] = [];

		for (let i = 0; i < parse.errors.length; i++) {
			let err = parse.errors[i];
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

export default Parser;

