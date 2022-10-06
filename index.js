
console.log = function () { }
// console.info = function () { }
const { Console } = require("./console");
// if (c.Cart.battery != 0) {
//     // TODO battery for SRAM
//     process.exit(1)
//     // cartridge.SRAM = readSRAM(sramPath(view.hash))
// }
let c = new Console(process.argv[2])
let deltaMiliSeconds = 0
let lastTimeStampMilisecond = new Date().getTime()
while (true) {
    let currentTimeStamp = new Date().getTime()
    deltaMiliSeconds = (
        currentTimeStamp
        - lastTimeStampMilisecond
    ) / (1_000 * 25)// just for quick hack and speed up, multiple by X
    lastTimeStampMilisecond = currentTimeStamp
    c.stepSeconds(deltaMiliSeconds)
    c.Buffer() // get picture of ppu and put in output stream(opengl/ canvas/ web/ terminal/ ...)
    // c.saveAsPng("./ppu-out")
}
