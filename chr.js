var fs = require('fs');
var path = require('path');
var rom = fs.readFileSync(path.join(__dirname, "./rom/dk.nes"));
let CHR = []
console.log(rom)
function createCHR(rom, CHR) {
    const Z = 16 + (16384 * rom[4])
    let i = 0
    while (i < 8192 * rom[5] - 8) {
        for (let j = 0; j < 8; j++) {
            let extracted1 = [...rom[Z + i + j + 0].toString(2).padStart(8, '0')]
            let extracted2 = [...rom[Z + i + j + 8].toString(2).padStart(8, '0')]

            let extracted3 = extracted1.map((char, index) => char + extracted2[index])
            extracted3.filter((char, index) => {
                if (char == '00') extracted3[index] = '⚫️'
                if (char == '10') extracted3[index] = '🔴'
                if (char == '01') extracted3[index] = '🔵'
                if (char == '11') extracted3[index] = '⚪️'
            })
            extracted3 = extracted3.join('')
            CHR[i + j] = extracted3
        }

        i = i + 8
    }
}
createCHR(rom, CHR)
function printCHR(rom, CHR) {
    let i = 0
    while (i < 8192 * rom[5] - 8) {
        for (let j = 0; j < 8; j++) {
            console.log(CHR[i + j]);
        }
        console.log(i - 8, i)
        i += 8
    }

}
function check() {
    const rom = fs.readFileSync(path.join(__dirname, "./rom/dk.nes"));
    const nesHeader = (rom[0] << 24 + rom[1] << 16 + rom[2] << 8 + rom[3]) & 0xffffffff;
    if (!nesHeader == 0x1a53454e) {
        throw Error("unmatched nes header")
    }
    this.prgCount = rom[4] // PRG-ROM page count
    this.chrCount = rom[5] // CHR-ROM page count
    this.control1 = rom[6] // mapper mirroring battery trainer
    this.control2 = rom[7] // mapper mirroring battery trainer

    const mapper1 = this.control1 >> 4
    const mapper2 = this.control2 >> 4
    this.mapper = mapper1 | mapper2 << 4

    const mirror1 = this.control1 & 1
    const mirror2 = (this.control1 >> 3) & 1
    this.mirror = mirror1 | mirror2 << 1

    const Z = 16 + (16384 * this.prgCount)

    this.chr = [];
    this.prg = [];

    for (let i = 16; i < Z; i++) {
        this.prg.push(rom[i])
    }

    for (let i = Z; i < Z + 8192 * this.chrCount; i++) {
        this.chr.push(rom[i])
    }

    if (this.chrCount == 0) {
        this.chr = new Array(8129).fill(0x00)
    }
    console.log(this.mapper)
    return rom
}
// check()
printCHR(rom, CHR)
