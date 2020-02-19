// The following function should actually be in some separate file...
/**
 * Calculate some pixel based difference between the input arrays-of-integers.
 *
 * @param {Buffer} buff1 Input buffer 1.
 * @param {Buffer} buff2 Input buffer 2.
 * @param {Buffer} buff3 Output buffer.
 *
 * @pre buff1.length == buff2.length == buff3.length
 *
 * @note All arguments are allowed to alias each other since we never reuse data in the
 * for loop below.
 *
 * @see https://nodejs.org/api/buffer.html
 */

const assert = require('assert');  // asserting pre-conditions
let convert = {};

convert.image_xor =  function (buff1, buff2, buff3) {
    console.log(buff1);
    console.log(buff2);
    assert(buff1.length === buff2.length);
    assert(buff1.length === buff3.length);

    for (let i = 0; i < buff1.length; i++) {
        // note: the following is working on Uint8 types (8-bit unsigned integers)
        //buff3[i] = (buff1[i] ^ buff2[i]) * (buff1[i] + buff2[i]) // do something interesting...
        buff3[i] = buff1[i] - buff2[i];
        if(buff3[i] < 50){
            //buff3[i] = 0;
        }
    }
};


module.exports = convert;