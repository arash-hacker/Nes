const { Console } = require("./console");

let c = new Console()
let i = 0;
while (i < 350) {
    c.step()
    i++
}
