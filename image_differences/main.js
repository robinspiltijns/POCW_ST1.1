
//https://www.npmjs.com/package/base64-img
const base64Img = require('base64-img');
const base64ToImage = require('base64-to-image');
const sharp = require('sharp');
const fs = require('fs')

const image_diff = require('./image_diff');
const image_selection = require('./image_selection')

let convert = {};

//users from the form: [{id:0, img: base64-string}, ...., {id: k, img: base-64-string}]
convert.scanScreen = async function (baseImage, users){
    let imgs = [];
    let result = [];
    let resultTest = [];
    let resultScaledTest = [];
    try {
        base64Img.imgSync(baseImage, '', ('image0'));
        if(fs.existsSync('image0.png')) {
            await convert.conversion_png_to_jpg('image0.png', 'image0.jpg')
            fs.unlinkSync('image0.png');
        }
        imgs.push('image0.jpg');

        for (let i = 0; i < users.length; i++) {
            let base = users[i].img;
            let filename = ('image' + (i+1) + '.png')
            base64Img.imgSync(base, '', ('image'+ (i+1)));
            if (fs.existsSync('image' + (i+1) + '.png')) {
                await convert.conversion_png_to_jpg('image' + (i + 1) + '.png', 'image' + (i + 1) + '.jpg')
                fs.unlinkSync('image' + (i+1) + '.png');
            }
            imgs.push('image' + (i+1) + '.jpg');
        }

        console.log("imgs:", imgs);
    }catch(e){
        console.log("error in conversion:", e);
    }

    //get images from first part, calculate image differences.
    try {
        let val = await image_diff.doImgDiff(imgs, false);
    }catch(e){
        console.log("error in doImgDIff:", e);
    }

    try {
        for (let i = 0; i < users.length; i++) {
            let array = await image_selection.region_grow(('diff-' + (i + 1) + '.png'), {
                red: 60,
                green: 60,
                blue: 60
            });
            console.log("region: ", array);

            let corners = convert.find_corners(array);
            console.log("corners: ", corners);

            const base_data = await sharp(imgs[0])
                .metadata()
                .then(meta => {
                    return {
                        width: meta.width,
                        height: meta.height
                    }
                });

            const current_data = await sharp(('diff-' + (i + 1) + '.png'))
                .metadata()
                .then(meta => {
                    return {
                        width: meta.width,
                        height: meta.height
                    }
                });

            console.log(base_data.width, base_data.height, current_data.width, current_data.height)
            let scaled = convert.scaling(base_data.width, base_data.height, current_data.width, current_data.height, corners);
            console.log("scaled corners: ", scaled);
            for(let k = 0; k < scaled.length; k++){
                resultScaledTest.push(scaled[k])
            }

            result.push({id: users[i].id, topLeft: scaled[0], topRight: scaled[1], bottomRight: scaled[2], bottomLeft: scaled[3], screenAngle: scaled[4]})
        }
    }catch(e) {
        console.log("error in algorithm:", e)
    }
    // for (let i = 0; i <= users.length; i++) {
    //     console.log(users.length, i)
    //     fs.unlinkSync('image' + (i) + '.jpg');
    //     if(i !== 0) {fs.unlinkSync('diff-' + (i) + '.png');}
    //
    // }
    console.log("all scaled test", resultScaledTest);
    return result;
};

//this method takes as input the dimensions of two images and returns the coordinates off the smaller one
// scaled to those of the bigger one
convert.scaling = function (orig_width, orig_height, scaled_width, scaled_height, points){
    for(let i = 0; i<points.length -1; i++){
        points[i][0] = Math.round(points[i][0] * (orig_height/scaled_height));
        points[i][1] = Math.round(points[i][1] * (orig_width/scaled_width));
    }
    return points;
};

