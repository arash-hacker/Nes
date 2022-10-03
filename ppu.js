const Jimp = require('jimp');
const { PPUMemory } = require('./mamory');
const { Palette } = require("./palette")
const { byte, uint16, int, uint32, uint64 } = require("./utils")
let ppuCounter = 0
module.exports.PPU = class PPU {
    constructor(console) {
        this.console = console // reference to parent object

        this.Cycle = 0     // 0-340
        this.ScanLine = 0    // 0-261, 0-239=visible, 240=post, 241-260=vblank, 261=pre
        this.Frame = uint64(0) // frame counter

        // storage variables
        this.paletteData = new Array(32).fill(0x00)
        this.nameTableData = Array(2048).fill(0x00)
        this.oamData = Array(256).fill(0x00)

        // PPU registers
        this.v = uint16(0) // current vram address (15 bit)
        this.t = uint16(0) // temporary vram address (15 bit)
        this.x = byte(0)   // fine x scroll (3 bit)
        this.w = byte(0)   // write toggle (1 bit)
        this.f = byte(0)   // even/odd frame flag (1 bit)

        this.register = byte(0)

        // NMI flags
        this.nmiOccurred = false
        this.nmiOutput = false
        this.nmiPrevious = false
        this.nmiDelay = byte(0)

        // background temporary variables
        this.nameTableByte = byte(0)
        this.attributeTableByte = byte(0)
        this.lowTileByte = byte(0)
        this.highTileByte = byte(0)
        this.tileData = uint64(0)

        // sprite temporary variables
        this.spriteCount = int(0)
        this.spritePatterns = Array(8).fill(uint32(0x0))
        this.spritePositions = Array(8).fill(byte(0x0))
        this.spritePriorities = Array(8).fill(byte(0x0))
        this.spriteIndexes = Array(8).fill(byte(0x0))

        // $2000 PPUCTRL
        this.flagNameTable = byte(0) // 0: $2000; 1: $2400; 2: $2800; 3: $2C00
        this.flagIncrement = byte(0) // 0: add 1; 1: add 32
        this.flagSpriteTable = byte(0) // 0: $0000; 1: $1000; ignored in 8x16 mode
        this.flagBackgroundTable = byte(0) // 0: $0000; 1: $1000
        this.flagSpriteSize = byte(0) // 0: 8x8; 1: 8x16
        this.flagMasterSlave = byte(0) // 0: read EXT; 1: write EXT

        // $2001 PPUMASK
        this.flagGrayscale = byte(0) // 0: color; 1: grayscale
        this.flagShowLeftBackground = byte(0) // 0: hide; 1: show
        this.flagShowLeftSprites = byte(0) // 0: hide; 1: show
        this.flagShowBackground = byte(0) // 0: hide; 1: show
        this.flagShowSprites = byte(0) // 0: hide; 1: show
        this.flagRedTint = byte(0) // 0: normal; 1: emphasized
        this.flagGreenTint = byte(0) // 0: normal; 1: emphasized
        this.flagBlueTint = byte(0) // 0: normal; 1: emphasized

        // $2002 PPUSTATUS
        this.flagSpriteZeroHit = byte(0)
        this.flagSpriteOverflow = byte(0)

        // $2003 OAMADDR
        this.oamAddress = byte(0)

        // $2007 PPUDATA
        this.bufferedData = byte(0) // for buffered reads

        this.Memory = new PPUMemory(console)
        // ppu:= PPU{ Memory: NewPPUMemory(console), console: console }


        this.front = null;
        this.back = null;
        this.Reset()
        return this
    }


    async Reset() {
        this.front = await Jimp.create(256, 240);//image.NewRGBA(image.Rect(0, 0, 256, 240))////<<<<<<<<
        this.back = await Jimp.create(256, 240);//image.NewRGBA(image.Rect(0, 0, 256, 240))/////<<<<<<<<
        this.Cycle = 340
        this.ScanLine = 240
        this.Frame = 0
        this.writeControl(0)
        this.writeMask(0)
        this.writeOAMAddress(0)
    }

    readPalette(adr) {
        const address = uint16(adr)
        if (address >= 16 && address % 4 == 0) {
            address -= 16
        }
        return byte(this.paletteData[address])
    }

    writePalette(adr, val) {
        const address = uint16(adr)
        const value = byte(val)
        if (address >= 16 && address % 4 == 0) {
            address -= 16
        }
        this.paletteData[address] = value
    }

    readRegister(adr) {
        const address = uint16(adr)
        switch (address) {
            case 0x2002:
                return this.readStatus()
            case 0x2004:
                return this.readOAMData()
            case 0x2007:
                return this.readData()
        }
        return 0x0000
    }

    writeRegister(adr, val) {
        const address = uint16(adr)
        const value = byte(val)
        this.register = value
        switch (address) {
            case 0x2000:
                this.writeControl(value)
                break
            case 0x2001:
                this.writeMask(value)
                break
            case 0x2003:
                this.writeOAMAddress(value)
                break
            case 0x2004:
                this.writeOAMData(value)
                break
            case 0x2005:
                this.writeScroll(value)
                break
            case 0x2006:
                this.writeAddress(value)
                break
            case 0x2007:
                this.writeData(value)
                break
            case 0x4014:
                this.writeDMA(value)
                break
        }
    }

    // $2000: PPUCTRL
    writeControl(val) {
        const value = byte(val)
        this.flagNameTable = (value >> 0) & 3
        this.flagIncrement = (value >> 2) & 1
        this.flagSpriteTable = (value >> 3) & 1
        this.flagBackgroundTable = (value >> 4) & 1
        this.flagSpriteSize = (value >> 5) & 1
        this.flagMasterSlave = (value >> 6) & 1
        this.nmiOutput = (value >> 7) & 1 == 1
        this.nmiChange()
        // t: ....BA.. ........ = d: ......BA
        this.t = (this.t & 0xF3FF) | ((uint16(value) & 0x03) << 10)
    }

    // $2001: PPUMASK
    writeMask(val) {
        const value = byte(val)
        this.flagGrayscale = (value >> 0) & 1
        this.flagShowLeftBackground = (value >> 1) & 1
        this.flagShowLeftSprites = (value >> 2) & 1
        this.flagShowBackground = (value >> 3) & 1
        this.flagShowSprites = (value >> 4) & 1
        this.flagRedTint = (value >> 5) & 1
        this.flagGreenTint = (value >> 6) & 1
        this.flagBlueTint = (value >> 7) & 1
    }

    // $2002: PPUSTATUS
    readStatus() {
        let result = this.register & 0x1F
        result |= this.flagSpriteOverflow << 5
        result |= this.flagSpriteZeroHit << 6
        if (this.nmiOccurred) {
            result |= 1 << 7
        }
        this.nmiOccurred = false
        this.nmiChange()
        // w:                   = 0
        this.w = 0
        return byte(result)
    }

    // $2003: OAMADDR
    writeOAMAddress(value) {
        this.oamAddress = byte(value)
    }

    // $2004: OAMDATA (read)
    readOAMData() {
        let data = this.oamData[this.oamAddress]
        if ((this.oamAddress & 0x03) == 0x02) {
            data = data & 0xE3
        }
        return byte(data)
    }

    // $2004: OAMDATA (write)
    writeOAMData(value) {
        this.oamData[this.oamAddress] = byte(value)
        this.oamAddress++
    }

    // $2005: PPUSCROLL
    writeScroll(value) {
        if (this.w == 0) {
            // t: ........ ...HGFED = d: HGFED...
            // x:               CBA = d: .....CBA
            // w:                   = 1
            this.t = (this.t & 0xFFE0) | (uint16(value) >> 3)
            this.x = value & 0x07
            this.w = 1
        } else {
            // t: .CBA..HG FED..... = d: HGFEDCBA
            // w:                   = 0
            this.t = (this.t & 0x8FFF) | ((uint16(value) & 0x07) << 12)
            this.t = (this.t & 0xFC1F) | ((uint16(value) & 0xF8) << 2)
            this.w = 0
        }
    }

    // $2006: PPUADDR
    writeAddress(value) {
        if (this.w == 0) {
            // t: ..FEDCBA ........ = d: ..FEDCBA
            // t: .X...... ........ = 0
            // w:                   = 1
            this.t = (this.t & 0x80FF) | ((uint16(value) & 0x3F) << 8)
            this.w = 1
        } else {
            // t: ........ HGFEDCBA = d: HGFEDCBA
            // v                    = t
            // w:                   = 0
            this.t = (this.t & 0xFF00) | uint16(value)
            this.v = this.t
            this.w = 0
        }
    }

    // $2007: PPUDATA (read)
    readData() {
        const value = this.Read(this.v)
        // emulate buffered reads
        if (this.v % 0x4000 < 0x3F00) {
            const buffered = this.bufferedData
            this.bufferedData = value
            value = buffered
        } else {
            this.bufferedData = this.Read(this.v - 0x1000)
        }
        // increment address
        if (this.flagIncrement == 0) {
            this.v += 1
        } else {
            this.v += 32
        }
        return byte(value)
    }

    // $2007: PPUDATA (write)
    writeData(value) {
        this.Memory.write(this.v, byte(value))
        if (this.flagIncrement == 0) {
            this.v += 1
        } else {
            this.v += 32
        }
    }

    // $4014: OAMDMA
    writeDMA(value) {
        const cpu = this.console.CPU
        let address = uint16(value) << 8
        for (let i = 0; i < 256; i++) {
            this.oamData[this.oamAddress] = cpu.read(address)
            this.oamAddress++
            address++
        }
        cpu.stall += 513
        if (cpu.Cycles % 2 == 1) {
            cpu.stall++
        }
    }

    // NTSC Timing Helper Functions

    incrementX() {
        // increment hori(v)
        // if coarse X == 31
        if (this.v & 0x001F == 31) {
            // coarse X = 0
            this.v &= 0xFFE0
            // switch horizontal nametable
            this.v ^= 0x0400
        } else {
            // increment coarse X
            this.v++
        }
    }

    incrementY() {
        // increment vert(v)
        // if fine Y < 7
        if (this.v & 0x7000 != 0x7000) {
            // increment fine Y
            this.v += 0x1000
        } else {
            // fine Y = 0
            this.v &= 0x8FFF
            // let y = coarse Y
            let y = (this.v & 0x03E0) >> 5
            if (y == 29) {
                // coarse Y = 0
                y = 0
                // switch vertical nametable
                this.v ^= 0x0800
            } else if (y == 31) {
                // coarse Y = 0, nametable not switched
                y = 0
            } else {
                // increment coarse Y
                y++
            }
            // put coarse Y back into v
            this.v = (this.v & 0xFC1F) | (y << 5)
        }
    }

    copyX() {
        // hori(v) = hori(t)
        // v: .....F.. ...EDCBA = t: .....F.. ...EDCBA
        this.v = (this.v & 0xFBE0) | (this.t & 0x041F)
    }

    copyY() {
        // vert(v) = vert(t)
        // v: .IHGF.ED CBA..... = t: .IHGF.ED CBA.....
        this.v = (this.v & 0x841F) | (this.t & 0x7BE0)
    }

    nmiChange() {
        const nmi = this.nmiOutput && this.nmiOccurred
        if (nmi && !this.nmiPrevious) {
            // TODO: this fixes some games but the delay shouldn't have to be so
            // long, so the timings are off somewhere
            this.nmiDelay = 15
        }
        this.nmiPrevious = nmi
    }

    setVerticalBlank() {
        let [b, f] = [this.back, this.front]
        this.front = b
        this.back = f
        this.nmiOccurred = true
        this.nmiChange()
    }

    clearVerticalBlank() {
        this.nmiOccurred = false
        this.nmiChange()
    }

    fetchNameTableByte() {
        const v = this.v
        const address = 0x2000 | (v & 0x0FFF)
        this.nameTableByte = this.Read(address)
    }

    fetchAttributeTableByte() {
        const v = this.v
        const address = 0x23C0 | (v & 0x0C00) | ((v >> 4) & 0x38) | ((v >> 2) & 0x07)
        const shift = ((v >> 4) & 4) | (v & 2)
        this.attributeTableByte = ((this.Read(address) >> shift) & 3) << 2
    }

    fetchLowTileByte() {
        const fineY = (this.v >> 12) & 7
        const table = this.flagBackgroundTable
        const tile = this.nameTableByte
        const address = 0x1000 * uint16(table) + uint16(tile) * 16 + fineY
        this.lowTileByte = this.Read(address)
    }

    fetchHighTileByte() {
        const fineY = (this.v >> 12) & 7
        const table = this.flagBackgroundTable
        const tile = this.nameTableByte
        const address = 0x1000 * uint16(table) + uint16(tile) * 16 + fineY
        this.highTileByte = this.Read(address + 8)
    }

    storeTileData() {
        let data = uint32(0)
        for (let i = 0; i < 8; i++) {
            const a = this.attributeTableByte
            const p1 = (this.lowTileByte & 0x80) >> 7
            const p2 = (this.highTileByte & 0x80) >> 6
            this.lowTileByte <<= 1
            this.highTileByte <<= 1
            data <<= 4
            data |= uint32(a | p1 | p2)
        }
        this.tileData |= uint64(data)
    }

    fetchTileData() {
        return uint32(this.tileData >> 32)
    }

    backgroundPixel() {
        if (this.flagShowBackground == 0) {
            return byte(0)
        }
        const data = this.fetchTileData() >> ((7 - this.x) * 4)
        return byte(data & 0x0F)
    }

    spritePixel() { //<<<<<<<<
        if (this.flagShowSprites == 0) {
            return [byte(0), byte(0)]
        }
        for (let i = 0; i < this.spriteCount; i++) {
            let offset = (this.Cycle - 1) - int(this.spritePositions[i])
            if (offset < 0 || offset > 7) {
                continue
            }
            offset = 7 - offset
            let color = byte((this.spritePatterns[i] >> byte(offset * 4)) & 0x0F)
            if (color % 4 == 0) {
                continue
            }
            return [byte(i), byte(color)]
        }
        return [byte(0), byte(0)]
    }

    async renderPixel() {
        let x = this.Cycle - 1
        let y = this.ScanLine
        let background = this.backgroundPixel()
        let [i, sprite] = this.spritePixel()
        if (x < 8 && this.flagShowLeftBackground == 0) {
            background = 0
        }
        if (x < 8 && this.flagShowLeftSprites == 0) {
            sprite = 0
        }
        let b = background % 4 != 0
        let s = sprite % 4 != 0
        let color = byte(0)
        if (!b && !s) {
            color = 0
        } else if (!b && s) {
            color = sprite | 0x10
        } else if (b && !s) {
            color = background
        } else {
            if (this.spriteIndexes[i] == 0 && x < 255) {
                this.flagSpriteZeroHit = 1
            }
            if (this.spritePriorities[i] == 0) {
                color = sprite | 0x10
            } else {
                color = background
            }
        }
        const c = Palette[this.readPalette(uint16(color)) % 64]
        this.back.setPixelColor(c, x, y)
        this.back.write(__dirname + "./ppu-out/" + (++ppuCounter).toString(10).padStart(5) + ".png")
        //this.back.SetRGBA(x, y, c) // <<<<<<<<<<<<<
    }

    fetchSpritePattern(i, row) {
        let tile = this.oamData[i * 4 + 1]
        let attributes = this.oamData[i * 4 + 2]
        let address = uint16(0)
        if (this.flagSpriteSize == 0) {
            if (attributes & 0x80 == 0x80) {
                row = 7 - row
            }
            let table = this.flagSpriteTable
            address = 0x1000 * uint16(table) + uint16(tile) * 16 + uint16(row)
        } else {
            if (attributes & 0x80 == 0x80) {
                row = 15 - row
            }
            let table = tile & 1
            tile &= 0xFE
            if (row > 7) {
                tile++
                row -= 8
            }
            address = 0x1000 * uint16(table) + uint16(tile) * 16 + uint16(row)
        }
        let a = (attributes & 3) << 2
        let lowTileByte = this.Read(address)
        let highTileByte = this.Read(address + 8)
        let data = uint32(0)
        for (let i = 0; i < 8; i++) {
            let p1 = byte(0)
            let p2 = byte(0)
            if (attributes & 0x40 == 0x40) {
                p1 = (lowTileByte & 1) << 0
                p2 = (highTileByte & 1) << 1
                lowTileByte >>= 1
                highTileByte >>= 1
            } else {
                p1 = (lowTileByte & 0x80) >> 7
                p2 = (highTileByte & 0x80) >> 6
                lowTileByte <<= 1
                highTileByte <<= 1
            }
            data <<= 4
            data |= uint32(a | p1 | p2)
        }
        return uint32(data)
    }

    evaluateSprites() {
        let h = 0
        if (this.flagSpriteSize == 0) {
            h = 8
        } else {
            h = 16
        }
        let count = 0
        for (let i = 0; i < 64; i++) {
            let y = this.oamData[i * 4 + 0]
            let a = this.oamData[i * 4 + 2]
            let x = this.oamData[i * 4 + 3]
            let row = this.ScanLine - int(y)
            if (row < 0 || row >= h) {
                continue
            }
            if (count < 8) {
                this.spritePatterns[count] = this.fetchSpritePattern(i, row)
                this.spritePositions[count] = x
                this.spritePriorities[count] = (a >> 5) & 1
                this.spriteIndexes[count] = byte(i)
            }
            count++
        }
        if (count > 8) {
            count = 8
            this.flagSpriteOverflow = 1
        }
        this.spriteCount = count
    }

    // tick updates Cycle, ScanLine and Frame counters
    tick() {
        if (this.nmiDelay > 0) {
            this.nmiDelay--
            if (this.nmiDelay == 0 && this.nmiOutput && this.nmiOccurred) {
                this.console.CPU.triggerNMI()
            }
        }

        if (this.flagShowBackground != 0 || this.flagShowSprites != 0) {
            if (this.f == 1 && this.ScanLine == 261 && this.Cycle == 339) {
                this.Cycle = 0
                this.ScanLine = 0
                this.Frame++
                this.f ^= 1
                return
            }
        }
        this.Cycle++
        if (this.Cycle > 340) {
            this.Cycle = 0
            this.ScanLine++
            if (this.ScanLine > 261) {
                this.ScanLine = 0
                this.Frame++
                this.f ^= 1
            }
        }
    }

    // Step executes a single PPU cycle
    step() {
        this.tick()

        let renderingEnabled = this.flagShowBackground != 0 || this.flagShowSprites != 0
        let preLine = this.ScanLine == 261
        let visibleLine = this.ScanLine < 240
        //postLine :=  this.ScanLine == 240
        let renderLine = preLine || visibleLine
        let preFetchCycle = this.Cycle >= 321 && this.Cycle <= 336
        let visibleCycle = this.Cycle >= 1 && this.Cycle <= 256
        let fetchCycle = preFetchCycle || visibleCycle

        // background logic
        if (renderingEnabled) {
            if (visibleLine && visibleCycle) {
                this.renderPixel()
            }
            if (renderLine && fetchCycle) {
                this.tileData <<= 4
                switch (this.Cycle % 8) {
                    case 1:
                        this.fetchNameTableByte()
                        break
                    case 3:
                        this.fetchAttributeTableByte()
                        break
                    case 5:
                        this.fetchLowTileByte()
                        break
                    case 7:
                        this.fetchHighTileByte()
                        break
                    case 0:
                        this.storeTileData()
                        break
                }
            }
            if (preLine && this.Cycle >= 280 && this.Cycle <= 304) {
                this.copyY()
            }
            if (renderLine) {
                if (fetchCycle && this.Cycle % 8 == 0) {
                    this.incrementX()
                }
                if (this.Cycle == 256) {
                    this.incrementY()
                }
                if (this.Cycle == 257) {
                    this.copyX()
                }
            }
        }

        // sprite logic
        if (renderingEnabled) {
            if (this.Cycle == 257) {
                if (visibleLine) {
                    this.evaluateSprites()
                } else {
                    this.spriteCount = 0
                }
            }
        }

        // vblank logic
        if (this.ScanLine == 241 && this.Cycle == 1) {
            this.setVerticalBlank()
        }
        if (preLine && this.Cycle == 1) {
            this.clearVerticalBlank()
            this.flagSpriteZeroHit = 0
            this.flagSpriteOverflow = 0
        }
    }

}
