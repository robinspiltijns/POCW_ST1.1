const {createCanvas, loadImage} = require('canvas');
const helpers = require('./helpers'); // importing helper functions
let convert = {};

convert.resetCanvas = function (canvas) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = 1;
    canvas.height = 1;
};

convert.adjustCanvasToUsers = function (canvas, users) {
    const outerCorners = helpers.outerCorners(users);
    for (const user of users) {
        user.topRight[1] -= outerCorners.minX;
        user.topRight[0] -= outerCorners.minY;
        user.topLeft[1] -= outerCorners.minX;
        user.topLeft[0] -= outerCorners.minY;
        user.bottomRight[1] -= outerCorners.minX;
        user.bottomRight[0] -= outerCorners.minY;
        user.bottomLeft[1] -= outerCorners.minX;
        user.bottomLeft[0] -= outerCorners.minY;
    }
    canvas.width = outerCorners.maxX - outerCorners.minX;
    canvas.height = outerCorners.maxY - outerCorners.minY;
};

convert.scaleUsers = function (scale, users) {
    for (const user of users) {
        user.topRight[0] = Math.round(user.topRight[0] * scale);
        user.topRight[1] = Math.round(user.topRight[1] * scale);
        user.topLeft[0] = Math.round(user.topLeft[0] * scale);
        user.topLeft[1] = Math.round(user.topLeft[1] * scale);
        user.bottomRight[0] = Math.round(user.bottomRight[0] * scale);
        user.bottomRight[1] = Math.round(user.bottomRight[1] * scale);
        user.bottomLeft[0] = Math.round(user.bottomLeft[0] * scale);
        user.bottomLeft[1] = Math.round(user.bottomLeft[1] * scale);
    }
};

convert.prepareCanvasForTriangulation = function (canvas, users) {
    //premise: pixels in canvas >= pixels in browser but as close as possible
    let relativelyLargestCssPixel;
    for (const user of users) { //finding the least pixel dense region of the canvas
        let userDimensionsInCanvas = helpers.getDimensions(user)[0]; //VOORLOPIG ENKEL BREEDTE VAN PIXEL: ASSUMPTIE PIXELS ZIJN ALTIJD VIERKANT IN HET VLAK
        let userBrowserDimensions = user.browserDimensions[0];
        let userRelativePixelSize = userBrowserDimensions / userDimensionsInCanvas; //How many browserpixels fit in a canvas pixel
        if (!relativelyLargestCssPixel || userRelativePixelSize > relativelyLargestCssPixel) {
            relativelyLargestCssPixel = userRelativePixelSize;
        }
    }
    if (relativelyLargestCssPixel) { //adjusting the rectangles representing the screens so that the least pixel dense region determines the amount of pixels in the canvas
        let scale = Math.round(relativelyLargestCssPixel);
        scale =10;
        convert.scaleUsers(scale, users);
        convert.adjustCanvasToUsers(canvas, users);
    }
    helpers.triangulate(users); //Triangulates the users
    convert.drawTriangulation(canvas, users); //Draws the newly triangulated users on the main canvas
};

convert.prepareCanvasForImageDisplay = function (canvas, users, image) {

    const imageWidth = image.width;
    const imageHeight = image.height;
    convert.adjustCanvasToUsers(canvas, users);
    let canvasWidth = canvas.width;
    let canvasHeight = canvas.height;
    const widthScale = imageWidth / canvasWidth;
    const heightScale = imageHeight / canvasHeight;
    if (widthScale >= heightScale) {
        convert.scaleUsers(heightScale, users);
    } else {
        convert.scaleUsers(widthScale, users);
    }
    convert.adjustCanvasToUsers(canvas, users);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);
};

convert.drawScreens = function (canvas, users) {
    const lineThickness = Math.round(1 / 500 * Math.max(canvas.width, canvas.height));
    const ctx = canvas.getContext('2d');
    let iterator;
    for (const user of users) {
        ctx.beginPath();
        ctx.strokeStyle = 'cyan';
        ctx.lineWidth = lineThickness;
        ctx.moveTo(user.topRight[1], user.topRight[0]);
        ctx.lineTo(user.topLeft[1], user.topLeft[0]);
        ctx.lineTo(user.bottomLeft[1], user.bottomLeft[0]);
        ctx.lineTo(user.bottomRight[1], user.bottomRight[0]);
        ctx.closePath();
        ctx.stroke();
    }
};

