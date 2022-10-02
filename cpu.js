var fs = require('fs');
var path = require('path');
const { CPUMemory } = require('./mamory');
const { byte, int } = require('./utils');
var rom = fs.readFileSync(path.join(__dirname, "./dk.nes"));
Number.prototype.x = function () {
    return this.toString(16).padStart(4, '0')
}
module.exports.CPUFrequency = 1789773

module.exports.interruptNone = 1
module.exports.interruptNMI = 2
module.exports.interruptIRQ = 3

module.exports.modeAbsolute = 1
module.exports.modeAbsoluteX = 2
module.exports.modeAbsoluteY = 3
module.exports.modeAccumulator = 4
module.exports.modeImmediate = 5
module.exports.modeImplied = 6
module.exports.modeIndexedIndirect = 7
module.exports.modeIndirect = 8
module.exports.modeIndirectIndexed = 9
module.exports.modeRelative = 10
module.exports.modeZeroPage = 11
module.exports.modeZeroPageX = 12
module.exports.modeZeroPageY = 13

module.exports.StepInfo = class StepInfo {
    constructor(address, pc, mode) {
        this.address = uint16(address)
        this.pc = uint16(pc)
        this.mode = byte(mode)
    }
}

var instructionModes = [
    6, 7, 6, 7, 11, 11, 11, 11, 6, 5, 4, 5, 1, 1, 1, 1,
    10, 9, 6, 9, 12, 12, 12, 12, 6, 3, 6, 3, 2, 2, 2, 2,
    1, 7, 6, 7, 11, 11, 11, 11, 6, 5, 4, 5, 1, 1, 1, 1,
    10, 9, 6, 9, 12, 12, 12, 12, 6, 3, 6, 3, 2, 2, 2, 2,
    6, 7, 6, 7, 11, 11, 11, 11, 6, 5, 4, 5, 1, 1, 1, 1,
    10, 9, 6, 9, 12, 12, 12, 12, 6, 3, 6, 3, 2, 2, 2, 2,
    6, 7, 6, 7, 11, 11, 11, 11, 6, 5, 4, 5, 8, 1, 1, 1,
    10, 9, 6, 9, 12, 12, 12, 12, 6, 3, 6, 3, 2, 2, 2, 2,
    5, 7, 5, 7, 11, 11, 11, 11, 6, 5, 6, 5, 1, 1, 1, 1,
    10, 9, 6, 9, 12, 12, 13, 13, 6, 3, 6, 3, 2, 2, 3, 3,
    5, 7, 5, 7, 11, 11, 11, 11, 6, 5, 6, 5, 1, 1, 1, 1,
    10, 9, 6, 9, 12, 12, 13, 13, 6, 3, 6, 3, 2, 2, 3, 3,
    5, 7, 5, 7, 11, 11, 11, 11, 6, 5, 6, 5, 1, 1, 1, 1,
    10, 9, 6, 9, 12, 12, 12, 12, 6, 3, 6, 3, 2, 2, 2, 2,
    5, 7, 5, 7, 11, 11, 11, 11, 6, 5, 6, 5, 1, 1, 1, 1,
    10, 9, 6, 9, 12, 12, 12, 12, 6, 3, 6, 3, 2, 2, 2, 2,
].map(i => byte(i))


