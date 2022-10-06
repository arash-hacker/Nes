const { Cart } = require("./cart");
const { CPUFrequency, CPU } = require("./cpu");
const { PPU } = require("./ppu");
const { int } = require("./utils");

module.exports.Console = class Console {
    constructor(pth) {
        this.Cart = new Cart(pth)
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
        let cycles = 0;
        if (seconds < 1) {
            cycles = int(CPUFrequency * seconds)
        }
        // 0.013426181999999898 24029
        // 0.008557098000000707 15315
        // 0.0056410979999999 10096
        // 0.0036177659999996337 6474
        // 0.0020166050000005598 3609
        // 0.012141348999999302 21730
        // 0.006787201999999937 12147
        // 0.0035282620000005593 6314
        // 0.0027036179999999632 4838
        // 0.0018740619999997321 3354
        // 0.004066916000000198 7278
        // 0.002199045999999427 3935
        // 0.014117834000000329 25267
        // console.info("seconds", seconds, cycles)
        while (cycles > 0) {
            cycles -= this.step()
        }
    }
    Buffer() {
        return this.PPU.front.toBuffer()
    }
    saveAsPng(pth) {
        this.PPU.front.saveAsPng(pth)
    }

    BackgroundColor() {
        return Palette[this.PPU.readPalette(0) % 64]
    }

}