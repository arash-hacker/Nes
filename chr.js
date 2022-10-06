var fs = require('fs');
var path = require('path');
var rom = fs.readFileSync(path.join(__dirname, "./rom/mario.nes"));
let CHR = []

function createCHR(rom, CHR) {
    const Z = 16 + (16384 * rom[4])
    let i = 0
    let k = 0
    while (i < 8192 * rom[5]) {
        for (let j = 0; j < 8; j++) {
            let extracted1 = [...rom[Z + i + j + 0].toString(2).padStart(8, '0')]
            let extracted2 = [...rom[Z + i + j + 8].toString(2).padStart(8, '0')]

            let extracted3 = extracted1.map((char, index) => char + extracted2[index])
            extracted3.filter((char, index) => {
                if (char == '00') extracted3[index] = '⚫️'
                if (char == '10') extracted3[index] = '🤢'
                if (char == '01') extracted3[index] = '🔵'
                if (char == '11') extracted3[index] = '⚪️'
            })
            extracted3 = extracted3.join('')
            CHR[k + j] = extracted3
        }

        i = i + 16
        k = k + 8
    }
}
createCHR(rom, CHR)

function printCHR2(CHR) {
    for (let k = 0; k < CHR.length; k = k + 32 * 8) {
        for (let j = 0; j < 8; j++) {
            for (let i = 0; i < 32; i++) {
                if (i % 2 == 0) {
                    process.stdout.write(CHR[k + j + i * 8] + "  ");
                } else {
                    process.stdout.write(CHR[k + j + i * 8] + "  ");
                }
            }
            console.log()
        }
        console.log()
    }
}

console.log(CHR.length)
printCHR2(CHR)