var instructionSizes = [
    2, 2, 0, 0, 2, 2, 2, 0, 1, 2, 1, 0, 3, 3, 3, 0,
    2, 2, 0, 0, 2, 2, 2, 0, 1, 3, 1, 0, 3, 3, 3, 0,
    3, 2, 0, 0, 2, 2, 2, 0, 1, 2, 1, 0, 3, 3, 3, 0,
    2, 2, 0, 0, 2, 2, 2, 0, 1, 3, 1, 0, 3, 3, 3, 0,
    1, 2, 0, 0, 2, 2, 2, 0, 1, 2, 1, 0, 3, 3, 3, 0,
    2, 2, 0, 0, 2, 2, 2, 0, 1, 3, 1, 0, 3, 3, 3, 0,
    1, 2, 0, 0, 2, 2, 2, 0, 1, 2, 1, 0, 3, 3, 3, 0,
    2, 2, 0, 0, 2, 2, 2, 0, 1, 3, 1, 0, 3, 3, 3, 0,
    2, 2, 0, 0, 2, 2, 2, 0, 1, 0, 1, 0, 3, 3, 3, 0,
    2, 2, 0, 0, 2, 2, 2, 0, 1, 3, 1, 0, 0, 3, 0, 0,
    2, 2, 2, 0, 2, 2, 2, 0, 1, 2, 1, 0, 3, 3, 3, 0,
    2, 2, 0, 0, 2, 2, 2, 0, 1, 3, 1, 0, 3, 3, 3, 0,
    2, 2, 0, 0, 2, 2, 2, 0, 1, 2, 1, 0, 3, 3, 3, 0,
    2, 2, 0, 0, 2, 2, 2, 0, 1, 3, 1, 0, 3, 3, 3, 0,
    2, 2, 0, 0, 2, 2, 2, 0, 1, 2, 1, 0, 3, 3, 3, 0,
    2, 2, 0, 0, 2, 2, 2, 0, 1, 3, 1, 0, 3, 3, 3, 0,
].map(i => byte(i))

// instructionCycles indicates the number of cycles used by each instruction,
// not including conditional cycles
var instructionCycles = [
    7, 6, 2, 8, 3, 3, 5, 5, 3, 2, 2, 2, 4, 4, 6, 6,
    2, 5, 2, 8, 4, 4, 6, 6, 2, 4, 2, 7, 4, 4, 7, 7,
    6, 6, 2, 8, 3, 3, 5, 5, 4, 2, 2, 2, 4, 4, 6, 6,
    2, 5, 2, 8, 4, 4, 6, 6, 2, 4, 2, 7, 4, 4, 7, 7,
    6, 6, 2, 8, 3, 3, 5, 5, 3, 2, 2, 2, 3, 4, 6, 6,
    2, 5, 2, 8, 4, 4, 6, 6, 2, 4, 2, 7, 4, 4, 7, 7,
    6, 6, 2, 8, 3, 3, 5, 5, 4, 2, 2, 2, 5, 4, 6, 6,
    2, 5, 2, 8, 4, 4, 6, 6, 2, 4, 2, 7, 4, 4, 7, 7,
    2, 6, 2, 6, 3, 3, 3, 3, 2, 2, 2, 2, 4, 4, 4, 4,
    2, 6, 2, 6, 4, 4, 4, 4, 2, 5, 2, 5, 5, 5, 5, 5,
    2, 6, 2, 6, 3, 3, 3, 3, 2, 2, 2, 2, 4, 4, 4, 4,
    2, 5, 2, 5, 4, 4, 4, 4, 2, 4, 2, 4, 4, 4, 4, 4,
    2, 6, 2, 8, 3, 3, 5, 5, 2, 2, 2, 2, 4, 4, 6, 6,
    2, 5, 2, 8, 4, 4, 6, 6, 2, 4, 2, 7, 4, 4, 7, 7,
    2, 6, 2, 8, 3, 3, 5, 5, 2, 2, 2, 2, 4, 4, 6, 6,
    2, 5, 2, 8, 4, 4, 6, 6, 2, 4, 2, 7, 4, 4, 7, 7,
].map(i => byte(i))

// instructionPageCycles indicates the number of cycles used by each
// instruction when a page is crossed
var instructionPageCycles = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    1, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0,
].map(i => byte(i))

