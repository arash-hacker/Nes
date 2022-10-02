const { byte, uint16 } = require("./utils")


module.exports.MirrorHorizontal = 0
module.exports.MirrorVertical = 1
module.exports.MirrorSingle0 = 2
module.exports.MirrorSingle1 = 3
module.exports.MirrorFour = 4

module.exports.MirrorLookup = [
    [uint16(0), uint16(0), uint16(1), uint16(1)],
    [uint16(0), uint16(1), uint16(0), uint16(1)],
    [uint16(0), uint16(0), uint16(0), uint16(0)],
    [uint16(1), uint16(1), uint16(1), uint16(1)],
    [uint16(0), uint16(1), uint16(2), uint16(3)],
]

function MirrorAddress(mode, adr) {
    const address = (uint16(adr) - 0x2000) % 0x1000
    const table = address / 0x0400
    const offset = address % 0x0400
    return uint16(0x2000 + module.exports.MirrorLookup[byte(mode)][table] * 0x0400 + offset)
}

module.exports.CPUMemory = class CPUMemory {
    constructor(console) {
        this.console = console
    }

    read(address) {
        // console.log(address.x(), "<<<|")
        switch (true) {
            case uint16(address) < 0x2000:
                return this.console.RAM[address % 0x0800]
            case uint16(address) < 0x4000:
                // return this.console.PPU.readRegister(0x2000 + address % 8)
                break
            case uint16(address) == 0x4014:
                // return this.console.PPU.readRegister(address)
                break
            case uint16(address) == 0x4015:
                // return this.console.APU.readRegister(address)
                break
            case uint16(address) == 0x4016:
                // return this.console.Controller1.read()
                break
            case uint16(address) == 0x4017:
                // return this.console.Controller2.read()
                break
            case uint16(address) < 0x6000:
                // TODO: I/O registers
                break
            case uint16(address) >= 0x6000:
                // console.log("....", this.console.Mapper)
                return this.console.Mapper.read(address)
            default:
                console.error("unhandled cpu memory read at address: 0x%04X", address.x())
        }
        return byte(0)
    }

    write(address, value) {
        // console.log(address.x(), "<<<||")
        switch (true) {
            case uint16(address) < 0x2000:
                this.console.RAM[address % 0x0800] = value
                break
            case uint16(address) < 0x4000:
                // this.console.PPU.writeRegister(0x2000 + address % 8, value)
                break
            case uint16(address) < 0x4014:
                // this.console.APU.writeRegister(address, value)
                break
            case uint16(address) == 0x4014:
                // this.console.PPU.writeRegister(address, value)
                break
            case uint16(address) == 0x4015:
                // this.console.APU.writeRegister(address, value)
                break
            case uint16(address) == 0x4016:
                this.console.Controller1.write(value)
                this.console.Controller2.write(value)
                break
            case uint16(address) == 0x4017:
                this.console.APU.writeRegister(address, value)
                break
            case uint16(address) < 0x6000:
                // TODO: I/O registers
                break
            case uint16(address) >= 0x6000:
                this.console.Mapper.write(address, value)
                break
            default:
                console.error("unhandled cpu memory write at address: 0x%04X", address)
        }
    }
}

module.exports.PPUMemory = class PPUMemory {
    constructor(console) {
        this.console = console
    }
    read(adr) {
        const address = uint16(adr) % 0x4000
        switch (true) {
            case uint16(address) < 0x2000:
                return this.console.Mapper.read(address)
            case uint16(address) < 0x3F00:
                const mode = this.console.Cartridge.Mirror
                return this.console.PPU.nameTableData[MirrorAddress(mode, address) % 2048]
            case uint16(address) < 0x4000:
                return this.console.PPU.readPalette(address % 32)
            default:
                console.error("unhandled ppu memory read at address: 0x%04X", address)
        }
        return byte(0)
    }

    write(adr, value) {
        const address = uint16(adr) % 0x4000
        switch (true) {
            case uint16(address) < 0x2000:
                this.console.Mapper.write(address, byte(value))
                break
            case uint16(address) < 0x3F00:
                const mode = this.console.Cartridge.Mirror
                this.console.PPU.nameTableData[MirrorAddress(mode, address) % 2048] = byte(value)
                break
            case uint16(address) < 0x4000:
                this.console.PPU.writePalette(address % 32, byte(value))
                break
            default:
                console.error("unhandled ppu memory write at address: 0x%04X", address)
        }
    }
}