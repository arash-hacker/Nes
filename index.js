
console.log = function () { }
console.info = function () { }
const { Console } = require("./console");

let c = new Console()
if (c.Cart.battery != 0) {
    // TODO
    process.exit(1)
    // cartridge.SRAM = readSRAM(sramPath(view.hash))
}
while (true) {
    c.step()
    // c.Buffer() // get picture of ppu and put in output stream(opengl/ canvas/ web/ terminal/ ...)
    c.saveAsPng("./ppu-out")
}