convert.drawTriangulation = function (canvas, users) {
    const ctx = canvas.getContext('2d');
    const lineThickness = Math.round(1 / 500 * Math.max(canvas.width, canvas.height));
    for (const user of users) {
        const midPoint = user.midPoint;
        ctx.beginPath();
        ctx.textAlign = "center";
        ctx.font = "20px Arial";
        ctx.fillStyle = 'black';
        ctx.fillText(user.id, user.midPoint[1], user.midPoint[0] - 10); // assigning user_id to midpoint
        ctx.beginPath();
        ctx.fillStyle = "blue";
        ctx.arc(midPoint[1], midPoint[0], 5, 0, 2 * Math.PI); // drawing the midpoint
        ctx.fill();
        for (const adjacentUser of user.adjacentUsers) {
            const adjacentMidPoint = adjacentUser.midPoint;
            ctx.beginPath();
            ctx.strokeStyle = 'purple';
            ctx.lineWidth = lineThickness;
            ctx.moveTo(midPoint[1], midPoint[0]);
            ctx.lineTo(adjacentMidPoint[1], adjacentMidPoint[0]);
            ctx.stroke();
        }
    }
};

convert.getEncapsulatingSquare = function (user) { //Creates a square that can contain the userscreen no matter that the orientation is
    const outerCornersOfEncapsulatingRectangle = helpers.outerCorners([user]);
    const widthOfEncapsulatingRectangle = outerCornersOfEncapsulatingRectangle.maxX - outerCornersOfEncapsulatingRectangle.minX;
    const heightOfEncapsulatingRectangle = outerCornersOfEncapsulatingRectangle.maxY - outerCornersOfEncapsulatingRectangle.minY;
    const squareSide = Math.max(widthOfEncapsulatingRectangle, heightOfEncapsulatingRectangle);
    const midPointX = outerCornersOfEncapsulatingRectangle.minX + widthOfEncapsulatingRectangle / 2;
    const topLeftX = midPointX - squareSide / 2;
    const midPointY = outerCornersOfEncapsulatingRectangle.minY + heightOfEncapsulatingRectangle / 2;
    const topLeftY = midPointY - squareSide / 2;
    return {side: squareSide, x: topLeftX, y: topLeftY};
};


convert.getSlaveTriangulationData = function (canvas, user) { //WE GET THE IMAGE DATA OF THE ENCAPSULATING RECTANGLE
    const dimensions = helpers.getDimensions(user);
    const targetWidth = dimensions[1];
    const targetHeight = dimensions[0];
    const encapsulatingSquare = convert.getEncapsulatingSquare(user);
    const widthOfEncapsulatingRectangle = encapsulatingSquare.side;
    const heightOfEncapsulatingRectangle = encapsulatingSquare.side;
    const topLeftXOfEncapsulatingRectangle = encapsulatingSquare.x;
    const topLeftYOfEncapsulatingRectangle = encapsulatingSquare.y;
    const angle = user.screenAngle;
    const offSetX = widthOfEncapsulatingRectangle / 2 - targetWidth / 2;
    const offSetY = heightOfEncapsulatingRectangle / 2 - targetHeight / 2;
    console.log("width and height of encapsulating: ");
    console.log(widthOfEncapsulatingRectangle);
    console.log(heightOfEncapsulatingRectangle);
    let enCapsulatingCanvas = createCanvas(widthOfEncapsulatingRectangle, heightOfEncapsulatingRectangle);
    let resultingCanvas = createCanvas(widthOfEncapsulatingRectangle, heightOfEncapsulatingRectangle);
    const ctxEncaps = enCapsulatingCanvas.getContext('2d');
    const ctxResult = resultingCanvas.getContext('2d');

    ctxEncaps.drawImage(canvas, topLeftXOfEncapsulatingRectangle, topLeftYOfEncapsulatingRectangle, widthOfEncapsulatingRectangle, heightOfEncapsulatingRectangle, 0, 0, widthOfEncapsulatingRectangle, heightOfEncapsulatingRectangle);
    ctxResult.translate(widthOfEncapsulatingRectangle / 2, heightOfEncapsulatingRectangle / 2);
    ctxResult.rotate(angle);
    ctxResult.drawImage(enCapsulatingCanvas, -widthOfEncapsulatingRectangle / 2, -heightOfEncapsulatingRectangle / 2);

    const slaveCanvas = createCanvas(targetWidth, targetHeight);
    const ctxSlaveCanvas = slaveCanvas.getContext('2d');

    ctxSlaveCanvas.drawImage(resultingCanvas, -offSetX, -offSetY);

    const croppedImageData = slaveCanvas.toDataURL();
    return {data: croppedImageData, width: targetWidth, height: targetHeight}
};