//this method combines all methods below to find the four corners off the screen from the region returned by region growing
convert.find_corners = function (array){
    let border = convert.find_border_corners(array);
    console.log("real_border:", border);
    let tri_corners = convert.find_corners_triangle(border);
    console.log("tri_corners:", tri_corners);
    let sorted_corners = convert.find_rightAngle(tri_corners);
    console.log("sorted_corners:", sorted_corners);
    let four_corners = convert.find_fourth_point(sorted_corners);
    console.log("four:", four_corners);
    let angle = convert.find_angle(four_corners);
    console.log("angle:", angle);
    four_corners.push(angle);
    return four_corners;
};

convert.find_border_corners = function (array){
    let border1 = convert.find_border_corners_one_way_around(array);
    let border2 = convert.find_border_corners_other_way_around(array);
    console.log("border1:", border1);
    console.log("border2:", border2);
    let dist1 = 0;
    let dist2 = 0;
    for(let i = 0; i<border1.length; i++){
        if(i === border1.length - 1){
            dist1 = dist1 + convert.distance_between_2_points(border1[i], border1[0])
            dist2 = dist2 + convert.distance_between_2_points(border2[i], border2[0])
        } else {
            dist1 = dist1 + convert.distance_between_2_points(border1[i], border1[i + 1])
            dist2 = dist2 + convert.distance_between_2_points(border2[i], border2[i + 1])
        }
    }
    console.log(dist1, dist2)
    if(dist1 >= dist2){
        return border1;
    }else{
        return border2;
    }
};

convert.distance_between_2_points = function (point1, point2){
    let dist = Math.sqrt(Math.pow(point1[0] - point2[0], 2) + Math.pow(point1[1] - point2[1], 2));
    return dist
}


//find outermost points off region returned by region growing
convert.find_border_corners_one_way_around = function (array) {
    let TLPos = array[0];
    let TRPos = array[0];
    let BLPos = array[0];
    let BRPos = array[0];

    let TLprevious = [];
    let TRprevious = [];
    let BRprevious = [];
    let BLprevious = [];
    //top left position
    //loop over all coordinates and keep track of the outermost points
    for (let i = 1; i < array.length; i++) {
        // if (array[i][0]>=test[0] && array[i][1]<=test[1]) test = array[i];
        // else if (array[i][0]>test[0] && (array[i][0] - test[0]) > (array[i][1]-test[1])) test = array[i];
        // else if (array[i][1]<test[1] && (test[0]-array[i][0]) < (test[1]- array[i][1])) test = array[i];

        //if the coordinate has a lower x value(== lies more to the left) then top left, assign it to top left position
        if (array[i][1] < TLPos[1]) {
            TLprevious = TLPos;
            TLPos = [array[i][0], array[i][1]];
        }
        //if the coordinate has the same x-coo as top left, but a smaller y-coo(==same column but higher) , assign it to top left.
        if (array[i][1] === TLPos[1] && array[i][0] < TLPos[0]) {
            TLPos = [array[i][0], array[i][1]];
        }


        //top right position
        //if the coordinate has a lower y-value than top right(== lies higher), assign it to top right
        if (array[i][0] < TRPos[0]) {
            TRprevious = TRPos;
            TRPos = [array[i][0], array[i][1]];
        }
        //if the coordinate has the same y-coo as top right, but a higher x-coo(==same line, but more to the right)
        // , assign it to top left.
        if (array[i][0] === TRPos[0] && array[i][1] > TRPos[1]) {
            TRPos = [array[i][0], array[i][1]];
        }

        //bottom left position
        //if the coordinate has a higher y value(== lies lower) then bottom left, assign it to bottom left position
        if (array[i][0] > BLPos[0]) {
            BLprevious = BLPos;
            BLPos = [array[i][0], array[i][1]];
        }
        //if the coordinate has the same y-coo as bottom left, but a smaller x-coo(==same line but more to the left)
        // , assign it to bottom left.
        if (array[i][0] === BLPos[0] && array[i][1] < BLPos[1]) {
            BLPos = [array[i][0], array[i][1]];
        }

        //bottom right position
        //if the coordinate has a higher x-value than bottom right(== lies more to thee right), assign it to bottom right
        if (array[i][1] > BRPos[1]) {
            BRprevious = BRPos;
            BRPos = [array[i][0], array[i][1]];
        }
        //if the coordinate has the same x-coo as bottom right, but a higher y-coo(==same column, but lower)
        // , assign it to bottom right.
        if (array[i][1] === BRPos[1] && array[i][0] > BRPos[0]) {
            BRPos = [array[i][0], array[i][1]];
        }
    }
    console.log("TLprevious:", TLprevious);
    console.log("TRprevious:", TRprevious);
    console.log("BRprevious:", BRprevious);
    console.log("BLprevious:", BLprevious);
    if(TLprevious[0] < TLPos[0] ){
        TLPos = TLprevious;
    }
    if(TRprevious[1] > TRPos[1] ){
        TRPos = TRprevious;
    }
    if(BRprevious[0] > BRPos[0]){
        BRPos = BRprevious;
    }
    if(BLprevious[1] < BLPos[1]){
        BLPos = BLprevious;
    }

    return [TLPos, TRPos, BRPos, BLPos];
};

