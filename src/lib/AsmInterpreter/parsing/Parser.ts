import type Monaco from '$lib/Editor/monaco';
import { Interpreter } from '$lib/AsmInterpreter/Interpreter';
import {
	type LineKeyMap,
	type LineParser,
	type ParsingLine,
	type tagged_executable_line,
	type tagged_invalid_line,
	type tagged_linkable_line,
	type tagged_unparsed_line
} from '$lib/AsmInterpreter/parsing/Lines/LineParser';
import { ParseState } from '$lib/AsmInterpreter/parsing/ParseState';
import {
	instruction_reference_to_key,
	type InstructionLnReference,
	proc_reference_to_key,
	type ProcReference,
	type SegmentType,
	SegmentTypes
} from '$lib/AsmInterpreter/parsing/SegmentType';
import { get_directives } from '$lib/AsmInterpreter/parsing/Lines/Directives/DirectiveStore';
import { EmptyInstructionLine, WhitespaceLineTypes } from '$lib/AsmInterpreter/parsing/Lines/Whitespace';
import { get_instructions } from '$lib/AsmInterpreter/parsing/Lines/Instructions/InstructionStore';
import type { Program } from '$lib/AsmInterpreter/Program';
import { Procedure } from '$lib/AsmInterpreter/procedures/Procedure';
import { MAX_PAGE_OFFSET_BYTES } from '$lib/AsmInterpreter/system/MemoryAddress';
import type { VariableIdentifier } from '$lib/AsmInterpreter/parsing/Variable';

/**
 * Parses Masm32
 */
class Parser {
	private static singleton: Parser;
	public line_keys: LineKeyMap;
	private lastparse_errors?: Monaco.editor.IMarkerData[];

	private constructor() {

		let lk: { [key in SegmentType]?: LineParser[] } = {};
		for (let i = 0; i < SegmentTypes.length; i++) {
			lk[SegmentTypes[i]] = [];
		}
		this.line_keys = lk as LineKeyMap;

		let directives = get_directives();
		console.info(`registering ${directives.length} directives`);
		directives.forEach(directive => {
			if (directive.legal_in_mode.length == 0) {
				console.warn(`directive ${directive.name} is legal in no modes`);
			} else {

				console.debug(`registering directive ${directive.name} in modes: [${directive.legal_in_mode.join(', ')}]`);
				directive.legal_in_mode.forEach(mode => {
					this.line_keys[mode].push(directive);
				});
			}
		});

		let instructions = get_instructions();
		console.info(`registering ${instructions.length} instructions`);
		instructions.forEach(instruction => {
			console.debug(`registering instruction ${instruction.name}`);
			this.line_keys['procedure'].push(instruction);
		});

		console.info(`registering ${WhitespaceLineTypes.length} whitespace types`);
		WhitespaceLineTypes.forEach(ws_category => {
			console.debug(`registering whitespace category: ${ws_category.name} in modes [${ws_category.legal_in_mode.join(', ')}]`);
			ws_category.legal_in_mode.forEach(mode => {
				this.line_keys[mode].push(ws_category);
			});
		});


	}

	static get_parser(): Parser {
		if (Parser.singleton == undefined) {
			console.log('parser building');
			let parser_build_start = performance.now();
			Parser.singleton = new Parser();
			let parser_build_end = performance.now();
			console.log(`parser built in ${parser_build_end - parser_build_start}ms`);
		}
		return Parser.singleton;
	}

	static reset_parser(){
		(Parser.singleton as any) = undefined
		Parser.get_parser()
	}

	public async validate(models: Map<String, Monaco.editor.ITextModel>): Promise<ParseState> {
		return new Promise(async (accept, reject) => {
			try {
				console.log(`parser validating`);
				let parser_validate_start = performance.now();

				// convert each models lines of text into unparsed lines & give each model its own ParseState
				let model_parses: { lines: ParsingLine[], model: Monaco.editor.ITextModel, parse: ParseState }[] = [];
				models.forEach((model) => {
					model_parses.push({
						lines: this.create_parsing_lines(model.getLinesContent()),
						model: model,
						parse: new ParseState(model.uri.toString())
					});
				});

				// pass 1 - cleanup whitespace and comments
				for (let model_index = 0; model_index < model_parses.length; model_index++) {
					model_parses[model_index].lines = this.cleanup_whitespace(model_parses[model_index].lines);
				}

				// pass 2 - resolve symbols
				for (let model_index = 0; model_index < model_parses.length; model_index++) {
					model_parses[model_index].lines = await this.resolve_symbols(model_parses[model_index].parse, model_parses[model_index].lines);
				}

				// pass 3 - link
				let merged_parse = await this.link(model_parses);

				// pass 4 - error all unresolved lines in all models
				for (let model_index = 0; model_index < model_parses.length; model_index++) {
					await this.error_unparsed(model_parses[model_index].parse, model_parses[model_index].lines);
				}

				// flush all errors from all models
				let buildable = true;
				for (let model_index = 0; model_index < model_parses.length; model_index++) {
					let errors = await this.flush_errors(model_parses[model_index].parse);
					(await Interpreter.get_instance()).monaco.editor.setModelMarkers(model_parses[model_index].model, 'parse-errors', errors);
					if (!model_parses[model_index].parse.buildable) {
						buildable = false;
					}
				}

				let parser_validate_end = performance.now();
				console.log(`parser validate completed in ${parser_validate_end - parser_validate_start}ms`);

				merged_parse.buildable = buildable;
				if (buildable) {
					accept(merged_parse);
				} else {
					reject(merged_parse);
				}
			} catch (e) {
				throw e;
			}
		});
	}

