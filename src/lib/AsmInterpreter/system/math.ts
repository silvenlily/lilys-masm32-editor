const MAX_32BIT_NUMBER = 0b11111111_11111111_11111111_11111111 as const;
const MAX_16BIT_NUMBER = 0b11111111_11111111 as const;
const MAX_8BIT_NUMBER = 0b11111111 as const;

export function random_int() {
	return Math.round(Math.random() * MAX_32BIT_NUMBER);
}

export function underflow_sub_int(num1: number, num2: number): [number, boolean] {
	let result = num1 - num2;
	let carry = false;
	while (result < 0) {
		result += MAX_32BIT_NUMBER;
		carry = true;
	}
	return [result, carry];
}

export function overflow_add_int(num1: number, num2: number): [number, boolean] {
	let result = num1 - num2;
	let carry = false;
	while (result > MAX_32BIT_NUMBER) {
		result -= MAX_32BIT_NUMBER;
		carry = true;
	}
	return [result, carry];
}


export function random_short() {
	return Math.round(Math.random() * MAX_16BIT_NUMBER);
}

export function underflow_sub_short(num1: number, num2: number): [number, boolean] {
	let result = num1 - num2;
	let carry = false;
	while (result < 0) {
		result += MAX_16BIT_NUMBER;
		carry = true;
	}
	return [result, carry];
}

export function overflow_add_short(num1: number, num2: number): [number, boolean] {
	let result = num1 - num2;
	let carry = false;
	while (result > MAX_16BIT_NUMBER) {
		result -= MAX_16BIT_NUMBER;
		carry = true;
	}
	return [result, carry];
}

export function random_byte() {
	return Math.round(Math.random() * MAX_8BIT_NUMBER);
}

export function underflow_sub_byte(num1: number, num2: number): [number, boolean] {
	let result = num1 - num2;
	let carry = false;
	while (result < 0) {
		result += MAX_8BIT_NUMBER;
		carry = true;
	}
	return [result, carry];
}

export function overflow_add_byte(num1: number, num2: number): [number, boolean] {
	let result = num1 - num2;
	let carry = false;
	while (result > MAX_8BIT_NUMBER) {
		result -= MAX_8BIT_NUMBER;
		carry = true;
	}
	return [result, carry];
}