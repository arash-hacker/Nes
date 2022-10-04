module.exports.Image = class Image {
    constructor(w, h) {
        this.canvas = new Array(h).fill(new Array(w).fill({ r: 0, g: 0, b: 0, a: 0 }))
    }
    setPixelColor(x, y, c) {
        this.canvas[y][x] = c
    }
} 