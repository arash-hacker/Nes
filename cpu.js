var fs = require('fs');
var path = require('path');
const { CPUMemory } = require('./mamory');
const { byte, int, uint16, uint64 } = require('./utils');
Number.prototype.x = function () {
    return this.toString(16).padStart(4, '0')
}
module.exports.CPUFrequency = 1789773
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

        this.interruptNone = 1
        this.interruptNMI = 2
        this.interruptIRQ = 3

        this.modeAbsolute = 1
        this.modeAbsoluteX = 2
        this.modeAbsoluteY = 3
        this.modeAccumulator = 4
        this.modeImmediate = 5
        this.modeImplied = 6
        this.modeIndexedIndirect = 7
        this.modeIndirect = 8
        this.modeIndirectIndexed = 9
        this.modeRelative = 10
        this.modeZeroPage = 11
        this.modeZeroPageX = 12
        this.modeZeroPageY = 13

        this.Memory = new CPUMemory(console);// memory interface
        this.Cycles = uint64(0x00) // number of cycles
        this.PC = uint16(0x00) // program counter
        this._SP = byte(0x00)   // stack pointer
        this._A = byte(0x00)   // accumulator
        this._X = byte(0x00)   // x register
        this._Y = byte(0x00)   // y register
        this._C = byte(0x00)   // carry flag
        this._Z = byte(0x00)   // zero flag
        this._I = byte(0x00)   // interrupt disable flag
        this._D = byte(0x00)   // decimal mode flag
        this._B = byte(0x00)   // break command flag
        this._U = byte(0x00)   // unused flag
        this._V = byte(0x00)   // overflow flag
        this._N = byte(0x00)   // negative flag
        this.interrupt = byte(0x00)   // interrupt type to perform
        this.stall = int(0x00)    // number of cycles to stall
        this.table = [];
        this.createTable()
        this.reset()
        return this
    }
    //     this.SP = byte(0x00)   // stack pointer
    get SP() {
        return this._SP;
    }
    set SP(v) {
        this._SP = byte(v)
    }
    // this.A = byte(0x00)   // accumulator
    get A() {
        return this._A;
    }
    set A(v) {
        this._A = byte(v)
    }
    // this.X = byte(0x00)   // x register

    get X() {
        return this._X;
    }
    set X(v) {
        this._X = byte(v)
    }

    // this.C = byte(0x00)   // carry flag
    get C() {
        return this._C;
    }
    set C(v) {
        this._C = byte(v)
    }
    // this.Y = byte(0x00)   // y register
    get Y() {
        return this._Y;
    }
    set Y(v) {
        this._Y = byte(v)
    }
    // this.Z = byte(0x00)   // zero flag
    get Z() {
        return this._Z;
    }
    set Z(v) {
        this._Z = byte(v)
    }
    // this.I = byte(0x00)   // interrupt disable flag
    get I() {
        return this._I;
    }
    set I(v) {
        this._I = byte(v)
    }
    // this.D = byte(0x00)   // decimal mode flag
    get D() {
        return this._D;
    }
    set D(v) {
        this._D = byte(v)
    }
    // this.B = byte(0x00)   // break command flag
    get B() {
        return this._B;
    }
    set B(v) {
        this._B = byte(v)
    }
    // this.U = byte(0x00)   // unused flag
    get U() {
        return this._U;
    }
    set U(v) {
        this._U = byte(v)
    }
    // this.V = byte(0x00)   // overflow flag
    get V() {
        return this._V;
    }
    set V(v) {
        this._V = byte(v)
    }
    // this.N = byte(0x00)   // negative flag
    get N() {
        return this._N;
    }
    set N(v) {
        this._N = byte(v)
    }
    createTable() {
        this.table = [
            this.brk.bind(this), this.ora.bind(this), this.kil.bind(this), this.slo.bind(this), this.nop.bind(this), this.ora.bind(this), this.asl.bind(this), this.slo.bind(this),
            this.php.bind(this), this.ora.bind(this), this.asl.bind(this), this.anc.bind(this), this.nop.bind(this), this.ora.bind(this), this.asl.bind(this), this.slo.bind(this),
            this.bpl.bind(this), this.ora.bind(this), this.kil.bind(this), this.slo.bind(this), this.nop.bind(this), this.ora.bind(this), this.asl.bind(this), this.slo.bind(this),
            this.clc.bind(this), this.ora.bind(this), this.nop.bind(this), this.slo.bind(this), this.nop.bind(this), this.ora.bind(this), this.asl.bind(this), this.slo.bind(this),
            this.jsr.bind(this), this.and.bind(this), this.kil.bind(this), this.rla.bind(this), this.bit.bind(this), this.and.bind(this), this.rol.bind(this), this.rla.bind(this),
            this.plp.bind(this), this.and.bind(this), this.rol.bind(this), this.anc.bind(this), this.bit.bind(this), this.and.bind(this), this.rol.bind(this), this.rla.bind(this),
            this.bmi.bind(this), this.and.bind(this), this.kil.bind(this), this.rla.bind(this), this.nop.bind(this), this.and.bind(this), this.rol.bind(this), this.rla.bind(this),
            this.sec.bind(this), this.and.bind(this), this.nop.bind(this), this.rla.bind(this), this.nop.bind(this), this.and.bind(this), this.rol.bind(this), this.rla.bind(this),
            this.rti.bind(this), this.eor.bind(this), this.kil.bind(this), this.sre.bind(this), this.nop.bind(this), this.eor.bind(this), this.lsr.bind(this), this.sre.bind(this),
            this.pha.bind(this), this.eor.bind(this), this.lsr.bind(this), this.alr.bind(this), this.jmp.bind(this), this.eor.bind(this), this.lsr.bind(this), this.sre.bind(this),
            this.bvc.bind(this), this.eor.bind(this), this.kil.bind(this), this.sre.bind(this), this.nop.bind(this), this.eor.bind(this), this.lsr.bind(this), this.sre.bind(this),
            this.cli.bind(this), this.eor.bind(this), this.nop.bind(this), this.sre.bind(this), this.nop.bind(this), this.eor.bind(this), this.lsr.bind(this), this.sre.bind(this),
            this.rts.bind(this), this.adc.bind(this), this.kil.bind(this), this.rra.bind(this), this.nop.bind(this), this.adc.bind(this), this.ror.bind(this), this.rra.bind(this),
            this.pla.bind(this), this.adc.bind(this), this.ror.bind(this), this.arr.bind(this), this.jmp.bind(this), this.adc.bind(this), this.ror.bind(this), this.rra.bind(this),
            this.bvs.bind(this), this.adc.bind(this), this.kil.bind(this), this.rra.bind(this), this.nop.bind(this), this.adc.bind(this), this.ror.bind(this), this.rra.bind(this),
            this.sei.bind(this), this.adc.bind(this), this.nop.bind(this), this.rra.bind(this), this.nop.bind(this), this.adc.bind(this), this.ror.bind(this), this.rra.bind(this),
            this.nop.bind(this), this.sta.bind(this), this.nop.bind(this), this.sax.bind(this), this.sty.bind(this), this.sta.bind(this), this.stx.bind(this), this.sax.bind(this),
            this.dey.bind(this), this.nop.bind(this), this.txa.bind(this), this.xaa.bind(this), this.sty.bind(this), this.sta.bind(this), this.stx.bind(this), this.sax.bind(this),
            this.bcc.bind(this), this.sta.bind(this), this.kil.bind(this), this.ahx.bind(this), this.sty.bind(this), this.sta.bind(this), this.stx.bind(this), this.sax.bind(this),
            this.tya.bind(this), this.sta.bind(this), this.txs.bind(this), this.tas.bind(this), this.shy.bind(this), this.sta.bind(this), this.shx.bind(this), this.ahx.bind(this),
            this.ldy.bind(this), this.lda.bind(this), this.ldx.bind(this), this.lax.bind(this), this.ldy.bind(this), this.lda.bind(this), this.ldx.bind(this), this.lax.bind(this),
            this.tay.bind(this), this.lda.bind(this), this.tax.bind(this), this.lax.bind(this), this.ldy.bind(this), this.lda.bind(this), this.ldx.bind(this), this.lax.bind(this),
            this.bcs.bind(this), this.lda.bind(this), this.kil.bind(this), this.lax.bind(this), this.ldy.bind(this), this.lda.bind(this), this.ldx.bind(this), this.lax.bind(this),
            this.clv.bind(this), this.lda.bind(this), this.tsx.bind(this), this.las.bind(this), this.ldy.bind(this), this.lda.bind(this), this.ldx.bind(this), this.lax.bind(this),
            this.cpy.bind(this), this.cmp.bind(this), this.nop.bind(this), this.dcp.bind(this), this.cpy.bind(this), this.cmp.bind(this), this.dec.bind(this), this.dcp.bind(this),
            this.iny.bind(this), this.cmp.bind(this), this.dex.bind(this), this.axs.bind(this), this.cpy.bind(this), this.cmp.bind(this), this.dec.bind(this), this.dcp.bind(this),
            this.bne.bind(this), this.cmp.bind(this), this.kil.bind(this), this.dcp.bind(this), this.nop.bind(this), this.cmp.bind(this), this.dec.bind(this), this.dcp.bind(this),
            this.cld.bind(this), this.cmp.bind(this), this.nop.bind(this), this.dcp.bind(this), this.nop.bind(this), this.cmp.bind(this), this.dec.bind(this), this.dcp.bind(this),
            this.cpx.bind(this), this.sbc.bind(this), this.nop.bind(this), this.isc.bind(this), this.cpx.bind(this), this.sbc.bind(this), this.inc.bind(this), this.isc.bind(this),
            this.inx.bind(this), this.sbc.bind(this), this.nop.bind(this), this.sbc.bind(this), this.cpx.bind(this), this.sbc.bind(this), this.inc.bind(this), this.isc.bind(this),
            this.beq.bind(this), this.sbc.bind(this), this.kil.bind(this), this.isc.bind(this), this.nop.bind(this), this.sbc.bind(this), this.inc.bind(this), this.isc.bind(this),
            this.sed.bind(this), this.sbc.bind(this), this.nop.bind(this), this.isc.bind(this), this.nop.bind(this), this.sbc.bind(this), this.inc.bind(this), this.isc.bind(this),
        ]
    }
    reset() {
        this.PC = this.read16(0xFFFC)
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
    read16(adr) {
        const address = uint16(adr)
        const lo = uint16(this.Memory.read(address))
        const hi = uint16(this.Memory.read(address + 1))
        return uint16(hi << 8 | lo)
    }
    pagesDiffer(a, b) {
        return (a & 0xFF00) != (b & 0xFF00)
    }

    addBranchCycles(info) {
        this.Cycles++
        console.log(":zzz:", this.pagesDiffer(info.pc, info.address))
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
    read16(adr) {
        const address = uint16(adr)
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
    // maybe bug & 0x01FF
    push(value) {

        this.Memory.write(0x100 | uint16(this.SP), byte(value))
        this.SP--
    }

    // pull pops a byte from the stack
    // maybe bug & 0x01FF
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
        let flags = byte(0)
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
        // console.log(":N:", value, byte(value) & 0x80)
        if ((byte(value) & 0x80) != 0) {
            this.N = 1
        } else {
            this.N = 0
        }
        // console.log(":NN:", this.N)

    }

    // setZN sets the zero flag and the negative flag
    setZN(value) {
        this.setZ(byte(value))
        this.setN(byte(value))
    }

    // triggerNMI causes a non-maskable interrupt to occur on the next cycle
    triggerNMI() {
        this.interrupt = this.interruptNMI
    }

    // triggerIRQ causes an IRQ interrupt to occur on the next cycle
    triggerIRQ() {
        if (this.I == 0) {
            this.interrupt = this.interruptIRQ
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
        console.log(":cyc-cyc:", this.Cycles)

        switch (this.interrupt) {
            case this.interruptNMI:
                this.nmi()
                break
            case this.interruptIRQ:
                this.irq()
                break
        }
        this.interrupt = this.interruptNone

        const opcode = this.Memory.read(this.PC)
        const mode = instructionModes[opcode]
        console.log("OOO", this.PC, opcode, mode)
        let address = uint16(0)
        let pageCrossed = false
        switch (mode) {
            case this.modeAbsolute:
                address = uint16(this.read16(this.PC + 1))
                break
            case this.modeAbsoluteX:
                address = uint16(this.read16(this.PC + 1) + uint16(this.X))
                pageCrossed = this.pagesDiffer(address - uint16(this.X), address)
                break
            case this.modeAbsoluteY:
                address = uint16(this.read16(this.PC + 1) + uint16(this.Y))
                pageCrossed = this.pagesDiffer(address - uint16(this.Y), address)
                break
            case this.modeAccumulator:
                address = uint16(0)
                break
            case this.modeImmediate:
                address = uint16(this.PC + 1)
                break
            case this.modeImplied:
                address = uint16(0)
                break
            case this.modeIndexedIndirect:
                address = uint16(this.read16bug(uint16(this.Memory.read(this.PC + 1) + this.X)))
                break
            case this.modeIndirect:
                address = uint16(this.read16bug(this.read16(this.PC + 1)))
                break
            case this.modeIndirectIndexed:
                address = uint16(this.read16bug(uint16(this.Memory.read(this.PC + 1))) + uint16(this.Y))
                pageCrossed = this.pagesDiffer(address - uint16(this.Y), address)
                break
            case this.modeRelative:
                const offset = uint16(this.Memory.read(this.PC + 1))
                if (offset < 0x80) {
                    address = uint16(this.PC + 2 + offset)
                } else {
                    address = uint16(this.PC + 2 + offset - 0x100)
                }
                break
            case this.modeZeroPage:
                address = uint16(this.Memory.read(this.PC + 1))
                break
            case this.modeZeroPageX:
                address = uint16(this.Memory.read(this.PC + 1) + this.X) & 0xff
                break
            case this.modeZeroPageY:
                address = uint16(this.Memory.read(this.PC + 1) + this.Y) & 0xff
                break
        }
        console.log("111", this.PC, mode, opcode, address)

        this.PC += uint16(instructionSizes[opcode])
        this.Cycles = uint64(this.Cycles + uint64(instructionCycles[opcode]))
        console.log(":zz:", this.Cycles, uint64(instructionCycles[opcode]), pageCrossed)

        if (pageCrossed) {
            this.Cycles += uint64(instructionPageCycles[opcode])
        }
        const info = new module.exports.StepInfo(address, this.PC, mode)

        console.log("222", this.PC, "&{", info.address, info.pc, info.mode, "}", instructionNames[opcode])
        console.log("333", this.PC, this.SP, this.A, this.X, this.Y, this.C, this.Z, this.I, this.D, this.B, this.U, this.V, this.N)
        this.table[opcode](info)
        console.log("444", this.PC, this.SP, this.A, this.X, this.Y, this.C, this.Z, this.I, this.D, this.B, this.U, this.V, this.N)
        console.log("555", this.PC, "&{", info.address, info.pc, info.mode, "}", instructionNames[opcode])
        console.log(":cyc:", this.Cycles, cycles)
        return int(this.Cycles - cycles)
    }

    // NMI - Non-Maskable Interrupt
    nmi() {
        this.push16(this.PC)
        this.php(null)
        this.PC = this.read16(0xFFFA)
        this.I = 1
        this.Cycles += 7
    }

    // IRQ - IRQ Interrupt
    irq() {
        this.push16(this.PC)
        this.php(null)
        this.PC = this.read16(0xFFFE)
        this.I = 1
        this.Cycles += 7
    }

    // ADC - Add with Carry
    adc(info) {
        const a = this.A
        const b = this.Memory.read(info.address)
        const c = byte(this.C)
        this.A = byte(a + b + c)
        this.setZN(this.A)
        if (int(a) + int(b) + int(c) > 0xFF) {
            this.C = 1
        } else {
            this.C = 0
        }
        if ((((a ^ b) & 0x80) == 0) && (((a ^ this.A) & 0x80) != 0)) {
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
        if (info.mode == this.modeAccumulator) {
            this.C = (this.A >> 7) & 1
            this.A = byte(byte(this.A) << 1)
            this.setZN(this.A)
        } else {
            let value = this.Memory.read(info.address)
            this.C = (byte(value) >> 7) & 1
            value = byte(value << 1)
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
        this.PC = this.read16(0xFFFE)
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
        this.X = byte(this.X - 1)
        this.setZN(this.X)
    }

    // DEY - Decrement Y Register
    dey(info) {
        this.Y = byte(this.Y - 1)
        console.log(":Y:", this.Y)
        this.setZN(this.Y)
        console.log(":Z:", this.Z)

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
        this.X = byte(this.X + 1)
        this.setZN(this.X)
    }

    // INY - Increment Y Register
    iny(info) {
        this.Y = byte(this.Y + 1)
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
        console.log("A:", this.A, byte(this.A))
        this.A = byte(this.A)
        this.setZN(this.A)
        console.log(":?:", this.N)
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
            let value = this.Memory.read(info.address)
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
            this.C = byte(byte(this.A) >> 7) & 1
            this.A = byte(byte(this.A) << 1) | c
            this.setZN(this.A)
        } else {
            const c = this.C
            let value = this.Memory.read(info.address)
            this.C = byte(byte(value) >> 7) & 1
            value = byte(byte(value) << 1) | c
            this.Memory.write(info.address, value)
            this.setZN(value)
        }
    }

    // ROR - Rotate Right
    ror(info) {
        if (info.mode == this.modeAccumulator) {
            const c = this.C
            this.C = byte(this.A) & 1
            this.A = byte(byte(this.A) >> 1) | byte(byte(c) << 7)
            this.setZN(this.A)
        } else {
            const c = this.C
            let value = this.Memory.read(info.address)
            this.C = value & 1
            value = byte(value >> 1) | byte(c << 7)
            this.Memory.write(info.address, value)
            this.setZN(value)
        }
    }

    // RTI - Return from Interrupt
    rti(info) {
        this.SetFlags(this.pull() & 0xEF | 0x20)
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
        if ((((a ^ b) & 0x80) != 0) && (((a ^ this.A) & 0x80) != 0)) {
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