convert.find_border_corners_other_way_around = function (array){
    let TLPos = array[0];
    let TRPos = array[0];
    let BLPos = array[0];
    let BRPos = array[0];

    let TLprevious = [];
    let TRprevious = [];
    let BRprevious = [];
    let BLprevious = [];
    //top left position
    //loop over all coordinates and keep track of the outermost points
    for (let i = 1; i < array.length; i++) {
        // if (array[i][0]>=test[0] && array[i][1]<=test[1]) test = array[i];
        // else if (array[i][0]>test[0] && (array[i][0] - test[0]) > (array[i][1]-test[1])) test = array[i];
        // else if (array[i][1]<test[1] && (test[0]-array[i][0]) < (test[1]- array[i][1])) test = array[i];

        //if the coordinate has a lower x value(== lies more to the left) then top left, assign it to top left position
        if (array[i][1] < TLPos[1]) {
            TLprevious = TLPos;
            TLPos = [array[i][0], array[i][1]];
        }
        //if the coordinate has the same x-coo as top left, but a bigger y-coo(==same column but lower) , assign it to top left.
        if (array[i][1] === TLPos[1] && array[i][0] > TLPos[0]) {
            TLPos = [array[i][0], array[i][1]];
        }

        //top right position
        //if the coordinate has a lower y-value than top right(== lies higher), assign it to top right
        if (array[i][0] < TRPos[0]) {
            TRprevious = TRPos;
            TRPos = [array[i][0], array[i][1]];
        }
        //if the coordinate has the same y-coo as top right, but a lower x-coo(==same line, but more to the left)
        // , assign it to top left.
        if (array[i][0] === TRPos[0] && array[i][1] < TRPos[1]) {
            TRPos = [array[i][0], array[i][1]];
        }

        //bottom left position
        //if the coordinate has a higher y value(== lies lower) then bottom left, assign it to bottom left position
        if (array[i][0] > BLPos[0]) {
            BLprevious = BLPos;
            BLPos = [array[i][0], array[i][1]];
        }
        //if the coordinate has the same y-coo as bottom left, but a larger x-coo(==same line but more to the right)
        // , assign it to bottom left.
        if (array[i][0] === BLPos[0] && array[i][1] > BLPos[1]) {
            BLPos = [array[i][0], array[i][1]];
        }

        //bottom right position
        //if the coordinate has a higher x-value than bottom right(== lies more to thee right), assign it to bottom right
        if (array[i][1] > BRPos[1]) {
            BRprevious = BRPos;
            BRPos = [array[i][0], array[i][1]];
        }
        //if the coordinate has the same x-coo as bottom right, but a lower y-coo(==same column, but higher)
        // , assign it to bottom right.
        if (array[i][1] === BRPos[1] && array[i][0] < BRPos[0]) {
            BRPos = [array[i][0], array[i][1]];
        }
    }
    console.log("TLprevious:", TLprevious);
    console.log("TRprevious:", TRprevious);
    console.log("BRprevious:", BRprevious);
    console.log("BLprevious:", BLprevious);
    if(TLprevious[0] > TLPos[0] ){
        TLPos = TLprevious;
    }
    if(TRprevious[1] < TRPos[1] ){
        TRPos = TRprevious;
    }
    if(BRprevious[0] < BRPos[0]){
        BRPos = BRprevious;
    }
    if(BLprevious[1] > BLPos[1]){
        BLPos = BLprevious;
    }
    return [TLPos, TRPos, BRPos, BLPos];
};

