export default ".386P\n" +
".model flat\n" +
".code\n" +
"fib PROC\n" +
"\t; pop return pointer\n" +
"\tpop edi\n" +
"\t; pop requested fibinachi number\n" +
"\tpop edx\n" +
"\t; replace return pointer\n" +
"\tpush edi\n" +
"\t; setup our adder registers\n" +
"\tmov eax, 0\n" +
"\tmov ebx, 1\n" +
"\t; decrement our couter by two to cover the two base numbers\n" +
"\tsub edx, 2\n" +
"_loop_start:\n" +
"\t; add our last number into our current number\n" +
"\tadd eax, ebx\n" +
"\t; decrement counter\n" +
"\tsub edx, 1\n" +
"\tjz _done\n" +
"\t; add current number into last\n" +
"\tadd ebx, eax\n" +
"\tsub edx, 1\n" +
"\t; we need to move ebx into eax first if we are done here because we switched which register was our current and which was our last\n" +
"\tjz _swap\n" +
"\t; if the couter isnt zero then we jump back to the start of the loop\n" +
"\tjmp _loop_start\n" +
"_swap:\n" +
"\t; fix swapped registers\n" +
"\tmov eax, ebx\n" +
"_done:\n" +
"\t; return with fibinachi number in eax\n" +
"\tret\n" +
"fib ENDP\n" +
"\n" +
"main PROC\n" +
"\tmov esi, 3\n" +
"_main_loop:\n" +
"\tpush esi\n" +
"\tcall fib\n" +
"\tpush eax\n" +
"\tinc esi\n" +
"\tjmp _main_loop\n" +
"main ENDP\n" +
"END"


/*
export default ".386P\n" +
".model flat\n" +
".code\n" +
"\n" +
"fib PROC\n" +
"\n" +
"\t; pop return pointer\n" +
"\tpop edi\n" +
"\n" +
"\t; pop requested fibinachi number\n" +
"\tpop edx\n" +
"\n" +
"\t; replace return pointer\n" +
"\tpush edi\n" +
"\n" +
"\t; setup our adder registers\n" +
"\tmov eax, 0\n" +
"\tmov ebx, 1\n" +
"\n" +
"\t; decrement our couter by two to cover the two base numbers\n" +
"\tsub edx, 2\n" +
"\n" +
"_loop_start:\n" +
"\n" +
"\t; add our last number into our current number\n" +
"\tadd eax, ebx\n" +
"\n" +
"\t; decrement counter\n" +
"\tsub edx, 1\n" +
"\tjz _done\n" +
"\n" +
"\t; add current number into last\n" +
"\tadd ebx, eax\n" +
"\n" +
"\tsub edx, 1\n" +
"\t; we need to move ebx into eax first if we are done here because we switched which register was our current and which was our last\n" +
"\tjz _swap\n" +
"\t\n" +
"\t; if the couter isnt zero then we jump back to the start of the loop\n" +
"\tjmp _loop_start\n" +
"\n" +
"_swap:\n" +
"\t; fix swapped registers\n" +
"\tmov eax, ebx\n" +
"_done:\n" +
"\t; return with fibinachi number in eax\n" +
"\tret\n" +
"\n" +
"fib ENDP\n" +
"\n" +
"main PROC\n" +
"\n" +
"\tpush 30\n" +
"\tcall fib\n" +
"\n" +
"main ENDP\n" +
"\n" +
"END"


/*
export default ".386P\n" +
".model flat\n" +
".code\n" +
"\n" +
"main PROC\n" +
"\n" +
"\tadd eax, 2\n" +
"\tadd eax, 2\n" +
"\tcall helper\n" +
"\tpush eax\n" +
"\n" +
"main ENDP\n" +
"\n" +
"helper PROC\n" +
"\n" +
"\tinc eax\n" +
"\tinc eax\n" +
"\tinc eax\n" +
"\tinc eax\n" +
"\tinc eax\n" +
"\tret\n"+
"\n" +
"helper ENDP\n" +
"\n" +
"END"

/*
export default ".386P\n" +
".model flat\n" +
".code\n" +
"\n" +
"main PROC\n" +
"\n" +
"a:\n" +
"jmp a\n" +
"\n" +
"main ENDP\n" +
"\n" +
"END"


/*
export default ".386P\n" +
".model flat\n" +
".code\n" +
"\n" +
"main PROC\n" +
"\tpush EAX\n" +
"\tinc EAX\n" +
"\tpush EAX\n" +
"\tinc EAX\n" +
"\tpush EAX\n" +
"\tinc EAX\n" +
"\tpush EAX\n" +
"\tinc EAX\n" +
"\tpush EAX\n" +
"\tinc EAX\n" +
"\n" +
"main ENDP\n" +
"\n" +
"END"
*/
