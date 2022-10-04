const { Console } = require("./console");

let c = new Console()
let i = 0;
while (i < 4500) {
    c.step()
    i++
}
