const { Console } = require("./console");

let c = new Console()
let i = 0;
while (i < 3500) {
    c.step()
    i++
}
