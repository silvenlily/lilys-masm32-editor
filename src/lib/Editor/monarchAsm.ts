import type * as Monaco from 'monaco-editor/esm/vs/editor/editor.api';

export const asm_extention: Monaco.languages.ILanguageExtensionPoint = {
	id: 'asm'
};

export const asm_theme: Monaco.editor.IStandaloneThemeData = {
	colors: {},
	base: 'vs-dark',
	inherit: true,
	rules: [
		{ token: 'keyword', foreground: 'a1e6ff' },
		{ token: 'custom-register', foreground: 'AAFFAA' },
		{ token: 'custom-type', foreground: 'FFA500' },
		{ token: 'custom-compiler-directive', foreground: '55aa55' },
		{ token: 'custom-call', foreground: 'FFFF55' },
		{ token: 'custom-jump', foreground: 'FF88FF' },
		{ token: 'custom-label', foreground: 'FFAAFF' },
		{ token: 'custom-number', foreground: '77DD77' },
		{ token: 'custom-bracket', foreground: '77DD77' }
	]
};

export const asm_lang_conf: Monaco.languages.LanguageConfiguration = {
	comments: {
		lineComment: ';'
	},
	brackets: [
		['[', ']']
	],
	autoClosingPairs: [
		{ open: '[', close: ']' },
		{ open: '"', close: '"' },
		{ open: '\'', close: '\'' }
	],
	surroundingPairs: [
		{ open: '[', close: ']' },
		{ open: '"', close: '"' },
		{ open: '\'', close: '\'' }
	]
};

export const asm_lang_def: Monaco.languages.IMonarchLanguage = {
	// Set defaultToken to invalid to see what you do not tokenize yet
	ignoreCase: true,
	tokenPostfix: '.asm',

	compilerDirective: [
		'proc', 'endp', 'end', 'public'
	],

	keywords: [
		'mov', 'push', 'pop', 'lea',
		'add', 'sub', 'dec', 'inc', 'imul', 'idiv',
		'and', 'or', 'xor', 'not', 'neg', 'shl', 'shr'
	],

	typeKeywords: [
		'byte', 'word', 'dword', 'ptr'
	],

	operators: [
		'+', '-', '*'
	],

	brackets: [

	],

	digits: /\d+(_+\d+)*/,

	// The main tokenizer for our languages
	tokenizer: {
		root: [
			[/^\..*$/, 'custom-compiler-directive'],
			{ include: '@comment' },
			[/[ \t\r\n,]+/, 'white'],
			[/(eax|ebx|ecx|edx|esi|edi|esp|ebp|ax|bx|cx|dx|al|bl|cl|dl)/, 'custom-register'],
			[/(?:\s|^)(jmp|je|jne|jz|jg|jge|jl|jle)\s\w*/, 'custom-jump'],
			[/(?:\s|^)(cmp)(?=\s|$|,|;)/, 'custom-jump'],
			[/(?:\s|^)(ret)(?:\s|$|,|;)/, 'custom-call'],
			[/(?:\s|^)(call )[\w$]*/, 'custom-call'],
			[/(?:\s|^)(call)(?:\s|$|,|;)/, 'custom-call'],
			[/^[a-zA-Z_0-9]*:(?=\s*$|\s*;)/, 'custom-label'],
			[/[+\-\*]/, 'operator'],
			[/[\[\]]/, 'custom-brackets'],
			{ include: '@string' },

			[/[a-z_$][\w$]*/, {
				cases: {
					'@typeKeywords': 'keyword',
					'@compilerDirective': 'custom-compiler-directive',
					'@keywords': 'keyword',
				}
			}],
			[/(@digits)/, 'number'],
		],

		comment: [
			[/;.*/, 'comment']
		],

		string: [
			[/"+/, 'string'],
			[/'+/, 'string']
		]

	}
};
