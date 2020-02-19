
let convert = {};

convert.flattening = function (buffer, width, height){
    for(let i = 0; i < buffer.length; i++){
        let sumr = buffer[i];
        let sumg = buffer[i+1];
        let sumb = buffer[i+2];
        let neighbours = convert.neighbour_buffer(i, width, height);
        for(let j = 0; j < neighbours.length; j++){
            sumr = sumr + buffer(neighbours(j));
            sumg = sumg + buffer(neighbours(j+1));
            sumb = sumb + buffer(neighbours(j+2));
        }
        buffer[i] = sumr/(neighbours.length+1);
        buffer[i+1] = sumg/(neighbours.length+1);
        buffer[i+2] = sumb/(neighbours.length+1);
    }
}



convert.neighbour_buffer = function (index, wide, height) {
    const size = 3*wide * height;
    let neighb = [];

    //check if point not on first line
    if (index - 3*wide >= 0) {
        //if point is not leftmost point
        if (index % (3*wide) !== 0) {
            //push point left above
            neighb.push(index - 3*wide - 3);
        }
        //push point straight above
        neighb.push(index - 3*wide);

        //if point is not rightmost point
        if (index % (3*wide) !== 3*wide - 3) {
            // push point right above

            neighb.push(index - 3*wide + 3);
        }
    }

    //if not rightmost point
    if (index % (3*wide) !== 3*wide - 3) {
        //push right neighbour
        neighb.push(index + 3);
    }

    //check if point on last line
    if (index + 3*wide < size) {
        //if not rightmost point
        if (index % (3*wide) !== 3*wide - 3) {
            //push right under
            neighb.push(index + 3*wide + 3)
        }
        //push straight under
        neighb.push(index + 3*wide);

        //if not leftmost point
        if (index % (3*wide) !== 0) {
            //push left under
            neighb.push(index + 3*wide - 3);
        }

    }
    //if not leftmost point
    if (index % (3*wide) !== 0) {
        //push left neighbour
        neighb.push(index - 3);
    }

    return neighb;
}

module.exports = convert;