export default "; recursion assignemnt\n" +
"; Lily Young\n" +
"; 20 October 2024\n" +
"; calculates the factorial of a number\n" +
"\n" +
".model flat\n" +
"\n" +
".code\n" +
"\n" +
"; calculates the factorial of the number in EAX, returning the result in EAX\n" +
"; modifies EAX\n" +
"factorial PROC near\n" +
"_factorial:\n" +
"\t; save registers\n" +
"\tpush EDX\n" +
"\tpush EBX\n" +
"\tpush ECX\n" +
"\n" +
"\tmov EBX, EAX\n" +
"\tdec EBX\n" +
"\n" +
"\tcall factorial_inner\n" +
"\n" +
"\t; return saved registers\n" +
"\tpop ECX\n" +
"\tpop EBX\n" +
"\tpop EDX\n" +
"\tret\n" +
"factorial ENDP\n" +
"\n" +
"; factorial inner function\n" +
"; EBX - next factorial multiplier\n" +
"; EAX - current total\n" +
"; ESI - devnull\n" +
"factorial_inner PROC near\n" +
"_factorial_inner:\n" +
"\t\n" +
"\timul EAX, EBX\n" +
"\tdec EBX\n" +
"\tjc _overflow\n" +
"\n" +
"\tcmp EBX, 1\n" +
"\tjle _done\n" +
"\n" +
"\tcall factorial_inner\n" +
"\n" +
"_done:\n" +
"\tret\n" +
"_overflow:\n" +
"\tmov EAX, 0\n" +
"\tret\n" +
"factorial_inner ENDP\n" +
"\n" +
"END";