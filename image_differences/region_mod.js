const img_sel = require('./image_selection');
const sharp = require('sharp');
const image_diff = require('./image_diff');
const fs = require('fs');
const main = require('./main');

//region_change('../Api/image0.jpg', ['../Api/image1.jpg', '../Api/image2.jpg','../Api/image3.jpg', "../Api/image4.jpg", "../Api/image5.jpg"]);
//region_change('feedback/2screens/image0.jpg', ['feedback/2screens/image1.jpg', 'feedback/2screens/image2.jpg'])
//region_change('feedback/3screens/image0.jpg', ['feedback/3screens/image1.jpg', 'feedback/3screens/image2.jpg', 'feedback/3screens/image3.jpg'])
//region_change('feedback/3screens2/image0.jpg', ['feedback/3screens2/image1.jpg', 'feedback/3screens2/image2.jpg', 'feedback/3screens2/image3.jpg', 'feedback/3screens2/image4.jpg'])
//region_change('feedback/3screensVaag/image0.jpg', ['feedback/3screensVaag/image1.jpg', 'feedback/3screensVaag/image2.jpg', 'feedback/3screensVaag/image3.jpg'])
//region_change('feedback/4screens/image0.jpg', ['feedback/4screens/image1.jpg', 'feedback/4screens/image2.jpg', 'feedback/4screens/image3.jpg', 'feedback/4screens/image4.jpg'])
//region_change('feedback/5screens/image0.jpg', ['feedback/5screens/image1.jpg', 'feedback/5screens/image2.jpg', 'feedback/5screens/image3.jpg', 'feedback/5screens/image4.jpg', 'feedback/5screens/image5.jpg'])
//region_change('feedback/5screens2/image0.jpg', ['feedback/5screens2/image1.jpg', 'feedback/5screens2/image2.jpg', 'feedback/5screens2/image3.jpg', 'feedback/5screens2/image4.jpg', 'feedback/5screens2/image5.jpg'])
region_change('feedback/5screens3/image0.jpg', ['feedback/5screens3/image1.jpg', 'feedback/5screens3/image2.jpg', 'feedback/5screens3/image3.jpg', 'feedback/5screens3/image4.jpg', 'feedback/5screens3/image5.jpg'])

async function region_change(base_image, image) {
    let imgs = [];
    imgs.push(base_image);
    for(let j = 0; j<image.length; j++){
        imgs.push(image[j]);
    }
    const diff = await image_diff.doImgDiff(imgs, false);

    for(let i = 1; i <= image.length; i++) {
        const sharp_im = await sharp('diff-' + i + '.png');
        const data = await sharp_im
            .metadata()
            .then(meta => {
                return {
                    width: meta.width,
                    height: meta.height
                }
            });

        let [buffer, reg_res] = await Promise.all([sharp_im
            .raw()
            .toBuffer(), img_sel.region_grow('diff-'+ i + '.png', {red: 60, green: 60, blue: 60})
        ]);

        let corners = await main.find_corners(reg_res);
        let reg_work = []
            for (let i = 0; i < reg_res.length; i++) {
                reg_work[i] = ((reg_res[i][0] * data.width) + reg_res[i][1]) * 3;
            }


        console.log("reg_res:", reg_work);
        console.log(buffer);

        for (let j = 0; j < reg_work.length; j += 1) {
            let buff_index = reg_work[j];
            buffer[buff_index] = 204;
            buffer[buff_index + 1] = 8;
            buffer[buff_index + 2] = 218;
        }
        console.log("corners are " + corners)
        for (let k = 0; k < corners.length; k += 1) {
            console.log(corners[k]);
            let trans_corner = ((corners[k][0] * data.width) + corners[k][1]) * 3;
            //adjust the reach of k and or l to change the size of the corner squares
            for (let l = 0; l < 30; l += 3) {

                buffer[trans_corner + l ] = 20;
                buffer[trans_corner + 1 + l] = 218;
                buffer[trans_corner + 2 + l] = 215;

                for (let m = 0; m <10 ; m += 1) {

                    buffer[trans_corner + l +( m * 3 *data.width )] = 20;
                    buffer[trans_corner + 1 + l +( m * 3 * data.width )] = 218;
                    buffer[trans_corner + 2 + l + ( m * 3 *data.width )] = 215;
                }
            }
        }

        let output_meta = {raw: {width: data.width, height: data.height, channels: 3}};
        const result_prom = [];
        result_prom.push(sharp(buffer, output_meta).toFile("regionpink" + i + ".jpg"));
        const result = await Promise.all(result_prom);


        console.log(result);
    }

}