//from four points calculated in find_border_corners, determine which are from the triangle
convert.find_corners_triangle = function (array) {
    let TLPos = array[0];
    let TRPos = array[1];
    let BRPos = array[2];
    let BLPos = array[3];

    let lengthTL_TR = Math.sqrt(Math.pow(TLPos[0] - TRPos[0], 2) + Math.pow(TLPos[1] - TRPos[1], 2));
    let lengthTR_BR = Math.sqrt(Math.pow(BRPos[0] - TRPos[0], 2) + Math.pow(BRPos[1] - TRPos[1], 2));
    let lengthBR_BL = Math.sqrt(Math.pow(BRPos[0] - BLPos[0], 2) + Math.pow(BRPos[1] - BLPos[1], 2));
    let lengthBL_TL = Math.sqrt(Math.pow(TLPos[0] - BLPos[0], 2) + Math.pow(TLPos[1] - BLPos[1], 2));

    let lengthTL_BR = Math.sqrt(Math.pow(TLPos[0] - BRPos[0], 2) + Math.pow(TLPos[1] - BRPos[1], 2));
    let lengthTR_BL = Math.sqrt(Math.pow(TRPos[0] - BLPos[0], 2) + Math.pow(TRPos[1] - BLPos[1], 2));

    console.log(lengthTL_TR, lengthBR_BL, lengthTR_BR, lengthBL_TL)

    if (lengthTL_TR < lengthTR_BR && lengthTL_TR < lengthBR_BL && lengthTL_TR < lengthBL_TL) {
        if(lengthBL_TL + lengthTL_BR > lengthTR_BR + lengthTR_BL) {
            return [BRPos, TLPos, BLPos]
        }else{
            return [BRPos, TRPos, BLPos]
        }

    } else if (lengthTR_BR < lengthBR_BL && lengthTR_BR < lengthBL_TL && lengthTR_BR < lengthTL_TR) {
        if(lengthTR_BL + lengthTL_TR > lengthTL_BR + lengthBR_BL) {
            return [TLPos, TRPos, BLPos]
        }else{
            return [TLPos, BRPos, BLPos]

        }

    } else if (lengthBR_BL < lengthBL_TL && lengthBR_BL < lengthTR_BR && lengthBR_BL < lengthTL_TR) {
        if(lengthTL_BR + lengthTR_BR > lengthBL_TL + lengthTR_BL){
            return [TLPos, TRPos, BRPos]
        } else{
            return [TLPos, TRPos, BLPos]
        }

    } else  if(lengthBL_TL < lengthBR_BL  && lengthBL_TL < lengthTR_BR && lengthBL_TL < lengthTL_TR){
        if(lengthBR_BL + lengthTR_BL> lengthTL_TR + lengthTL_BR) {
            return [TRPos, BRPos, BLPos]
        } else {
            return [TRPos, BRPos, TLPos]
        }
    } else{
        console.log("somethings fishy here")
        return [TRPos, BRPos, TLPos];

    }

};


/**
 * adhv de richtingscoefficcienten van de 3 verschillende rechten ggevormd door de 3 coordinaten berekenen we de rechte hoek.
 * dit gebeurt door te zien welke 2 rechten het meest loodrecht staan door gebruik van de eigenschap dat de vermenigvuldiging van
 * de rico's van die 2 rechten het dichtste bij -1 ligt.
 */
