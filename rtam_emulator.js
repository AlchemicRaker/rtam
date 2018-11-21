
/*
6 ALU signals, for 6 ALU outputs
16 register signals, for 8 register read + write signals
4 jump signals, for 2 jumps and 2 end jumps
1 halt signal, for stopping the program
5 general signals, for general purpose inputs including constants

+ - < > = overflow
R1-8, read registers 1 through 8
W1-8, write registers 1 through 8
J1-2, jump if not zero
E1-2, end jump
HALT, stops execution
G1-5, general purpose inputs, constants
*/

// const inputs = [5,10,1,0,0];

function parseInstructions(lines){
	return lines.trim().split("\n").map(line=>line.trim().split(","));
}

//construct a new state
function createState(program, inputs) {
	return {
		registers: [0,0,0,0,0,0,0,0],
		inputs: inputs,
		instructions: parseInstructions(program),
		jumps: [0,0]
	};
}

//returns a value 0 to 15
function readSignal(state, signal) {
	switch(signal){
		case "R1":
			return state.registers[0];
		case "R2":
			return state.registers[1];
		case "R3":
			return state.registers[2];
		case "R4":
			return state.registers[3];
		case "R5":
			return state.registers[4];
		case "R6":
			return state.registers[5];
		case "R7":
			return state.registers[6];
		case "R8":
			return state.registers[7];
		case "G1":
			return state.inputs[0];
		case "G2":
			return state.inputs[1];
		case "G3":
			return state.inputs[2];
		case "G4":
			return state.inputs[3];
		case "G5":
			return state.inputs[4];
		case "+":
			return Math.min(state.registers[0] + state.registers[1], 15);
		case "-":
			return Math.max(state.registers[0] - state.registers[1], 0);
		case "<":
			return state.registers[0] < state.registers[1] ? 1 : 0;
		case ">":
			return state.registers[0] > state.registers[1] ? 1 : 0;
		case "=":
			return state.registers[0] == state.registers[1] ? 1 : 0;
		case "overflow":
			return (state.registers[0] + state.registers[1]) > 15;
		default:
			return 0;
	}
}

const mutableSignals = ["W1","W2","W3","W4","W5","W6","W7","W8","HALT"];

//returns a new state
function applySignal(state, signal, bus) {
	const newRegisters = [...state.registers];
	if(Math.max(...state.jumps) > 0 && mutableSignals.includes(signal))
			return state;
	switch(signal){
		case "W1":
			newRegisters[0] = bus;
			return {...state, registers:newRegisters};
		case "W2":
			newRegisters[1] = bus;
			return {...state, registers:newRegisters};
		case "W3":
			newRegisters[2] = bus;
			return {...state, registers:newRegisters};
		case "W4":
			newRegisters[3] = bus;
			return {...state, registers:newRegisters};
		case "W5":
			newRegisters[4] = bus;
			return {...state, registers:newRegisters};
		case "W6":
			newRegisters[5] = bus;
			return {...state, registers:newRegisters};
		case "W7":
			newRegisters[6] = bus;
			return {...state, registers:newRegisters};
		case "W8":
			newRegisters[7] = bus;
			return {...state, registers:newRegisters};
		case "J1":
			return {...state, jumps: [bus>=1?1:state.jumps[0], state.jumps[1]]};
		case "J2":
			return {...state, jumps: [state.jumps[0], bus>=1?1:state.jumps[1]]};
		case "E1":
			return {...state, jumps: [0, state.jumps[1]]};
		case "E2":
			return {...state, jumps: [state.jumps[0], 0]};
		default: 
			return state;
	}
}

//take a state and return a new state
function clock(state) {
	const bus = Math.max(...state.instructions[0].map(signal=>readSignal(state, signal)));

	const modifiedState = 
		state.instructions[0].reduce((rstate, rsignal)=>applySignal(rstate, rsignal, bus), state);

	return {
		...modifiedState,
		instructions: state.instructions.slice(1).concat([state.instructions[0]])
	};
}

//clock until the state halts
function run(state, debug) {
	let currentState = state;
	let limit = 0;
	while((currentState.instructions[0] != "HALT" || Math.max(...currentState.jumps) > 0) && limit++ < 10000){
		if(debug)console.log();
		if(debug)console.log("Instruction: "+currentState.instructions[0].join(","));
		currentState = clock(currentState);

		if(debug)console.log(currentState);

		if(limit % state.instructions.length == 0)console.log("Output: "+currentState.registers[7]);
	}
	if(!debug)console.log("Final Output: "+currentState.registers[7]);
}

run(createState(`W8,G1
E2
W1,R8
W2,G3
W8,+
W1,R8
W2,G2
J2,<
HALT`,[2,6,1,0,0]), false);