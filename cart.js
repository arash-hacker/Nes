var fs = require('fs');
var path = require('path');
const { Mapper0 } = require('./mapper0');
module.exports.Cart = class Cart {
    constructor(pth) {
        const rom = fs.readFileSync(path.join(__dirname, pth || "./rom/dk.nes"));
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

        this.sram = new Array(0x2000).fill(0x00)



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
    }
    createMapper() {
        switch (this.mapper) {
            case 0:
                return new Mapper0(this)
            default:
                throw Error("unsupported Mapper for now!")
        }
    }
}