convert.find_rightAngle = function (array) {
    let point1 = array[0];
    let point2 = array[1];
    let point3 = array[2];

    let length1_2 = Math.sqrt(Math.pow(point1[0] - point2[0], 2) + Math.pow(point1[1] - point2[1], 2));
    let length2_3 = Math.sqrt(Math.pow(point3[0] - point2[0], 2) + Math.pow(point3[1] - point2[1], 2));
    let length3_1 = Math.sqrt(Math.pow(point1[0] - point3[0], 2) + Math.pow(point1[1] - point3[1], 2));



    let rightAngle;
    let sideAngle1;
    let sideAngle2;

    // let rico1_2;
    // let rico2_3;
    // let rico3_1;
    //
    // //if, else added to deal with dividing by zero and zero*inf = NaN
    // if(point1[1] === point2[1]) {
    //     rico1_2 = 10000
    // }else{
    //     rico1_2 = (point1[0] - point2[0]) / (point1[1] - point2[1]);
    //     if(rico1_2 === 0){
    //         rico1_2 = -0.0001;
    //     }
    // }
    // if(point2[1] === point3[1]) {
    //     rico2_3 = 10000
    // } else{
    //     rico2_3 = (point2[0] - point3[0]) / (point2[1] - point3[1]);
    //     if(rico2_3 === 0){
    //         rico2_3 = -0.0001;
    //     }
    // }
    // if(point3[1] === point1[1]) {
    //     rico3_1 = 10000
    // } else{
    //     rico3_1 = (point3[0] - point1[0]) / (point3[1] - point1[1]);
    //     if(rico3_1 === 0){
    //         rico3_1 = -0.0001;
    //     }
    // }
    // console.log(rico1_2, rico2_3, rico3_1)
    //
    // let abs1 = Math.abs(rico3_1 * rico1_2 + 1);
    // let abs2 = Math.abs(rico1_2 * rico2_3 + 1);
    // let abs3 = Math.abs(rico2_3 * rico3_1 + 1);
    // console.log(abs1, abs2, abs3)

    if (length2_3>length1_2 && length2_3>length3_1) {
        rightAngle = point1;
        if (point2[0] > point3[0]) {
            sideAngle1 = point2;
            sideAngle2 = point3;
        } else {
            sideAngle1 = point3;
            sideAngle2 = point2;
        }
    } else if (length3_1>length2_3 && length3_1>length1_2) {
        rightAngle = point2;
        if (point1[0] > point3[0]) {
            sideAngle1 = point1;
            sideAngle2 = point3;
        } else {
            sideAngle1 = point3;
            sideAngle2 = point1;
        }
    } else if (length1_2>length3_1 && length1_2>length2_3){
        rightAngle = point3;
        if (point2[0] > point1[0]) {
            sideAngle1 = point2;
            sideAngle2 = point1;
        } else {
            sideAngle1 = point1;
            sideAngle2 = point2;
        }
    } else {
        //take new photo
        console.log("take new photo")
    }
    return [rightAngle, sideAngle1, sideAngle2];
};

// let center;
// let corner1;
// let corner2;
// let corner3;
// let corner4;
//
// if (Math.round(side1)===Math.round(side2)) {
//     center = point3;
//     corner1 = point1;
//     corner2 = point2;
// }
// else if (Math.round(side2)===Math.round(side3)) {
//     center = point1;
//     corner1 = point2;
//     corner2 = point3;
// }
// else if (Math.round(side1)===Math.round(side3)) {
//     center = point2;
//     corner1 = point1;
//     corner2 = point3;
// }
//
// corner3 = [point1[0]-2*(point1[0]-center[0]),point1[1]-2*(point1[1]-center[1])];
// corner4 = [point2[0]-2*(point2[0]-center[0]),point2[1]-2*(point2[1]-center[1])];


// TODO hierna door de kleur van het kwadrant nnaast de hoekpunten bepalen welk hoekpunt welk is maar ik weet ni ggoed hoe je met die kleuren werkt enzo
//



