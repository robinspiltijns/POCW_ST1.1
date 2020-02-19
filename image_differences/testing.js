//this folder is for manual testing of algorithms defined in the other files
//uncomment the let ... = function() to run a test

const base64Img = require('base64-img');

const im_sel = require('./image_selection');
const main = require('./main');
const image_diff = require('./image_diff');

//let val = execute();

async function execute() {
    let bres = await image_diff.doImgDiff(['images/wt.png', 'images/rt.png'], false);
   // console.log("bres: ", bres);
    let ares = await im_sel.pixel_matrix('diff-'+ 1 +'.png');
    //console.log("ares:", ares);
    let res = await im_sel.region_grow('images/gt_ss.png', {red: 0, green: 255, blue: 0}).catch(console.error);
 //   console.log("res:", res);
}

let value;
//tests on server output
//tests('../Api/image0.jpg', ['../Api/image1.jpg', '../Api/image2.jpg', '../Api/image3.jpg'], 'jpg');
//tests('feedback/2screens/image0.jpg', ['feedback/2screens/image1.jpg', 'feedback/2screens/image2.jpg'])
//tests('feedback/3screens/image0.jpg', ['feedback/3screens/image1.jpg', 'feedback/3screens/image2.jpg', 'feedback/3screens/image3.jpg'])
//tests('feedback/3screens2/image0.jpg', ['feedback/3screens2/image1.jpg', 'feedback/3screens2/image2.jpg', 'feedback/3screens2/image3.jpg', 'feedback/3screens2/image4.jpg'])
//tests('feedback/3screensVaag/image0.jpg', ['feedback/3screensVaag/image1.jpg', 'feedback/3screensVaag/image2.jpg', 'feedback/3screensVaag/image3.jpg']);
//tests('feedback/4screens/image0.jpg', ['feedback/4screens/image1.jpg', 'feedback/4screens/image2.jpg', 'feedback/4screens/image3.jpg', 'feedback/4screens/image4.jpg']);
//tests('feedback/5screens/image0.jpg', ['feedback/5screens/image1.jpg', 'feedback/5screens/image2.jpg', 'feedback/5screens/image3.jpg', 'feedback/5screens/image4.jpg', 'feedback/5screens/image5.jpg'])
//tests('feedback/5screens2/image0.jpg', ['feedback/5screens2/image1.jpg', 'feedback/5screens2/image2.jpg', 'feedback/5screens2/image3.jpg', 'feedback/5screens2/image4.jpg', 'feedback/5screens2/image5.jpg'])
tests('feedback/5screens3/image0.jpg', ['feedback/5screens3/image1.jpg', 'feedback/5screens3/image2.jpg', 'feedback/5screens3/image3.jpg', 'feedback/5screens3/image4.jpg', 'feedback/5screens3/image5.jpg'])

//tests('feedback/5screens2/image0.jpg',['feedback/5screens2/image1.jpg'])

//real screen tests
//tests('images/blackbasic.jpg', ['images/black1.jpg'], 'jpg');
//tests('images/baseg.jpg', ['images/dgreen.jpg'], 'jpg')
//tests('images/base.jpg', ['images/green.jpg'], 'jpg')
//tests('images/basedr.jpg', ['images/dred1.jpg'], 'jpg')
//tests('images/baser.jpg', ['images/red1.jpg'], 'jpg')
//tests('images/base2.jpg', ['images/red2l.jpg', "images/red2r.jpg"], 'jpg')
//tests('images/base3.jpg', ['images/red3l.jpg', "images/red3m.jpg" ,"images/red3r.jpg"], 'jpg')

//paint tests
//tests('images/wt.png', ['images/gt.png'], 'jpg')
//tests('images/wt.png', ['images/test3.png'], 'png')
//tests('images/wt.jpg', ['images/rt.jpg'], 'jpg')
//tests('images/test.jpg', ['images/testo.jpg'], 'jpg')

//whiteImage is u foto van wit scherm, otherImage is fot met driehoek
async function tests(whiteImage, coloredImage, format) {
    let base = base64Img.base64Sync(whiteImage)
    let users = [];
    for(let i = 0; i<coloredImage.length; i++) {
        let colored = base64Img.base64Sync(coloredImage[i]);
         users.push({id: i, img: colored})
    }
    value = await main.scanScreen(base, users);
   // console.log("end result: ", value)
}

//test_region();
async function test_region() {
    let a = await im_sel.region_grow('images/dred1.jpg', {red: 255, green: 0, blue: 0}).then( console.log("first"));
    let b = await main.find_border_corners(a);
    console.log(b);
}
