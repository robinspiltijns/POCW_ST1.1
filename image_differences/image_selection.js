const fs = require('fs');
const sharp = require('sharp');
const argv = require('yargs').argv;

let convert = {};

//transforms an image into a iterable array of pixel objects for ease of use
// https://stackoverflow.com/questions/54847139/how-to-read-buffer-data-of-image-returned-by-sharp
convert.pixel_matrix = async function (img) {
    let rgb_val = [];
    const data = await sharp(img)
        .raw()
        .toBuffer()
        .then(matrix_rep => {
            let index = 0;
            while (index < matrix_rep.length) {
                let pixel = {
                    red: matrix_rep[index],
                    green: matrix_rep[index + 1],
                    blue: matrix_rep[index + 2]
                };

                rgb_val.push({
                    red: pixel.red,
                    green: pixel.green,
                    blue: pixel.blue
                });
                index = index + 3;
            }

        })
        .catch(e => {
            console.log(e);
        });
    return rgb_val;
};
/*
    ----------> x-axis
    |[0,0]|[0,1]|
    |[1,0]
    |
    |
    y
 */




convert.region_grow = async function (imag, seedling) {
//async function region_grow(imag, seedling){
    const seed = seedling;
    const values = await convert.pixel_matrix(imag)
        .then(console.log('here'));
    //console.log(values)
    const data = await sharp(imag)
        .metadata()
        .then(meta => {
            return {
                width: meta.width,
                height: meta.height
            }
        });
    let regions = [];
    let candidates = [];
    const cnd_treshold = 20;
    // selecting candidates for possible regions
    // based on pixel intensity
    for (let i = 0; i < values.length; i++) {
        if (Math.abs(values[i].red - seed.red) < cnd_treshold && Math.abs(values[i].green - seed.green) < cnd_treshold && Math.abs(values[i].blue - seed.blue) < cnd_treshold) {
            candidates.push(i);
            if (data.width % 2 == 0) {
                i = i + data.width / 2;
            } else {
                i = i + data.width / 2 + 0.5
            }
        }
    }
    //console.log(candidates)
    let visited = [];
    while (candidates.length !== 0) {
        let candidate_expandings = []; 
        //pop first element from array
        let k = candidates.shift();
        if (!(visited.includes(k))) {
            candidate_expandings.push(k);
            visited.push(k);
            let newregion = [];
            newregion.push([Math.floor(k / data.width), k % data.width]);
            while (candidate_expandings.length !== 0) {
               // console.log(candidate_expandings.length);
               let m = candidate_expandings.shift();
                //find neighbours
                let neighbours = convert.neighbour(m, data.width, data.height);
                let count = 0;
                for(let g = 0; g < neighbours.length; g++){
                    if (Math.abs(values[neighbours[g]].red - seed.red) < cnd_treshold && Math.abs(values[neighbours[g]].green - seed.green) < cnd_treshold
                        && Math.abs(values[neighbours[g]].blue - seed.blue) < cnd_treshold) {
                        count++;
                    }
                }
                //console.log(neighbours);
                //for every neighbour found, check if it has the right color, if yes, add it to candidates and to a region, if no, drop it.
                if(count > 2) {
                    for (let l = 0; l < neighbours.length; l++) {
                        //console.log(values[neighbours[l]])
                        if (Math.abs(values[neighbours[l]].red - seed.red) < cnd_treshold && Math.abs(values[neighbours[l]].green - seed.green) < cnd_treshold
                            && Math.abs(values[neighbours[l]].blue - seed.blue) < cnd_treshold && !(visited.includes(neighbours[l]))) {
                            visited.push(neighbours[l]);
                            candidate_expandings.push(neighbours[l]);
                            newregion.push([Math.floor(neighbours[l] / data.width), neighbours[l] % data.width]);

                        } else {
                            visited.push(neighbours[l]);
                        }
                    }
                }
            }
            regions.push(newregion);
        }
    }
    regions.push([]);
    //return the largest region found
    let maxRegion = 0;
    let maxLength = 0;
    for (let i = 0; i < regions.length; i++) {
        if (regions[i].length > maxLength) {
            maxRegion = i;
            maxLength = regions[i].length;
        }
    }
    return regions[maxRegion];
};


      //this function finds all the neighbours off a given index in an array of points.
      //order of adding: |0 |  1   |2 |
      //                 |7 |index |3 |
      //                 |6 |  5   |4 |
convert.neighbour = function (index, wide, height) {
    const size = wide * height;
    let neighb = [];

    //check if point not on first line
    if (index - wide >= 0) {
        //if point is not leftmost point
        if (index % wide !== 0) {
            //push point left above
            neighb.push(index - wide - 1);
        }
        //push point straight above
        neighb.push(index - wide);

        //if point is not rightmost point
        if (index % wide !== wide - 1) {
            // push point right above

            neighb.push(index - wide + 1);
        }
    }

    //if not rightmost point
    if (index % wide !== wide - 1) {
        //push right neighbour
        neighb.push(index + 1);
    }

    //check if point on last line
    if (index + wide < size) {
        //if not rightmost point
        if (index % wide !== wide - 1) {
            //push right under
            neighb.push(index + wide + 1)
        }
        //push straight under
        neighb.push(index + wide);

        //if not leftmost point
        if (index % wide !== 0) {
            //push left under
            neighb.push(index + wide - 1);
        }

    }
    //if not leftmost point
    if (index % wide !== 0) {
        //push left neighbour
        neighb.push(index - 1);
    }


    return neighb;
}

module.exports = convert;
