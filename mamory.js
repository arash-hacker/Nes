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
    const table = Math.floor(address / 0x0400)
    const offset = address % 0x0400
    let m = uint16(0x2000 + (module.exports.MirrorLookup[byte(mode)][table] * 0x0400) + offset)
    console.log(":mmmm:", adr, address, table, offset, (module.exports.MirrorLookup[byte(mode)][table] * 0x0400), m)
    return m;
}

module.exports.CPUMemory = class CPUMemory {
    constructor(console) {
        this.console = console
    }

    read(address) {
        switch (true) {
            case uint16(address) < 0x2000:
                console.log(":11:", address)
                return byte(this.console.RAM[address % 0x0800])
            case uint16(address) < 0x4000:
                console.log(":22:", address)
                const m = this.console.PPU.readRegister(0x2000 + address % 8)
                console.log(":222:", m)
                // console.log(":222:", this.console.CPU.PC, this.console.CPU.SP, this.console.CPU.A, this.console.CPU.X, this.console.CPU.Y, this.console.CPU.C, this.console.CPU.Z, this.console.CPU.I, this.console.CPU.D, this.console.CPU.B, this.console.CPU.U, this.console.CPU.V, this.console.CPU.N)
                return byte(m)
                break
            case uint16(address) == 0x4014:
                console.log(":33:", address)
                return byte(this.console.PPU.readRegister(address))
                break
            case uint16(address) == 0x4015:
                console.log("::", address)
                // return this.console.APU.readRegister(address)
                break
            case uint16(address) == 0x4016:
                console.log("::", address)
                // return this.console.Controller1.read()
                break
            case uint16(address) == 0x4017:
                console.log("::", address)
                // return this.console.Controller2.read()
                break
            case uint16(address) < 0x6000:
                console.log("::", address)
                // TODO: I/O registers
                break
            case uint16(address) >= 0x6000:
                console.log(":44:", address)
                // console.log("....", this.console.Mapper)
                return byte(this.console.Mapper.read(address))
            default:
                console.error("unhandled cpu memory read at address: 0x%04X", address.x())
        }
        return byte(0)
    }

    write(address, val) {
        // console.log(address.x(), "<<<||")
        let value = byte(val)
        switch (true) {
            case uint16(address) < 0x2000:
                console.log(":55:", address)
                this.console.RAM[address % 0x0800] = value
                break
            case uint16(address) < 0x4000:
                console.log(":66:", address)
                this.console.PPU.writeRegister(0x2000 + address % 8, value)
                break
            case uint16(address) < 0x4014:
                console.log("::", address)
                // this.console.APU.writeRegister(address, value)
                break
            case uint16(address) == 0x4014:
                console.log(":77:", address)
                this.console.PPU.writeRegister(address, value)
                break
            case uint16(address) == 0x4015:
                console.log("::", address)
                // this.console.APU.writeRegister(address, value)
                break
            case uint16(address) == 0x4016:
                console.log("::", address)
                // this.console.Controller1.write(value)
                // this.console.Controller2.write(value)
                break
            case uint16(address) == 0x4017:
                console.log("::", address)
                // this.console.APU.writeRegister(address, value)
                break
            case uint16(address) < 0x6000:
                console.log("::", address)
                // TODO: I/O registers
                break
            case uint16(address) >= 0x6000:
                console.log(":999:", address)

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
                console.log(":m:", address)
                return byte(this.console.Mapper.read(address))
            case uint16(address) < 0x3F00:

                const mode = this.console.Cart.mirror
                let m = byte(this.console.PPU.nameTableData[MirrorAddress(mode, address) % 2048])
                console.log(":mm:", adr, address, mode, m, MirrorAddress(mode, address), MirrorAddress(mode, address) % 2048)
                return m
            case uint16(address) < 0x4000:
                console.log(":mmm:", address)

                return byte(this.console.PPU.readPalette(address % 32))
            default:
                console.error("unhandled ppu memory read at address: 0x%04X", address)
        }
        return byte(0)
    }

    write(adr, val) {
        const address = uint16(adr) % 0x4000
        let value = byte(val)
        switch (true) {
            case uint16(address) < 0x2000:
                console.log(":n:", address)
                this.console.Mapper.write(address, byte(value))
                break
            case uint16(address) < 0x3F00:
                console.log(":nn:", address)

                const mode = this.console.Cart.mirror
                this.console.PPU.nameTableData[MirrorAddress(mode, address) % 2048] = byte(value)
                break
            case uint16(address) < 0x4000:
                console.log(":nnn:", address)
                this.console.PPU.writePalette(address % 32, byte(value))
                break
            default:
                console.error("unhandled ppu memory write at address: 0x%04X", address)
        }
    }
}