convert.getSlaveImageData = function (canvas, user) {
    const dimensions = helpers.getDimensions(user);
    const targetWidth = dimensions[1];
    const targetHeight = dimensions[0];
    const encapsulatingSquare = convert.getEncapsulatingSquare(user);
    const widthOfEncapsulatingRectangle = encapsulatingSquare.side;
    const heightOfEncapsulatingRectangle = encapsulatingSquare.side;
    const topLeftXOfEncapsulatingRectangle = encapsulatingSquare.x;
    const topLeftYOfEncapsulatingRectangle = encapsulatingSquare.y;
    const angle = user.screenAngle;
    const offSetX = widthOfEncapsulatingRectangle / 2 - targetWidth / 2;
    const offSetY = heightOfEncapsulatingRectangle / 2 - targetHeight / 2;

    let enCapsulatingCanvas = createCanvas(widthOfEncapsulatingRectangle, heightOfEncapsulatingRectangle);
    let resultingCanvas = createCanvas(widthOfEncapsulatingRectangle, heightOfEncapsulatingRectangle);
    const ctxEncaps = enCapsulatingCanvas.getContext('2d');
    const ctxResult = resultingCanvas.getContext('2d');

    ctxEncaps.drawImage(canvas, topLeftXOfEncapsulatingRectangle, topLeftYOfEncapsulatingRectangle, widthOfEncapsulatingRectangle, heightOfEncapsulatingRectangle, 0, 0, widthOfEncapsulatingRectangle, heightOfEncapsulatingRectangle);
    ctxResult.translate(widthOfEncapsulatingRectangle / 2, heightOfEncapsulatingRectangle / 2);
    ctxResult.rotate(angle);
    ctxResult.drawImage(enCapsulatingCanvas, -widthOfEncapsulatingRectangle / 2, -heightOfEncapsulatingRectangle / 2);

    const slaveCanvas = createCanvas(targetWidth, targetHeight);
    const ctxSlaveCanvas = slaveCanvas.getContext('2d');

    ctxSlaveCanvas.drawImage(resultingCanvas, -offSetX, -offSetY);

    const croppedImageData = slaveCanvas.toDataURL();
    return {data: croppedImageData, width: targetWidth, height: targetHeight}
};

convert.getBallPath = function (users, length) {
    let userArray = [];
    let randomUser = users[Math.floor(Math.random() * users.length)];
    userArray.push(randomUser);
    for (let i = 0; i < length; i++) {
        const adjacentUsers = randomUser.adjacentUsers;
        randomUser = adjacentUsers[Math.floor(Math.random() * adjacentUsers.length)];
        for (const user of users) {
            if (randomUser.id === user.id) {
                randomUser = user;
                break;
            }
        }
        userArray.push(randomUser);
    }
    return userArray;
};

convert.dirFromMidPoint = function (startUserMidPoint, destUserMidPoint) {
    const startX = startUserMidPoint[1];
    const destX = destUserMidPoint[1];
    const startY = startUserMidPoint[0];
    const destY = destUserMidPoint[0];
    const dx = destX - startX;
    const dy = destY - startY;
    return Math.atan2(dy, dx);
    //Canvas en velocity gade nodig hebben om relatieve velocity te berekenen
};

convert.getIntersectionPoint = function (point1, point2, point3, point4){//calculates intersection between 2 straight lines
    let resultX;
    let resultY;
    let rc;
    let value
    if(point1[1] === point2[1] && point3[1] === point4[1]){
        return [];
    }
    else if(point1[1] === point2[1]){
        resultX = point1[1];
        rc = (point4[0] - point3[0]) / (point4[1] - point3[1]);
        value = rc*(-1*point3[1]) + point3[0];
        resultY = rc*resultX + value;
    }
    else if(point3[1] === point4[1]){
        resultX = point3[1];
        rc = (point2[0] - point1[0]) / (point2[1] - point1[1]);
        value = rc*(-1*point1[1]) + point1[0];
        resultY = rc*resultX + value;
    }
    else {
        const rc1 = (point2[0] - point1[0]) / (point2[1] - point1[1]);
        const value1 = rc1 * (-1 * point1[1]) + point1[0];
        const rc2 = (point4[0] - point3[0]) / (point4[1] - point3[1]);
        const value2 = rc2 * (-1 * point3[1]) + point3[0];
        if(rc1 === rc2){
            return []
        }
        //rc1*x + value1 = rc2*x + value2 => ...
        resultX = (value2 - value1) / ((rc1 - rc2));
        //y = rc1*x + value1
        resultY = rc1 * resultX + value1;
    }
    return [resultY, resultX];
};

convert.liesBetween = function (point1, point2, testPoint){
    if(testPoint.length === 0){
        return false
    }
    if(point1[0] <= testPoint[0] && testPoint[0] <= point2[0] && point1[1] <= testPoint[1] && testPoint[1] <= point2[1]){
        return true;
    }
    if(point2[0] <= testPoint[0] && testPoint[0] <= point1[0] && point2[1] <= testPoint[1] && testPoint[1] <= point1[1]) {
        return true
    }
    if(point1[0] <= testPoint[0] && testPoint[0] <= point2[0] && point2[1] <= testPoint[1] && testPoint[1] <= point1[1]) {
        return true;
    }
    if(point2[0] <= testPoint[0] && testPoint[0] <= point1[0] && point1[1] <= testPoint[1] && testPoint[1] <= point2[1]) {
        return true;
    }
    return false;
}


