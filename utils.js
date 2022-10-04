module.exports.int = (v) => v
module.exports.byte = (v) => 0xff & v
module.exports.uint16 = (v) => 0xffff & v
module.exports.uint32 = (v) => 0xffff_ffff & v
// https://stackoverflow.com/a/9643650 JS doesn't support big numbers uint64
module.exports.uint64 = (v) => 0x000f_ffff_ffff_ffff & v