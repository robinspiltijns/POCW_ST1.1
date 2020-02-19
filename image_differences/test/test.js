//https://mochajs.org
//chai tutorials
//...
//https://www.chaijs.com/api/assert/
//https://www.chaijs.com/api/bdd/
const fs = require('fs');

//import test frameworks
const describe = require("mocha").describe;
const it = require('mocha').it;

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

//don't remove these. They are used
const assert = chai.assert;
const should = chai.should();
const expect = chai.expect;

//import external function
const image_diff = require('../image_diff.js');
const image_xor = require('../image_xor.js');
const image_selection = require('../image_selection');
const main = require('../main.js');

let pi_2 =  1.5707963267948966;
let pi =    3.141592653589793;

describe('image_selection', function() {
    describe('pixel_matrix', function(){
        it('should return an array with 100 elements', async function(){
            return expect(image_selection.pixel_matrix('gt_ss.png')).to.eventually.have.lengthOf(100);
        });
        it('should return 4 green pixels', async function(){
            return ([{ red: 0, green: 255, blue: 0 },{ red: 0, green: 255, blue: 0 },
                { red: 0, green: 255, blue: 0 },{ red: 0, green: 255, blue: 0 }]).should.eql(
                    await image_selection.pixel_matrix('4G.png')
            )
        })
    });
    describe('neigbour', function(){
        it('should return 8 indexes around it', function(){
            return ([ 0, 1, 2, 5, 8, 7, 6, 3 ]).should.eql(image_selection.neighbour(4, 3, 3));
        });
        it('should return 5 indexes (0,1,4,6,7)', function(){
            return ([ 0, 1, 4, 7,6]).should.eql(image_selection.neighbour(3, 3, 3));
        })
        it('should return 5 indexes (1,2,4,7,8)', function(){
            return ([1, 2, 8,7,4]).should.eql(image_selection.neighbour(5, 3, 3));
        })
        it('should return 5 indexes (0,2,3,4,5)', function(){
            return ([2,5,4,3,0]).should.eql(image_selection.neighbour(1, 3, 3));
        })
        it('should return 5 indexes (3,4,5,6,8)', function(){
            return ([3,4,5,8,6]).should.eql(image_selection.neighbour(7, 3, 3));
        })
        it('should return 3 indexes (1,4,3)', function(){
            return ([1,4,3]).should.eql(image_selection.neighbour(0, 3, 3));
        })
        it('should return 3 indexes (5,4,1)', function(){
            return ([5,4,1]).should.eql(image_selection.neighbour(2, 3, 3));
        })
        it('should return 3 indexes (4,5,7)', function(){
            return ([4,5,7]).should.eql(image_selection.neighbour(8, 3, 3));
        })
        it( 'should return 3 indexes (3,4,7)', function(){
            return ([3,4,7]).should.eql(image_selection.neighbour(6, 3, 3));
        })
    })

    describe('Region growing', function () {
        //rt_s, gt_s and bt_s are red, green and blue triangle with width 200 and height 110, thus 11000 pixels large
        //basic region growing tests: only 2 colors, white and seedling
        it('should return an array with 11000 elements', function () {
            return expect(image_selection.region_grow('rt_s.png', {
                red: 255,
                green: 0,
                blue: 0
            })).to.eventually.have.lengthOf(11000)
        });
        it('should return an array with 11000 elements', function () {
            return expect(image_selection.region_grow('gt_s.png', {
                red: 0,
                green: 255,
                blue: 0
            })).to.eventually.have.lengthOf(11000)
        });
        it('should return an array with 11000 elements', function () {
            return expect(image_selection.region_grow('bt_s.png', {
                red: 0,
                green: 0,
                blue: 255
            })).to.eventually.have.lengthOf(11000)
        });
        it('should return an array with 11000 elements', function () {
            return expect(image_selection.region_grow('gt_ss.png', {
                red: 0,
                green: 255,
                blue: 0
            })).to.eventually.have.lengthOf(100)
        });
    });
});

describe('image_diff', function(){
    it('should return', function(){
        return image_diff.doImgDiff(['wt.png', 'rt.png'], false);
    });
});

describe('image_xor', function(){
    it('should return', function(){
        return image_xor.image_xor([0], [0], [0]);
    })
});

