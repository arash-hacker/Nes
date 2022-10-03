module.exports.int = (v) => v
module.exports.byte = (v) => 0xff & v
module.exports.uint16 = (v) => 0xffff & v
module.exports.uint32 = (v) => 0xffffffff & v
module.exports.uint64 = (v) => 0xffffffffffffffff & v