// instructionNames indicates the name of each instruction
var instructionNames = [
    "BRK", "ORA", "KIL", "SLO", "NOP", "ORA", "ASL", "SLO",
    "PHP", "ORA", "ASL", "ANC", "NOP", "ORA", "ASL", "SLO",
    "BPL", "ORA", "KIL", "SLO", "NOP", "ORA", "ASL", "SLO",
    "CLC", "ORA", "NOP", "SLO", "NOP", "ORA", "ASL", "SLO",
    "JSR", "AND", "KIL", "RLA", "BIT", "AND", "ROL", "RLA",
    "PLP", "AND", "ROL", "ANC", "BIT", "AND", "ROL", "RLA",
    "BMI", "AND", "KIL", "RLA", "NOP", "AND", "ROL", "RLA",
    "SEC", "AND", "NOP", "RLA", "NOP", "AND", "ROL", "RLA",
    "RTI", "EOR", "KIL", "SRE", "NOP", "EOR", "LSR", "SRE",
    "PHA", "EOR", "LSR", "ALR", "JMP", "EOR", "LSR", "SRE",
    "BVC", "EOR", "KIL", "SRE", "NOP", "EOR", "LSR", "SRE",
    "CLI", "EOR", "NOP", "SRE", "NOP", "EOR", "LSR", "SRE",
    "RTS", "ADC", "KIL", "RRA", "NOP", "ADC", "ROR", "RRA",
    "PLA", "ADC", "ROR", "ARR", "JMP", "ADC", "ROR", "RRA",
    "BVS", "ADC", "KIL", "RRA", "NOP", "ADC", "ROR", "RRA",
    "SEI", "ADC", "NOP", "RRA", "NOP", "ADC", "ROR", "RRA",
    "NOP", "STA", "NOP", "SAX", "STY", "STA", "STX", "SAX",
    "DEY", "NOP", "TXA", "XAA", "STY", "STA", "STX", "SAX",
    "BCC", "STA", "KIL", "AHX", "STY", "STA", "STX", "SAX",
    "TYA", "STA", "TXS", "TAS", "SHY", "STA", "SHX", "AHX",
    "LDY", "LDA", "LDX", "LAX", "LDY", "LDA", "LDX", "LAX",
    "TAY", "LDA", "TAX", "LAX", "LDY", "LDA", "LDX", "LAX",
    "BCS", "LDA", "KIL", "LAX", "LDY", "LDA", "LDX", "LAX",
    "CLV", "LDA", "TSX", "LAS", "LDY", "LDA", "LDX", "LAX",
    "CPY", "CMP", "NOP", "DCP", "CPY", "CMP", "DEC", "DCP",
    "INY", "CMP", "DEX", "AXS", "CPY", "CMP", "DEC", "DCP",
    "BNE", "CMP", "KIL", "DCP", "NOP", "CMP", "DEC", "DCP",
    "CLD", "CMP", "NOP", "DCP", "NOP", "CMP", "DEC", "DCP",
    "CPX", "SBC", "NOP", "ISC", "CPX", "SBC", "INC", "ISC",
    "INX", "SBC", "NOP", "SBC", "CPX", "SBC", "INC", "ISC",
    "BEQ", "SBC", "KIL", "ISC", "NOP", "SBC", "INC", "ISC",
    "SED", "SBC", "NOP", "ISC", "NOP", "SBC", "INC", "ISC",
]

