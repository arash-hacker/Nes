const { Cart } = require("./cart");
const { CPUFrequency, CPU } = require("./cpu");
const { PPU } = require("./ppu");

module.exports.Console = class Console {
    constructor() {
        this.Cart = new Cart()
        this.Mapper = this.Cart.createMapper()
        this.CPU = new CPU(this);
        this.PPU = new PPU(this);
        this.APU = null;
        this.Controller1 = null
        this.Controller2 = null;
        this.RAM = new Array(2048).fill(0x00)
    }
    reset() {
        this.CPU.reset()
    }
    step() {
        const cpuCycles = this.CPU.step()
        const ppuCycles = cpuCycles * 3
        console.log(":ppuCycles:", cpuCycles, ppuCycles)
        for (let i = 0; i < ppuCycles; i++) {
            this.PPU.step()
            console.log("-----")
            this.Mapper.step()
        }
        // for (let i = 0; i < cpuCycles; i++) {
        //     console.APU.Step()
        // }
        return cpuCycles
    }
    stepFrame() {
        const cpuCycles = 0
        const frame = this.PPU.Frame
        while (frame == this.PPU.Frame) {
            cpuCycles += this.step()
        }
        return cpuCycles
    }

    stepSeconds(seconds) {
        const cycles = int(CPUFrequency * seconds)
        while (cycles > 0) {
            cycles -= this.step()
        }
    }
    Buffer() {
        return this.PPU.front
    }

    BackgroundColor() {
        return Palette[this.PPU.readPalette(0) % 64]
    }

}