describe('main', function(){
    describe('find border corners', function(){
        //basic test on squares
        it('should return (0,0), (0,1), (1,0), (1,1) on 4-point square-region', function(){
            ([[0,0], [0,1], [1,1], [1,0]]).should.eql(main.find_border_corners(generate_rectangle(2,2)));
        });
        it('should return (0,0), (0,2), (2,0), (2,2) on 9-point square-region', function(){
            ([[0,0], [0,2], [2,2], [2,0]]).should.eql(main.find_border_corners(generate_rectangle(3,3)));
        });
        //basic tests on triangle
        it('should return (0,0), (0,2), (0,2), (2,0) on 6-point top left triangle-region', function(){
            ([[0,0], [0,2], [0,2], [2,0]]).should.eql(main.find_border_corners(generate_triangleTL(3, 3)));
        });
        it('should return (0,0), (0,1), (0,1), (1,0) 3-point top left triangle-region', function(){
            ([[0,0], [0,1], [0,1], [1,0] ]).should.eql(main.find_border_corners(generate_triangleTL(2,2)));
        });
        it('should return (0,0), (0,2), (0,2), (2,0) on 6-point top right triangle-region', function(){
            ([[0,0], [0,2], [2,2], [2,2]]).should.eql(main.find_border_corners(generate_triangleTR(3, 3)));
        });
        it('should return (0,0), (0,1), (0,1), (1,0) 3-point top right triangle-region', function(){
            ([[0,0], [0,1], [1,1], [1,1] ]).should.eql(main.find_border_corners(generate_triangleTR(2,2)));
        });
        it('should return (0,0), (0,2), (0,2), (2,0) on 6-point bottom left triangle-region', function(){
            ([[0,0], [0,0], [2,2], [2,0]]).should.eql(main.find_border_corners(generate_triangleBL(3, 3)));
        });
        it('should return (0,0), (0,1), (0,1), (1,0) 3-point bottom left triangle-region', function(){
           ([[0,0], [0,0], [1,1], [1,0] ]).should.eql(main.find_border_corners(generate_triangleBL(2,2)));
        });
        it('should return (0,0), (0,2), (0,2), (2,0) on 6-point bottom right triangle-region', function(){
            ([[2,0], [0,2], [2,2], [2,0]]).should.eql(main.find_border_corners(generate_triangleBR(3, 3)));
        });
        it('should return (0,0), (0,1), (0,1), (1,0) 3-point bottom right triangle-region', function(){
            ([[1,0], [0,1], [1,1], [1,0] ]).should.eql(main.find_border_corners(generate_triangleBR(2,2)));
        });
        //tests on large triangles
        it('large top left triangle-region', function(){
            ([[0,0], [0,10], [0,10], [10,0]]).should.eql(main.find_border_corners(generate_triangleTL(11, 11)));
        });
        it('large top right triangle-region', function(){
            ([[0,0], [0,10], [10,10], [10,10] ]).should.eql(main.find_border_corners(generate_triangleTR(11,11)));
        });
        it('large bottom left triangle-region', function(){
            ([[0,0], [0,0], [10,10], [10,0] ]).should.eql(main.find_border_corners(generate_triangleBL(11,11)));
        });
        it('large bottom right triangle-region', function(){
            ([[10,0], [0,10], [10,10], [10,0] ]).should.eql(main.find_border_corners(generate_triangleBR(11,11)));
        });
    });
    describe('find corners', function(){
        it('size 2 TL should return (0,0), (0,1), (1,1), (1,0), 1.57079632679', function(){
            ([[0,0], [0,1], [1,1], [1,0],pi_2]).should.eql(main.find_corners(generate_triangleTL(2,2)))
        });
        it('size 2 TR should return (0,1), (1,1), (1,0), (0,0), 0', function(){
            ([[0,1], [1,1], [1,0], [0,0],0]).should.eql(main.find_corners(generate_triangleTR(2,2)))
        });
        it('size 2 BL should return (0,1), (1,1), (1,0), (0,0), 0', function(){
            ([[1,0], [0,0], [0,1], [1,1],pi]).should.eql(main.find_corners(generate_triangleBL(2,2)))
        });
        it('size 2 BR should return (0,1), (1,1), (1,0), (0,0), 0', function(){
            ([[1,1], [1,0], [0,0], [0,1],pi_2]).should.eql(main.find_corners(generate_triangleBR(2,2)))
        });
        it('size 4 TL should return (0,0), (0,2), (2,2), (2,0), 1.57079632679', function(){
            ([[0,0], [0,3], [3,3], [3,0],pi_2]).should.eql(main.find_corners(generate_triangleTL(4,4)))
        });
        it('size 4 TR should return (0,1), (1,1), (1,0), (0,0), 0', function(){
            ([[0,3], [3,3], [3,0], [0,0],0]).should.eql(main.find_corners(generate_triangleTR(4,4)))
        });
        it('size 4 BL should return (0,1), (1,1), (1,0), (0,0), 0', function(){
            ([[3,0], [0,0], [0,3], [3,3],pi]).should.eql(main.find_corners(generate_triangleBL(4,4)))
        });
        it('size 4 BR should return (0,1), (1,1), (1,0), (0,0), 0', function(){
            ([[3,3], [3,0], [0,0], [0,3],pi_2]).should.eql(main.find_corners(generate_triangleBR(4,4)))
        });
    })
});



describe('combination tests', function(){
    //combination test of image_selection + find borders
    it('should return (0,0), (0,0), (110,200), (110, 0)', async function () {
        let val = await image_selection.region_grow('rt_s.png', {red: 255, green: 0, blue: 0});
        return ([[0, 0], [0, 0], [110, 200], [110, 0]]).should.eql(main.find_borders(val));
    });
    it('just see', async function(){
        let val = await main.scanScreen(['wt.png', 'rt.png'])
        return ([]).should.eql(val);
    })
})

 function generate_rectangle(size_x, size_y){
    let array = [];
    for(let y =0; y<size_y; y++){
        for(let x = 0; x<size_x; x++){
            array.push([y,x]);
        }
    }
    return array;
 }

//for all triangle functions: take size_x = size_y
function generate_triangleTL (size_x, size_y){
    let array = [];
    for(let y =0; y<size_y; y++){
        for(let x = 0; x<size_x; x++){
            array.push([y,x]);
        }
        size_x--;
    }
    return array;
}

function generate_triangleTR(size_x, size_y){
    let array = [];
    for(let x = size_x -1; x>=0; x--){
        for(let y = 0; y<size_y; y++){
            array.push([y,x]);
        }
        size_y--;
    }
    return array;
}

 function generate_triangleBL(size_x, size_y){
    let array = [];
    for(let y =size_y -1; y>=0; y--){
        for(let x = 0; x<size_x; x++){
            array.push([y,x]);
        }
        size_x--;
    }
    return array;
}

 function generate_triangleBR(size_x, size_y){
     let array = [];
     let i = 0;
     let x = size_x-1;
     for(let y = size_y-1; y >=0; y--){
         while(x>=i){
             array.push([y,x]);
             x--;
         }
         i++;
         x = size_x-1;
     }
    return array;
 }


