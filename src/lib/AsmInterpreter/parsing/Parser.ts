import type Monaco from '$lib/Editor/monaco';
import { Interpreter } from '$lib/AsmInterpreter/Interpreter';
import type { InstructionLine, LineKeyMap } from '$lib/AsmInterpreter/parsing/Line';
import { Parse } from '$lib/AsmInterpreter/parsing/Parse';
import { type Types, SegmentTypes, type UnparsedLOC } from '$lib/AsmInterpreter/parsing/Types';
import { Directives } from '$lib/AsmInterpreter/parsing/Directives/DirectiveStore';

/**
 * parses a set of asm files into programs
 */
export class Parser {
	private static singleton: Parser;
	public line_keys: LineKeyMap;

	private constructor() {
		let lk: { [key in Types]?: InstructionLine[] } = {};
		for (let i = 0; i < SegmentTypes.length; i++) {
			lk[SegmentTypes[i]] = [];
		}
		this.line_keys = lk as LineKeyMap;

		Directives.forEach(directive => {
			directive.legal_in_mode.forEach(mode=>{
				console.log(`registering directive: ${directive.name} for ${mode}`)
				this.line_keys[mode].push(directive);
			})
		})

	}

	static get(): Parser {
		if (Parser.singleton == undefined) {
			Parser.singleton = new Parser();
		}
		return Parser.singleton;
	}

	public static register_key(key: InstructionLine, segments: Types[]) {
		let self = Parser.get();
		for (let i = 0; i < segments.length; i++) {
			self.line_keys[segments[i]].push(key);
		}
	}

	public async validate(model: Monaco.editor.ITextModel, path: string) {
		let lines = model.getLinesContent();
		let parse = new Parse(lines);

		this.whitespace_pass(parse);
		await this.first_pass(parse);
		this.second_pass(parse);
		let errors = this.flush_errors(parse);

		(await Interpreter.get_instance()).monaco.editor.setModelMarkers(model, path, errors);

	}


	whitespace_pass(parse:Parse) {
		let new_lines: UnparsedLOC[] = [];

		for (let i = 0; i < parse.parse_lines.length; i++) {
			let line_text = parse.parse_lines[i].text.trim();


			new_lines.push({ text: line_text, line_number: parse.parse_lines[i].line_number });
		}

		parse.parse_lines = new_lines;

	}

	async first_pass(parse:Parse) {
		for (let i = 0; i < parse.parse_lines.length; i++) {
			console.log(`checking line: ${i}`);
			let line = parse.parse_lines[i];
			let keys: InstructionLine[] = this.line_keys[parse.segment];
			for (let j = 0; j < keys.length; j++) {
				console.log(`checking line: ${i} for key ${j}`);
				let mhit = line.text.match(keys[j].tag);
				if (mhit != null) {
					let parser = keys[j];

					let hit = mhit[0];
					let starts_at = mhit.index! + (line.whitespace_shift ?? 0);
					let ends_at = starts_at + hit.length;

					if (!parser.supported) {
						parse.errors.push({
							message: parser.unsupported_err_message ?? `${parser.name} is not supported`, position: {
								endColumn: ends_at,
								endLineNumber: line.line_number,
								startColumn: starts_at,
								startLineNumber: line.line_number
							}, severity: (await Interpreter.get_instance()).monaco.MarkerSeverity.Error
						});
						break;
					}

					if (!parser.legal_in_mode.includes(parse.segment)) {
						parse.errors.push({
							message: parser.unsupported_err_message ?? `${parser.name} is not a legal instruction in ${parse.segment} segments, legal in segments: ${parser.legal_in_mode.join(', ')}`,
							position: { endColumn: 0, endLineNumber: 0, startColumn: 0, startLineNumber: 0 },
							severity: (await Interpreter.get_instance()).monaco.MarkerSeverity.Error
						});
					}

					if (parser.apply_parse != undefined) {
						parser.apply_parse!(line, parse);
					}

					break;
				}
			}
		}
	}

	second_pass(parse:Parse) {
	}

	flush_errors(parse:Parse): Monaco.editor.IMarkerData[] {

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