	public async build(models: Map<string, Monaco.editor.ITextModel>): Promise<Program> {
		return new Promise(async (resolve, reject) => {

			// convert models into proc builders
			let parser_build_start = performance.now();
			console.log(`parser building`);
			let parse: ParseState;
			try {
				parse = await this.validate(models);
			} catch (e: any) {
				let parser_build_end = performance.now();
				console.log(`parser build failed in ${parser_build_end - parser_build_start}ms ${(e ?? 'unknown').toString()}`);
				reject('validate failed');
				return;
			}

			let procedures: Map<string, Procedure> = new Map();

			// build all procedures
			parse.procedures.forEach((proc_builder, name) => {
				let proc = new Procedure(proc_builder);
				procedures.set(proc_reference_to_key(proc.ref), proc);
			});

			const main_ref: ProcReference = { model: 'file:///vfs/main.asm', name: 'main' };
			// identify main
			let main = procedures.get(proc_reference_to_key(main_ref));
			if (main == undefined) {
				let parser_build_end = performance.now();
				console.error(`parser build failed in ${parser_build_end - parser_build_start}ms, no main function (this should have failed during linking, why didnt it?)`);
				console.error(`all procs: "${procedures.entries().map((proc) => {
					return JSON.stringify(main_ref);
				}).toArray().join(', ')}"`);
				console.error(`searching for: ${JSON.stringify(main_ref)}`);
				reject();
				return;
			}

			// estimate # of instruction pages
			let instruction_pages;
			let ln_mapping: InstructionLnReference[] = [];
			{
				let total_lines = 0;
				procedures.forEach((proc) => {
					for (let line_number = 0; line_number < proc.lines.length; line_number++) {
						ln_mapping.push({ proc: proc.ref, ln: line_number });
					}
				});
				instruction_pages = Math.ceil(total_lines / MAX_PAGE_OFFSET_BYTES);
			}

			// construct reverse map
			let reverse_ln_map: Map<string, number> = new Map();
			for (let i = 0; i < ln_mapping.length; i++) {
				let ref = ln_mapping[i];
				let key = instruction_reference_to_key(ref);
				reverse_ln_map.set(key, i);
			}

			let byte_offset = instruction_pages * MAX_PAGE_OFFSET_BYTES;
			// resolve variables to bytes
			let bytes: number[] = [];
			let res_map: Map<VariableIdentifier, number> = new Map<VariableIdentifier, number>;
			parse.variables.forEach((variable, identifier) => {
				res_map.set(identifier, bytes.length + byte_offset);
				bytes = bytes.concat(variable.to_bytes());
			});

			// move all bytes into a new data view
			let alloc = new DataView(new ArrayBuffer(bytes.length));
			for (let index = 0; index < bytes.length; index++) {
				alloc.setUint8(index, bytes[index]);
			}

			// now that all variables have been converted to bytes & we know their addresses we can resolve variable references to addresses
			procedures.forEach((proc, proc_ref) => {
				proc.lines.forEach((line, line_index) => {
					if (line.runtime != undefined) {

						// resolve variable addresses
						if (line.runtime.requested_variable_address_resolutions.size > 0) {
							let line_resolutions: Map<string, number> = new Map();
							line.runtime.requested_variable_address_resolutions.forEach((_, search_key) => {
								parse.variables.forEach((variable, var_key) => {
									if (var_key.variable_name == search_key && variable.is_valid_in_scope(proc.ref.model)) {
										// all references were checked during validation, so it should be impossible for this not to resolve
										let var_addr = res_map.get(var_key);
										if (var_addr == undefined) {
											throw `Invalid variable address resolution state at build time, unknown variable name ${var_key}`;
										}
										line_resolutions.set(search_key, var_addr);
									}
								});
							});
							if (line.runtime.requested_variable_address_resolutions.size != line_resolutions.size) {
								throw `Invalid variable address resolution state at build time, requested variable address resolutions and located resolutions sizes do not match`;
							}
							line.runtime.requested_variable_address_resolutions = line_resolutions;
						}


						// resolve line reference addresses
						if (line.runtime.requested_ln_ref_address_resolutions.size > 0) {
							let line_resolutions: Map<string, number> = new Map();
							line.runtime.requested_ln_ref_address_resolutions.forEach((_, search_key) => {
								let ref = parse.line_references.get(search_key);
								if (ref == undefined) {
									throw `Invalid variable address resolution state at build time, unknown line ref ${search_key}`;
								}

								let key = instruction_reference_to_key({ ln: ref.line_number, proc: proc.ref });
								let addr = reverse_ln_map.get(key);

								if (addr == undefined) {
									throw `Invalid variable address resolution state  at build time, reverse map cannot resolve instruction address for ${key}`;
								}

								console.debug(`resolved line reference address ${search_key}->${addr}`)
								line_resolutions.set(search_key, addr);
							});

							if (line.runtime.requested_ln_ref_address_resolutions.size != line_resolutions.size) {
								throw `Invalid variable address resolution state at build time, requested line reference address resolution and located resolution sizes do not match`;
							}
							line.runtime.requested_ln_ref_address_resolutions = line_resolutions;
						}

						// resolve procedure reference addresses
						if (line.runtime.requested_proc_address_resolutions.size > 0) {
							let line_resolutions: Map<string, number> = new Map();
							line.runtime.requested_proc_address_resolutions.forEach((_, search_key) => {
								let procs = parse.procedures.entries().toArray().map((v) => {
									let ref = v[1].get_ref();
									return `${ref.model}:${ref.name}`;
								}).join(', ');

								let proc_ref: ProcReference = { model: 'file:///vfs/main.asm', name: search_key };

								console.debug(`known procs ${procs}`);

								let ref = parse.procedures.get(proc_reference_to_key(proc_ref));
								if (ref == undefined) {
									throw `Invalid variable address resolution state at build time, unknown proc ref ${proc_ref.model}:${proc_ref.name}`;
								}

								let key = instruction_reference_to_key({ ln: 0, proc: proc_ref });
								let addr = reverse_ln_map.get(key);

								if (addr == undefined) {
									throw `Invalid variable address resolution state  at build time, reverse map cannot resolve proc address for ${key}`;
								}

								console.debug(`resolved proc address ${search_key}->${addr}`);
								line_resolutions.set(search_key, addr);
							});

							if (line.runtime.requested_proc_address_resolutions.size != line_resolutions.size) {
								throw `Invalid variable address resolution state at build time, requested line reference address resolution and located resolution sizes do not match`;
							}
							console.debug(`line: ${line.loc.line_number}\nrequested proc address resolutions: ${line.runtime.requested_proc_address_resolutions.size} provided resolutions: ${line_resolutions.size}`);
							line.runtime.requested_proc_address_resolutions = line_resolutions;
						}
					}
				});
			});

			let program: Program = {
				main: main,
				procedures: procedures,
				static_alloc: alloc,
				static_offset: instruction_pages,
				ln_mapping: ln_mapping
			};

			let parser_build_end = performance.now();
			console.log(`parser build succeeded in ${parser_build_end - parser_build_start}ms`);
			resolve(program);

		});
	}