// } else {
//     let ricoTRBR = (point1[0] - point2[0]) / (point1[1] - point2[1]);
//     let ricoBRBL = (point2[0] - point3[0]) / (point2[1] - point3[1]);
//     let ricoBLTL = (point3[0] - point4[0]) / (point3[1] - point4[1]);
//     let ricoTLTR = (point4[0] - point1[0]) / (point4[1] - point1[1]);
//
//     if (ricoTRBR === -1 / ricoBRBL) {
//         rightAngle = point2;
//         sideAngle1 = point1;
//         sideAngle2 = point3;
//     } else if (ricoBRBL === -1 / ricoBLTL) {
//         rightAngle = point3;
//         sideAngle1 = point2;
//         sideAngle2 = point4;
//     } else if (ricoBLTL === -1 / ricoTLTR) {
//         rightAngle = point4;
//         sideAngle1 = point3;
//         sideAngle2 = point1;
//     } else {
//         rightAngle = point1;
//         sideAngle1 = point4;
//         sideAngle2 = point2;
//     }
// }

convert.find_fourth_point = function (array) {
    console.log("3 points", array)
    let rightAngle = array[0];
    let sideAngle1 = array[1];
    let sideAngle2 = array[2];

    console.log(sideAngle1, sideAngle2);
    let TLPos;
    let TRPos;
    let BRPos;
    let BLPos;

    TLPos = rightAngle;
    console.log(rightAngle);
    //dit eerste deel bepaalt hoe sideangle 1 en 2 gepositioneerd staan tov rightangle
    if (TLPos[0] < sideAngle1[0] && TLPos[0] < sideAngle2[0]) {
        if (sideAngle1[1] > sideAngle2[1]) {
            TRPos = sideAngle1;
            BLPos = sideAngle2;
        } else {
            TRPos = sideAngle2;
            BLPos = sideAngle1;
        }
    } else if (TLPos[0] > sideAngle1[0] && TLPos[0] > sideAngle2[0]) {
        if (sideAngle1[1] < sideAngle2[1]) {
            TRPos = sideAngle1;
            BLPos = sideAngle2;
        } else {
            TRPos = sideAngle2;
            BLPos = sideAngle1;
        }
    } else if (TLPos[1] > sideAngle1[1] && TLPos[1] > sideAngle2[1]) {
        if (sideAngle1[0] > sideAngle2[0]) {
            TRPos = sideAngle1;
            BLPos = sideAngle2;
        } else {
            TRPos = sideAngle2;
            BLPos = sideAngle1;
        }
    } else if (TLPos[1] < sideAngle1[1] && TLPos[1] < sideAngle2[1]) {
        if (sideAngle1[0] < sideAngle2[0]) {
            TRPos = sideAngle1;
            BLPos = sideAngle2;
        } else {
            TRPos = sideAngle2;
            BLPos = sideAngle1;
        }
        // volledig horizontaal of verticale positie  check foto


    } else if (TLPos[1] === sideAngle1[1]) {
        if (TLPos[1] < sideAngle2[1]) {
            TRPos = sideAngle2;
            BLPos = sideAngle1;
        } else {
            TRPos = sideAngle1;
            BLPos = sideAngle2;
        }

    } else if (TLPos[1] === sideAngle2[1]) {
        if (TLPos[1] < sideAngle1[1]) {
            TRPos = sideAngle2;
            BLPos = sideAngle1;
        } else {
            TRPos = sideAngle1;
            BLPos = sideAngle2;
        }


    } else if (TLPos[0] === sideAngle1[0]) {
        if (TLPos[1]<sideAngle1[1]){
            TRPos = sideAngle2;
            BLPos = sideAngle1;
        }
        else {
            TRPos = sideAngle1;
            BLPos = sideAngle2;
        }
    } else if (TLPos[0] === sideAngle2[0]){
        if (TLPos[1] < sideAngle2[1]){
            TRPos = sideAngle2;
            BLPos = sideAngle1;
        }
        else {
            TRPos = sideAngle1;
            BLPos = sideAngle2;
        }
    } else{
        let mid_y = (sideAngle1[0] + sideAngle2[0])/2;
        let mid_x = (sideAngle1[1] + sideAngle2[0])/2;

        if(TLPos[0] < mid_y && TLPos[1] < mid_x){
            if (TLPos[1] < sideAngle2[1]){
                TRPos = sideAngle2;
                BLPos = sideAngle1;
            }
            else {
                TRPos = sideAngle1;
                BLPos = sideAngle2;
            }        }
        else if(TLPos[0] > mid_y && TLPos[1] < mid_x){
            if (TLPos[1] < sideAngle2[1]){
                BLPos = sideAngle2;
                TRPos = sideAngle1;
            }
            else {
                TRPos = sideAngle2;
                BLPos = sideAngle1;
            }
        }
        else if(TLPos[0] < mid_y && TLPos[1] > mid_x){
            if (TLPos[1] < sideAngle2[1]){
                TRPos = sideAngle2;
                BLPos = sideAngle1;
            }
            else {
                TRPos = sideAngle1;
                BLPos = sideAngle2;
            }
        }
        else if(TLPos[0] > mid_y && TLPos[1] > mid_x){
            if (TLPos[1] < sideAngle2[1]){
                TRPos = sideAngle1;
                BLPos = sideAngle2;
            }
            else {
                TRPos = sideAngle2;
                BLPos = sideAngle1;
            }
        }
    }


    //calculate coordinates of 4th point
    let xco;
    let yco;
    xco = sideAngle2[1] + (sideAngle1[1] - rightAngle[1]);
    yco = sideAngle2[0] + (sideAngle1[0] - rightAngle[0]);
    BRPos = [yco, xco];

    return [TLPos, TRPos, BRPos, BLPos];
};
// Calculate angle of the right side with the x-axis
convert.find_angle = function (array) {
    let angle;
    let TLPos = array[0];
    let TRPos = array[1];
    let BRPos = array[2];
    let BLPos = array[3];

    if (TRPos[0] < BRPos[0]) {
        // hoek ligt in vierde kwadrant
        if (TRPos[1] > BRPos[1]) {
            angle = Math.atan((BRPos[0] - TRPos[0]) / (TRPos[1] - BRPos[1])) - Math.PI/2 + 2* Math.PI;
        }
        // hoek ligt in eerste kwadrant
        else if (TRPos[1] < BRPos[1]) {
            angle = Math.PI / 2 + Math.atan((BRPos[1] - TRPos[1]) / (BRPos[0] - TRPos[0])) - Math.PI/2;
        }
        // Top right positie staat verticaal boven bottom right positie
        else {
            angle = 0.0;
        }
    } else if (TRPos[0] > BRPos[0]) {
        // hoek ligt in tweede kwadrant
        if (TRPos[1] < BRPos[1]) {
            angle = Math.PI/2 + Math.atan((TRPos[0] - BRPos[0]) / (BRPos[1] - TRPos[1]));
        }
        // hoek liggt in derde kwadrant
        else if (TRPos[1] > BRPos[1]) {
            angle = Math.PI + Math.atan((TRPos[1] - BRPos[1]) / (TRPos[0] - BRPos[0]));
        }
        // Top right positie staat verticaal onder bottom right positie
        else {
            angle = Math.PI;
        }
    } else {
        // Eigenlijke begin positie, maar spreekt wel beetje tegen met benaming hoekpunten maar ik vond het duidelijker
        // om de hoek te berekenen van de rechte die loodrecht van de onderkant van het scherm naar de bovenkant loopt.

        // Top right positie ligt horizontaal rechts naast bottom right positie
        if (TRPos[1] > BRPos[1]) angle = Math.PI*3/2;
        // Top right positie ligt horizontaal links naast bottom right positie
        else angle = Math.PI/2;
    }

    return angle;
};


//https://stackoverflow.com/questions/3115982/how-to-check-if-two-arrays-are-equal-with-javascript
function arraysEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;

    // If you don't care about the order of the elements inside
    // the array, you should sort both arrays here.
    // Please note that calling sort on an array will modify that array.
    // you might want to clone your array first.

    for (let i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

convert.conversion_png_to_jpg = async function (image, output){
    const data = await sharp(image)
        .jpeg({
            quality: 100,
            chromaSubsampling: '4:4:4'
        })
        .toFile(output)
}

module.exports = convert;

