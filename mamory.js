const { byte } = require("./utils")

module.exports.CPUMemory = class CPUMemory {
    constructor(console) {
        this.console = console
    }
    read(address) {
        switch (uint16(address)) {
            case address < 0x2000:
                return this.console.RAM[address % 0x0800]
            case address < 0x4000:
                return this.console.PPU.readRegister(0x2000 + address % 8)
            case address == 0x4014:
                return this.console.PPU.readRegister(address)
            case address == 0x4015:
                return this.console.APU.readRegister(address)
            case address == 0x4016:
                return this.console.Controller1.read()
            case address == 0x4017:
                return this.console.Controller2.read()
            case address < 0x6000:
            // TODO: I/O registers
            case address >= 0x6000:
                return this.console.Mapper.read(address)
            default:
                console.error("unhandled cpu memory read at address: 0x%04X", address)
        }
        return byte(0)
    }

    write(address, value) {
        switch (uint16(address)) {
            case address < 0x2000:
                this.console.RAM[address % 0x0800] = value
            case address < 0x4000:
                this.console.PPU.writeRegister(0x2000 + address % 8, value)
            case address < 0x4014:
                this.console.APU.writeRegister(address, value)
            case address == 0x4014:
                this.console.PPU.writeRegister(address, value)
            case address == 0x4015:
                this.console.APU.writeRegister(address, value)
            case address == 0x4016:
                this.console.Controller1.write(value)
                this.console.Controller2.write(value)
            case address == 0x4017:
                this.console.APU.writeRegister(address, value)
            case address < 0x6000:
            // TODO: I/O registers
            case address >= 0x6000:
                this.console.Mapper.write(address, value)
            default:
                console.error("unhandled cpu memory write at address: 0x%04X", address)
        }
    }





}