convert.getDelay = function (startUser, destUser, velocity) {
    const startX = startUser.midPoint[1];
    const destX = destUser.midPoint[1];
    const startY = startUser.midPoint[0];
    const destY = destUser.midPoint[0];

    const intersectTLTR = convert.getIntersectionPoint(startUser.midPoint, destUser.midPoint, destUser.topLeft, destUser.topRight);
    const intersectTRBR = convert.getIntersectionPoint(startUser.midPoint, destUser.midPoint, destUser.topRight, destUser.bottomRight);
    const intersectBRBL = convert.getIntersectionPoint(startUser.midPoint, destUser.midPoint, destUser.bottomRight, destUser.bottomLeft);
    const intersectBLTL = convert.getIntersectionPoint(startUser.midPoint, destUser.midPoint, destUser.bottomLeft, destUser.topLeft);

    let distTLTRToStart = 9999999999;
    let distTRBRToStart = 9999999999;
    let distBRBLToStart = 9999999999;
    let distBLTLToStart = 9999999999;

    if(convert.liesBetween(destUser.topLeft, destUser.topRight, intersectTLTR)){
        distTLTRToStart = Math.sqrt(Math.pow(startY - intersectTLTR[0], 2) + Math.pow(startX - intersectTLTR[1], 2));
    }if(convert.liesBetween(destUser.topRight, destUser.bottomRight, intersectTRBR)) {
        distTRBRToStart = Math.sqrt(Math.pow(startY - intersectTRBR[0], 2) + Math.pow(startX - intersectTRBR[1], 2));
    }if(convert.liesBetween(destUser.bottomRight, destUser.bottomLeft, intersectBRBL)) {
        distBRBLToStart = Math.sqrt(Math.pow(startY - intersectBRBL[0], 2) + Math.pow(startX - intersectBRBL[1], 2));
    }if(convert.liesBetween(destUser.bottomLeft, destUser.topLeft, intersectBLTL)) {
        distBLTLToStart = Math.sqrt(Math.pow(startY - intersectBLTL[0], 2) + Math.pow(startX - intersectBLTL[1], 2));
    }
    const minDist = Math.min(distTLTRToStart, distTRBRToStart, distBRBLToStart, distBLTLToStart);
    let result = minDist / velocity;
    console.log('RESULT: ' + result);
    return result
};

convert.getAnimationArray = function (users, length, velocity) { //expects triangulated users
    const userArray = convert.getBallPath(users, length);
    const animationArray = [];
    let delay = 0;
    for (let i = 0; i < userArray.length; i++) {
        if (i === 0) {
            const fromDirection = '';
            const toDirection = convert.dirFromMidPoint(userArray[0].midPoint, userArray[1].midPoint) + userArray[0].screenAngle;
            //GEEN DELAY VOOR EERSTE
            const id = userArray[0].id;
            const animationInfo = {id: id, fromDir: fromDirection, toDir: toDirection, velocity: velocity};
            animationArray.push({animationInfo: animationInfo, delayBefore: delay});
            continue;
        }
        if (i === userArray.length - 1) {
            const fromDirection = convert.dirFromMidPoint(userArray[i].midPoint, userArray[i - 1].midPoint) + userArray[i].screenAngle;
            const toDirection = '';
            delay = delay + convert.getDelay(userArray[i - 1], userArray[i], velocity);
            const id = userArray[i].id;
            const animationInfo = {id: id, fromDir: fromDirection, toDir: toDirection, velocity: velocity};
            animationArray.push({animationInfo: animationInfo, delayBefore: delay});
            continue;
        }
        const fromDirection = convert.dirFromMidPoint(userArray[i].midPoint, userArray[i - 1].midPoint) + userArray[i].screenAngle;
        const toDirection = convert.dirFromMidPoint(userArray[i].midPoint, userArray[i + 1].midPoint) + userArray[i].screenAngle;
        delay = delay + convert.getDelay(userArray[i - 1], userArray[i], velocity);
        const id = userArray[i].id;
        const animationInfo = {id: id, fromDir: fromDirection, toDir: toDirection, velocity: velocity};
        animationArray.push({animationInfo: animationInfo, delayBefore: delay});
    }
    return animationArray;
};

convert.animate = function(slaveChannel, animationArray, index){
    //let animation = animationArray[index];
    for(const animation of animationArray){
        const animationInfo = animation.animationInfo;
        slaveChannel.to(animationInfo.id).emit('animationInfo', animationInfo);
    }
};

module.exports = convert;