	cleanup_whitespace(parsing_lines: ParsingLine[]) {
		for (let i = 0; i < parsing_lines.length; i++) {
			if (parsing_lines[i].type == 'unparsed') {
				let line = (parsing_lines[i] as tagged_unparsed_line);
				let start_trimmed = line.loc.text.trimStart();
				let offset = line.loc.text.length - start_trimmed.length;
				line.loc.text = start_trimmed.trimEnd();
				line.loc.whitespace_shift = offset;

				let comment_start = line.loc.text.indexOf(';');
				if (comment_start >= 0) {
					line.loc.text = line.loc.text.substring(0, comment_start).trimEnd();
				}

				line.loc.text = line.loc.text.toLowerCase();

				if (line.loc.text.length == 0) {
					parsing_lines[i] = { type: 'directive', instruction: EmptyInstructionLine, loc: line.loc };
				}


			}
		}

		return parsing_lines;
	}

	async resolve_symbols(parse: ParseState, parsing_lines: ParsingLine[]): Promise<ParsingLine[]> {
		try {


			let SEVERITY = (await Interpreter.get_instance()).monaco.MarkerSeverity;
			for (let line_index = 0; line_index < parsing_lines.length; line_index++) {
				//console.log(`checking line: ${line_index}`);
				let line = parsing_lines[line_index];
				let keys: LineParser[] = this.line_keys[parse.segment];
				if (line.type == 'unparsed') {
					console.debug(`trying to parse line "${line.loc.text}" in segment mode ${parse.segment}`);
					for (let parser_index = 0; parser_index < keys.length; parser_index++) {
						console.debug(`checking line with ${keys[parser_index].name}`);

						let loc = line.loc;
						//console.log(`checking line: ${line_index} for key ${parser_index}`);
						let try_hit = loc.text.match(keys[parser_index].tag);
						if (try_hit == null) {
							console.debug(`regex miss "${line.loc.text}" ${keys[parser_index].tag.toString()}`);
						} else {
							let lineParser = keys[parser_index];

							let hit = try_hit[0];
							let starts_at = try_hit.index! + loc.whitespace_shift;
							let ends_at = starts_at + hit.length;

							console.debug(`parse hit ${keys[parser_index].name} with "${hit}"`);

							if (!lineParser.supported) {
								parse.errors.push({
									message: lineParser.unsupported_err_message ?? `${lineParser.name} is not supported`, position: {
										endColumn: ends_at,
										endLineNumber: loc.line_number,
										startColumn: starts_at,
										startLineNumber: loc.line_number
									}, severity: SEVERITY.Error
								});
								console.debug(`parse fail (unsupported): ${line_index} - ${lineParser.name} - ${JSON.stringify(loc)}`);
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
									severity: SEVERITY.Error
								});
								console.debug(`parse fail (illegal in mode): ${line_index} - ${lineParser.name} - ${JSON.stringify(loc)}`);
								break;
							}
							let parse_result
							try {
								 parse_result = lineParser.apply_parse(loc, parse);
							} catch (e) {
								throw e
							}
							parse = parse_result.state ?? parse;
							let parse_result_ln = parse_result.line;
							parsing_lines[line_index] = parse_result_ln;
							if (parse.current_proc != undefined) {
								parse.current_proc?.add_ln(parse_result_ln);
							}

							if (parse_result_ln.type == 'invalid') {
								parse.errors.push({
									message: parse_result_ln.message, position: {
										startLineNumber: loc.line_number,
										endLineNumber: loc.line_number,
										startColumn: loc.whitespace_shift,
										endColumn: loc.text.length + loc.whitespace_shift
									}, severity: SEVERITY.Error
								});
								console.debug(`parse fail (line parser returned error): ${line_index} - ${lineParser.name} - ${JSON.stringify(loc)}`);
								break;
							}

							console.debug(`parse pass: ${line_index} - ${lineParser.name} - ${JSON.stringify(loc)}`);

							break;
						}
					}
				}
			}