module.exports.CPU = class CPU {
    constructor(console) {
        this.Memory = new CPUMemory(console);         // memory interface
        this.Cycles = uint64(0x00) // number of cycles
        this.PC = uint16(0x00) // program counter
        this.SP = byte(0x00)   // stack pointer
        this.A = byte(0x00)   // accumulator
        this.X = byte(0x00)   // x register
        this.Y = byte(0x00)   // y register
        this.C = byte(0x00)   // carry flag
        this.Z = byte(0x00)   // zero flag
        this.I = byte(0x00)   // interrupt disable flag
        this.D = byte(0x00)   // decimal mode flag
        this.B = byte(0x00)   // break command flag
        this.U = byte(0x00)   // unused flag
        this.V = byte(0x00)   // overflow flag
        this.N = byte(0x00)   // negative flag
        this.interrupt = byte(0x00)   // interrupt type to perform
        this.stall = int(0x00)    // number of cycles to stall
        this.table[256];
        this.createTable()
        this.reset()
        return this
    }
    createTable() {
        this.table = [
            this.brk, this.ora, this.kil, this.slo, this.nop, this.ora, this.asl, this.slo,
            this.php, this.ora, this.asl, this.anc, this.nop, this.ora, this.asl, this.slo,
            this.bpl, this.ora, this.kil, this.slo, this.nop, this.ora, this.asl, this.slo,
            this.clc, this.ora, this.nop, this.slo, this.nop, this.ora, this.asl, this.slo,
            this.jsr, this.and, this.kil, this.rla, this.bit, this.and, this.rol, this.rla,
            this.plp, this.and, this.rol, this.anc, this.bit, this.and, this.rol, this.rla,
            this.bmi, this.and, this.kil, this.rla, this.nop, this.and, this.rol, this.rla,
            this.sec, this.and, this.nop, this.rla, this.nop, this.and, this.rol, this.rla,
            this.rti, this.eor, this.kil, this.sre, this.nop, this.eor, this.lsr, this.sre,
            this.pha, this.eor, this.lsr, this.alr, this.jmp, this.eor, this.lsr, this.sre,
            this.bvc, this.eor, this.kil, this.sre, this.nop, this.eor, this.lsr, this.sre,
            this.cli, this.eor, this.nop, this.sre, this.nop, this.eor, this.lsr, this.sre,
            this.rts, this.adc, this.kil, this.rra, this.nop, this.adc, this.ror, this.rra,
            this.pla, this.adc, this.ror, this.arr, this.jmp, this.adc, this.ror, this.rra,
            this.bvs, this.adc, this.kil, this.rra, this.nop, this.adc, this.ror, this.rra,
            this.sei, this.adc, this.nop, this.rra, this.nop, this.adc, this.ror, this.rra,
            this.nop, this.sta, this.nop, this.sax, this.sty, this.sta, this.stx, this.sax,
            this.dey, this.nop, this.txa, this.xaa, this.sty, this.sta, this.stx, this.sax,
            this.bcc, this.sta, this.kil, this.ahx, this.sty, this.sta, this.stx, this.sax,
            this.tya, this.sta, this.txs, this.tas, this.shy, this.sta, this.shx, this.ahx,
            this.ldy, this.lda, this.ldx, this.lax, this.ldy, this.lda, this.ldx, this.lax,
            this.tay, this.lda, this.tax, this.lax, this.ldy, this.lda, this.ldx, this.lax,
            this.bcs, this.lda, this.kil, this.lax, this.ldy, this.lda, this.ldx, this.lax,
            this.clv, this.lda, this.tsx, this.las, this.ldy, this.lda, this.ldx, this.lax,
            this.cpy, this.cmp, this.nop, this.dcp, this.cpy, this.cmp, this.dec, this.dcp,
            this.iny, this.cmp, this.dex, this.axs, this.cpy, this.cmp, this.dec, this.dcp,
            this.bne, this.cmp, this.kil, this.dcp, this.nop, this.cmp, this.dec, this.dcp,
            this.cld, this.cmp, this.nop, this.dcp, this.nop, this.cmp, this.dec, this.dcp,
            this.cpx, this.sbc, this.nop, this.isc, this.cpx, this.sbc, this.inc, this.isc,
            this.inx, this.sbc, this.nop, this.sbc, this.cpx, this.sbc, this.inc, this.isc,
            this.beq, this.sbc, this.kil, this.isc, this.nop, this.sbc, this.inc, this.isc,
            this.sed, this.sbc, this.nop, this.isc, this.nop, this.sbc, this.inc, this.isc,
        ]
    }
    reset() {
        this.PC = this.Read16(0xFFFC)
        this.SP = 0xFD
        this.SetFlags(0x24)
    }
    write() {

    }
    read() {

    }

    printInstruction() {
        const opcode = this.Memory.read(this.PC)
        const bytes = instructionSizes[opcode]
        const name = instructionNames[opcode]
        const w0 = console.log("%02X", this.Memory.read(this.PC + 0))
        const w1 = console.log("%02X", this.Memory.read(this.PC + 1))
        const w2 = console.log("%02X", this.Memory.read(this.PC + 2))
        if (bytes < 2) {
            w1 = "  "
        }
        if (bytes < 3) {
            w2 = "  "
        }
        console.log(
            [this.PC, w0, w1, w2, name, "",
            this.A, this.X, this.Y, this.Flags(),
            this.SP, (this.Cycles * 3) % 341].map(i => byte(i)))
    }
    read16(address) {
        const address = uint16(address)
        const lo = uint16(this.Memory.read(address))
        const hi = uint16(this.Memory.read(address + 1))
        return uint16(hi << 8 | lo)
    }
    pagesDiffer(a, b) {
        return a & 0xFF00 != b & 0xFF00
    }

    addBranchCycles(info) {
        this.Cycles++
        if (this.pagesDiffer(info.pc, info.address)) {
            this.Cycles++
        }
    }

    compare(a, b) {
        this.setZN(byte(a) - byte(b))
        if (a >= b) {
            this.C = 1
        } else {
            this.C = 0
        }
    }

    // Read16 reads two bytes using Read to return a double-word value
    read16(address) {
        const address = uint16(address)
        const lo = uint16(this.Memory.read(address))
        const hi = uint16(this.Memory.read(address + 1))
        return uint16(hi << 8 | lo)
    }

    // read16bug emulates a 6502 bug that caused the low byte to wrap without
    // incrementing the high byte
    read16bug(address) {
        const a = uint16(address)
        const b = (a & 0xFF00) | uint16(byte(a) + 1)
        const lo = this.Memory.read(a)
        const hi = this.Memory.read(b)
        return uint16(uint16(hi) << 8 | uint16(lo))
    }

    // push pushes a byte onto the stack
    push(value) {
        this.Memory.write(0x100 | uint16(this.SP), byte(value))
        this.SP--
    }

    // pull pops a byte from the stack
    pull() {
        this.SP++
        return byte(this.Memory.read(0x100 | uint16(this.SP)))
    }

    // push16 pushes two bytes onto the stack
    push16(value) {
        const hi = byte(uint16(value) >> 8)
        const lo = byte(uint16(value) & 0xFF)
        this.push(hi)
        this.push(lo)
    }

    // pull16 pops two bytes from the stack
    pull16() {
        const lo = uint16(this.pull())
        const hi = uint16(this.pull())
        return uint16(hi << 8 | lo)
    }

    // Flags returns the processor status flags
    Flags() {
        var flags = byte(0)
        flags |= this.C << 0
        flags |= this.Z << 1
        flags |= this.I << 2
        flags |= this.D << 3
        flags |= this.B << 4
        flags |= this.U << 5
        flags |= this.V << 6
        flags |= this.N << 7
        return byte(flags)
    }

    // SetFlags sets the processor status flags
    SetFlags(flags) {
        this.C = (byte(flags) >> 0) & 1
        this.Z = (byte(flags) >> 1) & 1
        this.I = (byte(flags) >> 2) & 1
        this.D = (byte(flags) >> 3) & 1
        this.B = (byte(flags) >> 4) & 1
        this.U = (byte(flags) >> 5) & 1
        this.V = (byte(flags) >> 6) & 1
        this.N = (byte(flags) >> 7) & 1
    }

    // setZ sets the zero flag if the argument is zero
    setZ(value) {
        if (byte(value) == 0) {
            this.Z = 1
        } else {
            this.Z = 0
        }
    }

    // setN sets the negative flag if the argument is negative (high bit is set)
    setN(value) {
        if (byte(value) & 0x80 != 0) {
            this.N = 1
        } else {
            this.N = 0
        }
    }

    // setZN sets the zero flag and the negative flag
    setZN(value) {
        this.setZ(byte(value))
        this.setN(byte(value))
    }

    // triggerNMI causes a non-maskable interrupt to occur on the next cycle
    triggerNMI() {
        this.interrupt = interruptNMI
    }

    // triggerIRQ causes an IRQ interrupt to occur on the next cycle
    triggerIRQ() {
        if (this.I == 0) {
            this.interrupt = interruptIRQ
        }
    }

    // stepInfo contains information that the instruction functions use


    // Step executes a single CPU instruction
    step() {
        if (this.stall > 0) {
            this.stall--
            return 1
        }

        const cycles = this.Cycles

        switch (this.interrupt) {
            case interruptNMI:
                this.nmi()
            case interruptIRQ:
                this.irq()
        }
        this.interrupt = interruptNone

        const opcode = this.Memory.read(this.PC)
        const mode = instructionModes[opcode]

        var address = uint16(0)
        var pageCrossed = false
        switch (mode) {
            case this.modeAbsolute:
                address = this.Read16(this.PC + 1)
            case this.modeAbsoluteX:
                address = this.Read16(this.PC + 1) + uint16(this.X)
                pageCrossed = pagesDiffer(address - uint16(this.X), address)
            case this.modeAbsoluteY:
                address = this.Read16(this.PC + 1) + uint16(this.Y)
                pageCrossed = pagesDiffer(address - uint16(this.Y), address)
            case this.modeAccumulator:
                address = 0
            case this.modeImmediate:
                address = this.PC + 1
            case this.modeImplied:
                address = 0
            case this.modeIndexedIndirect:
                address = this.read16bug(uint16(this.Memory.read(this.PC + 1) + this.X))
            case this.modeIndirect:
                address = this.read16bug(this.Read16(this.PC + 1))
            case this.modeIndirectIndexed:
                address = this.read16bug(uint16(this.Memory.read(this.PC + 1))) + uint16(this.Y)
                pageCrossed = pagesDiffer(address - uint16(this.Y), address)
            case this.modeRelative:
                const offset = uint16(this.Memory.read(this.PC + 1))
                if (offset < 0x80) {
                    address = this.PC + 2 + offset
                } else {
                    address = this.PC + 2 + offset - 0x100
                }
            case this.modeZeroPage:
                address = uint16(this.Memory.read(this.PC + 1))
            case this.modeZeroPageX:
                address = uint16(this.Memory.read(this.PC + 1) + this.X) & 0xff
            case this.modeZeroPageY:
                address = uint16(this.Memory.read(this.PC + 1) + this.Y) & 0xff
        }

        this.PC += uint16(instructionSizes[opcode])
        this.Cycles += uint64(instructionCycles[opcode])
        if (pageCrossed) {
            this.Cycles += uint64(instructionPageCycles[opcode])
        }
        const info = new StepInfo(address, this.PC, mode)
        this.table[opcode](info)

        return int(this.Cycles - cycles)
    }

    // NMI - Non-Maskable Interrupt
    nmi() {
        this.push16(this.PC)
        this.php(nil)
        this.PC = this.read16(0xFFFA)
        this.I = 1
        this.Cycles += 7
    }

    // IRQ - IRQ Interrupt
    irq() {
        this.push16(this.PC)
        this.php(nil)
        this.PC = this.Read16(0xFFFE)
        this.I = 1
        this.Cycles += 7
    }

    // ADC - Add with Carry
    adc(info) {
        const a = this.A
        const b = this.Memory.read(info.address)
        const c = this.C
        this.A = a + b + c
        this.setZN(this.A)
        if (int(a) + int(b) + int(c) > 0xFF) {
            this.C = 1
        } else {
            this.C = 0
        }
        if ((a ^ b) & 0x80 == 0 && (a ^ this.A) & 0x80 != 0) {
            this.V = 1
        } else {
            this.V = 0
        }
    }

    // AND - Logical AND
    and(info) {
        this.A = this.A & this.Memory.read(info.address)
        this.setZN(this.A)
    }

    // ASL - Arithmetic Shift Left
    asl(info) {
        if (info.mode == modeAccumulator) {
            this.C = (this.A >> 7) & 1
            this.A <<= 1
            this.setZN(this.A)
        } else {
            const value = this.Memory.read(info.address)
            this.C = (value >> 7) & 1
            value <<= 1
            this.Memory.write(info.address, value)
            this.setZN(value)
        }
    }

    // BCC - Branch if Carry Clear
    bcc(info) {
        if (this.C == 0) {
            this.PC = info.address
            this.addBranchCycles(info)
        }
    }

    // BCS - Branch if Carry Set
    bcs(info) {
        if (this.C != 0) {
            this.PC = info.address
            this.addBranchCycles(info)
        }
    }

    // BEQ - Branch if Equal
    beq(info) {
        if (this.Z != 0) {
            this.PC = info.address
            this.addBranchCycles(info)
        }
    }

    // BIT - Bit Test
    bit(info) {
        const value = this.Memory.read(info.address)
        this.V = (value >> 6) & 1
        this.setZ(value & this.A)
        this.setN(value)
    }

    // BMI - Branch if Minus
    bmi(info) {
        if (this.N != 0) {
            this.PC = info.address
            this.addBranchCycles(info)
        }
    }

    // BNE - Branch if Not Equal
    bne(info) {
        if (this.Z == 0) {
            this.PC = info.address
            this.addBranchCycles(info)
        }
    }

    // BPL - Branch if Positive
    bpl(info) {
        if (this.N == 0) {
            this.PC = info.address
            this.addBranchCycles(info)
        }
    }

    // BRK - Force Interrupt
    brk(info) {
        this.push16(this.PC)
        this.php(info)
        this.sei(info)
        this.PC = this.Read16(0xFFFE)
    }

    // BVC - Branch if Overflow Clear
    bvc(info) {
        if (this.V == 0) {
            this.PC = info.address
            this.addBranchCycles(info)
        }
    }

    // BVS - Branch if Overflow Set
    bvs(info) {
        if (this.V != 0) {
            this.PC = info.address
            this.addBranchCycles(info)
        }
    }

    // CLC - Clear Carry Flag
    clc(info) {
        this.C = 0
    }

    // CLD - Clear Decimal Mode
    cld(info) {
        this.D = 0
    }

    // CLI - Clear Interrupt Disable
    cli(info) {
        this.I = 0
    }

    // CLV - Clear Overflow Flag
    clv(info) {
        this.V = 0
    }

    // CMP - Compare
    cmp(info) {
        const value = this.Memory.read(info.address)
        this.compare(this.A, value)
    }

    // CPX - Compare X Register
    cpx(info) {
        const value = this.Memory.read(info.address)
        this.compare(this.X, value)
    }

    // CPY - Compare Y Register
    cpy(info) {
        const value = this.Memory.read(info.address)
        this.compare(this.Y, value)
    }

    // DEC - Decrement Memory
    dec(info) {
        const value = this.Memory.read(info.address) - 1
        this.Memory.write(info.address, value)
        this.setZN(value)
    }

    // DEX - Decrement X Register
    dex(info) {
        this.X--
        this.setZN(this.X)
    }

    // DEY - Decrement Y Register
    dey(info) {
        this.Y--
        this.setZN(this.Y)
    }

    // EOR - Exclusive OR
    eor(info) {
        this.A = this.A ^ this.Memory.read(info.address)
        this.setZN(this.A)
    }

    // INC - Increment Memory
    inc(info) {
        const value = this.Memory.read(info.address) + 1
        this.Memory.write(info.address, value)
        this.setZN(value)
    }

    // INX - Increment X Register
    inx(info) {
        this.X++
        this.setZN(this.X)
    }

    // INY - Increment Y Register
    iny(info) {
        this.Y++
        this.setZN(this.Y)
    }

    // JMP - Jump
    jmp(info) {
        this.PC = info.address
    }

    // JSR - Jump to Subroutine
    jsr(info) {
        this.push16(this.PC - 1)
        this.PC = info.address
    }

    // LDA - Load Accumulator
    lda(info) {
        this.A = this.Memory.read(info.address)
        this.setZN(this.A)
    }

    // LDX - Load X Register
    ldx(info) {
        this.X = this.Memory.read(info.address)
        this.setZN(this.X)
    }

    // LDY - Load Y Register
    ldy(info) {
        this.Y = this.Memory.read(info.address)
        this.setZN(this.Y)
    }

    // LSR - Logical Shift Right
    lsr(info) {
        if (info.mode == this.modeAccumulator) {
            this.C = this.A & 1
            this.A >>= 1
            this.setZN(this.A)
        } else {
            const value = this.Memory.read(info.address)
            this.C = value & 1
            value >>= 1
            this.Memory.write(info.address, value)
            this.setZN(value)
        }
    }

    // NOP - No Operation
    nop(info) {
    }

    // ORA - Logical Inclusive OR
    ora(info) {
        this.A = this.A | this.Memory.read(info.address)
        this.setZN(this.A)
    }

    // PHA - Push Accumulator
    pha(info) {
        this.push(this.A)
    }

    // PHP - Push Processor Status
    php(info) {
        this.push(this.Flags() | 0x10)
    }

    // PLA - Pull Accumulator
    pla(info) {
        this.A = this.pull()
        this.setZN(this.A)
    }

    // PLP - Pull Processor Status
    plp(info) {
        this.SetFlags(this.pull() & 0xEF | 0x20)
    }

    // ROL - Rotate Left
    rol(info) {
        if (info.mode == this.modeAccumulator) {
            const c = this.C
            this.C = (this.A >> 7) & 1
            this.A = (this.A << 1) | c
            this.setZN(this.A)
        } else {
            const c = this.C
            let value = this.Memory.read(info.address)
            this.C = (value >> 7) & 1
            value = (value << 1) | c
            this.Memory.write(info.address, value)
            this.setZN(value)
        }
    }

    // ROR - Rotate Right
    ror(info) {
        if (info.mode == this.modeAccumulator) {
            const c = this.C
            this.C = this.A & 1
            this.A = (this.A >> 1) | (c << 7)
            this.setZN(this.A)
        } else {
            const c = this.C
            let value = this.Memory.read(info.address)
            this.C = value & 1
            value = (value >> 1) | (c << 7)
            this.Memory.write(info.address, value)
            this.setZN(value)
        }
    }

    // RTI - Return from Interrupt
    rti(info) {
        this.setFlags(this.pull() & 0xEF | 0x20)
        this.PC = this.pull16()
    }

    // RTS - Return from Subroutine
    rts(info) {
        this.PC = this.pull16() + 1
    }

    // SBC - Subtract with Carry
    sbc(info) {
        const a = this.A
        const b = this.Memory.read(info.address)
        const c = this.C
        this.A = a - b - (1 - c)
        this.setZN(this.A)
        if (int(a) - int(b) - int(1 - c) >= 0) {
            this.C = 1
        } else {
            this.C = 0
        }
        if ((a ^ b) & 0x80 != 0 && (a ^ this.A) & 0x80 != 0) {
            this.V = 1
        } else {
            this.V = 0
        }
    }

    // SEC - Set Carry Flag
    sec(info) {
        this.C = 1
    }

    // SED - Set Decimal Flag
    sed(info) {
        this.D = 1
    }

    // SEI - Set Interrupt Disable
    sei(info) {
        this.I = 1
    }

    // STA - Store Accumulator
    sta(info) {
        this.Memory.write(info.address, this.A)
    }

    // STX - Store X Register
    stx(info) {
        this.Memory.write(info.address, this.X)
    }

    // STY - Store Y Register
    sty(info) {
        this.Memory.write(info.address, this.Y)
    }

    // TAX - Transfer Accumulator to X
    tax(info) {
        this.X = this.A
        this.setZN(this.X)
    }

    // TAY - Transfer Accumulator to Y
    tay(info) {
        this.Y = this.A
        this.setZN(this.Y)
    }

    // TSX - Transfer Stack Pointer to X
    tsx(info) {
        this.X = this.SP
        this.setZN(this.X)
    }

    // TXA - Transfer X to Accumulator
    txa(info) {
        this.A = this.X
        this.setZN(this.A)
    }

    // TXS - Transfer X to Stack Pointer
    txs(info) {
        this.SP = this.X
    }

    // TYA - Transfer Y to Accumulator
    tya(info) {
        this.A = this.Y
        this.setZN(this.A)
    }

    // illegal opcodes below

    ahx(info) {
    }

    alr(info) {
    }

    anc(info) {
    }

    arr(info) {
    }

    axs(info) {
    }

    dcp(info) {
    }

    isc(info) {
    }

    kil(info) {
    }

    las(info) {
    }

    lax(info) {
    }

    rla(info) {
    }

    rra(info) {
    }

    sax(info) {
    }

    shx(info) {
    }

    shy(info) {
    }

    slo(info) {
    }

    sre(info) {
    }

    tas(info) {
    }

    xaa(info) {
    }



}