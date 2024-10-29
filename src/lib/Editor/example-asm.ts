export default ".486\n" +
	".MODEL FLAT\n" +
	".CODE\n" +
	"PUBLIC _myFunc\n" +
	"_myFunc PROC\n" +
	"  ; Subroutine Prologue\n" +
	"  push ebp     ; Save the old base pointer value.\n" +
	"  mov ebp, esp ; Set the new base pointer value.\n" +
	"  sub esp, 4   ; Make room for one 4-byte local variable.\n" +
	"  push edi     ; Save the values of registers that the function\n" +
	"  push esi     ; will modify. This function uses EDI and ESI.\n" +
	"  ; (no need to save EBX, EBP, or ESP)\n" +
	"\n" +
	"_some_label:\n" +
	"  ; Subroutine Body\n" +
	"  mov eax, [ebp+8]   ; Move value of parameter 1 into EAX\n" +
	"  mov esi, [ebp+12]  ; Move value of parameter 2 into ESI\n" +
	"  mov edi, [ebp+16*ESI]  ; Move value of parameter 3 into EDI\n" +
	"\n" +
	"  mov [ebp-4], edi   ; Move EDI into the local variable\n" +
	"  add [ebp-4], esi   ; Add ESI into the local variable\n" +
	"  add eax, [ebp-4]   ; Add the contents of the local variable\n" +
	"\n" +
	"  cmp eax, ebp\n" +
	"  jmp _some_label\n" +
	"\n" +
	"  ; Subroutine Epilogue \n" +
	"  pop esi      ; Recover register values\n" +
	"  pop edi\n" +
	"  mov esp, ebp ; Deallocate local variables\n" +
	"  pop ebp ; Restore the caller's base pointer value\n" +
	"  ret\n" +
	"_myFunc ENDP\n" +
	"END"