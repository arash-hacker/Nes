const { int, uint16, byte } = require("./utils")

module.exports.Mapper0 = class Mapper0 {

    constructor(cart) {
        this.cart = cart
        this.prgBanks = cart.prg.length / 0x4000
        this.prgBank1 = 0
        this.prgBank2 = this.prgBanks - 1
    }
    step() {
    }
    read(adr) {
        // console.log(adr.x(), "<00+")
        const address = uint16(adr)
        let index = 0;
        switch (true) {
            case address < 0x2000:
                return byte(this.cart.chr[address])
            case address >= 0xC000:
                index = this.prgBank2 * 0x4000 + int(address - 0xC000)
                return byte(this.cart.prg[index])
            case address >= 0x8000:
                index = this.prgBank1 * 0x4000 + int(address - 0x8000)
                return byte(this.cart.prg[index])
            case address >= 0x6000:
                index = int(address) - 0x6000
                return byte(this.cart.sram[index])
            default:
                console.error("unhandled mapper2 read at address: 0x%04X" + address)
        }
        return byte(0)
    }

    write(adr, val) {
        console.log(adr.x(), "<00-")
        const value = byte(val)
        const address = uint16(adr)
        switch (true) {
            case address < 0x2000:
                this.cart.chr[address] = value
                break
            case address >= 0x8000:
                this.prgBank1 = int(value) % this.prgBanks
                break
            case address >= 0x6000:
                const index = int(address) - 0x6000
                this.cart.sram[index] = value
                break
            default:
                console.error("unhandled mapper2 write at address: 0x%04X" + address)
        }
    }
}