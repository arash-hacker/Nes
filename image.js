const fs = require("fs")
const { createCanvas } = require("canvas")
let i = 0
const OFFSET = 1_000
module.exports.Image = class Image {
    constructor(w, h) {
        this.width = w
        this.height = h
        this.canvas = createCanvas(this.width, this.height);

        this.context = this.canvas.getContext("2d");
        this.context.fillStyle = "#000000ff";
        this.context.fillRect(0, 0, this.width, this.height);
    }
    setPixelColor(x, y, c) {
        this.context.fillStyle = "#" +
            (c.r).x(2) +
            (c.g).x(2) +
            (c.b).x(2) +
            (c.a).x(2);
        this.context.fillRect(x, y, 1, 1);
    }

    toBuffer() {
        return this.canvas.toBuffer("image/png")
    }

    saveAsPng(pth) {
        if (!fs.existsSync(pth)) {
            fs.mkdirSync(pth)
        }
        if ((i % OFFSET) == 0) {
            fs.writeFileSync(pth + "/" + (i).toString().padStart(16, "0") + ".png", this.canvas.toBuffer("image/png"));
        }
        ++i
    }
} 