			return parsing_lines;
		} catch (e) {
			throw e;
		}
	}

	async link(models: {
		lines: ParsingLine[], model: Monaco.editor.ITextModel, parse: ParseState
	}[]): Promise<ParseState> {
		let global_parse: ParseState = new ParseState();

		// globalize procedures and variables
		for (let model_index = 0; model_index < models.length; model_index++) {
			let model = models[model_index];
			console.debug(`linking ${model.parse.variables.size} procedures`);
			model.parse.procedures.forEach((proc, proc_id) => {
				global_parse.procedures.set(proc_id, proc);
			});
			console.debug(`linking ${model.parse.variables.size} variables`);
			model.parse.variables.forEach((variable, var_id) => {
				global_parse.variables.set(var_id, variable);
			});
			console.debug(`linking ${model.parse.line_references.size} line references`);
			model.parse.line_references.forEach((ref, ref_id) => {
				global_parse.line_references.set(ref_id, ref);
			});
		}

		// run line linkers
		for (let model_index = 0; model_index < models.length; model_index++) {
			let model = models[model_index];
			for (let line_index = 0; line_index < model.lines.length; line_index++) {
				if (model.lines[line_index].type == 'linkable') {
					let linkable = (model.lines[line_index] as tagged_linkable_line);
					let line = linkable.instruction.link(linkable.loc, global_parse);
					model.lines[line_index] = line.line;
					global_parse = line.state ?? global_parse;
				}
			}
		}

		// validate all requested references, procedures, and line identifiers
		for (let model_index = 0; model_index < models.length; model_index++) {
			let model = models[model_index];
			for (let line_index = 0; line_index < model.lines.length; line_index++) {
				if (model.lines[line_index].type != 'instruction') {
					continue;
				}

				let runtime_line = (model.lines[line_index] as tagged_executable_line).runtime;
				let req_misses: string[] = [];

				// variables
				if (runtime_line.requested_variable_address_resolutions != undefined) {
					runtime_line.requested_variable_address_resolutions.forEach((addr, req) => {
						// check if variable isn't available
						if (!global_parse.variables.has({ variable_name: req, model: model.model.uri.toString() })) {
							req_misses.push(req);
						}
					});
				}

				// procedures
				if (runtime_line.requested_proc_address_resolutions != undefined) {
					runtime_line.requested_proc_address_resolutions.forEach((addr, req) => {
						// check if variable isn't available
						let found_proc = false;
						global_parse.procedures.forEach((proc, ref) => {
							if (proc.proc_label == req) {
								found_proc = true;
							}
						});
						if (!found_proc) {
							req_misses.push(req);
						}
					});
				}

				// line references
				if (runtime_line.requested_ln_ref_address_resolutions != undefined) {
					runtime_line.requested_ln_ref_address_resolutions.forEach((addr, req) => {
						console.debug(`linker searching for line ref ${req}`);

						let ref = global_parse.line_references.get(req)
						if (ref == undefined) {
							req_misses.push(req);

							let refs: string[] = [];
							global_parse.line_references.forEach((ref, key) => {
								refs.push(`{${key} => ${ref.model}:${ref.line_number} (${ref.name})`);
							});
							console.debug(`link line references: [${refs.join(', ')}]`);

						} else {
							console.debug(`linker found line ref: ${req} -> ${ref.proc} ${ref.name} ${ref.line_number}`);
						}

					});
				}

				if (req_misses.length != 0) {
					console.debug(`link error, could not resolve reference ${model.model.uri.toString()}:${runtime_line.originating_loc.line_number}`);
					model.lines[line_index] = {
						loc: runtime_line.originating_loc,
						type: 'invalid',
						message: `reference(s) '${req_misses.join(', ')}' could not be resolved`
					};
				}
			}
		}


		return global_parse;
	}

	async error_unparsed(parse: ParseState, parsing_lines: ParsingLine[]) {
		for (let line_index = 0; line_index < parsing_lines.length; line_index++) {
			if (parsing_lines[line_index].type == 'unparsed') {
				let loc = (parsing_lines[line_index] as tagged_unparsed_line).loc;
				parse.errors.push({
					message: `Could not parse line ln ${loc.line_number}, start: ${loc.whitespace_shift}, end: ${loc.text.length + loc.whitespace_shift}`,
					position: {
						startLineNumber: loc.line_number,
						endLineNumber: loc.line_number,
						startColumn: loc.whitespace_shift,
						endColumn: loc.text.length + loc.whitespace_shift
					},
					severity: (await Interpreter.get_instance()).monaco.MarkerSeverity.Error
				});
			}
			if (parsing_lines[line_index].type == 'invalid') {
				let line = parsing_lines[line_index] as tagged_invalid_line;
				let loc = line.loc;
				parse.errors.push({
					message: line.message, position: {
						startLineNumber: loc.line_number,
						endLineNumber: loc.line_number,
						startColumn: loc.whitespace_shift,
						endColumn: loc.text.length + loc.whitespace_shift
					}, severity: (await Interpreter.get_instance()).monaco.MarkerSeverity.Error
				});
			}
		}
	}

	async flush_errors(parse: ParseState): Promise<Monaco.editor.IMarkerData[]> {
		let fatal_err_level = (await Interpreter.get_instance()).monaco.MarkerSeverity.Error;

		console.debug(`flushing ${parse.errors.length} errors`);

		let errs = parse.errors;
		parse.errors = [];

		this.lastparse_errors = new Array(errs.length);

		for (let i = 0; i < errs.length; i++) {
			let err = errs[i];
			this.lastparse_errors[i] = {
				startColumn: err.position.startColumn + 1,
				endColumn: err.position.endColumn + 1,
				startLineNumber: err.position.startLineNumber,
				endLineNumber: err.position.endLineNumber,
				message: err.message,
				severity: err.severity
			};

			if (err.severity >= fatal_err_level) {
				parse.buildable = false;
			}
		}

		// return a copy of the errors rather than the errors themselves
		return this.lastparse_errors.concat([]);
	}

	get_last_error_markers() {
		// return a copy of the errors rather than the errors themselves
		return (this.lastparse_errors ?? []).concat([]);
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


}

export default Parser;
