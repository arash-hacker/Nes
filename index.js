const { Console } = require("./console");

let c = new Console()
console.log = function () { }
if (c.Cart.battery != 0) {
    // TODO
    console.info("battery")
    process.exit(1)
    // cartridge.SRAM = readSRAM(sramPath(view.hash))
}
let i = 0;
while (100) {
    c.step()
    i++
}
