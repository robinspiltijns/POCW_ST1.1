let convert = {};
const Cookies = require('cookies');
const delaunator = require('delaunator');
const base64Img = require('base64-img');
const Jimp = require('jimp');
const sizeOf = require('image-size');
const {createCanvas, loadImage} = require('canvas');

convert.makeid = function makeid(length) {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};

convert.setState = function (user, state) {
    let stateKeys = Object.keys(state);
    for (const stateKey of stateKeys) {
        user[stateKey] = state[stateKey];
    }
};

convert.angleBetweenMinPiPlusPi = function (angle) {
    absoluteAngle = Math.abs(angle);
    while (absoluteAngle > PI) {
        absoluteAngle - 2 * PI;
    }
    return absoluteAngle * Math.sign(angle);
};

convert.updateCookies = function updateCookies(req, res) {
    let cookies = new Cookies(req, res);
    let token = cookies.get('token');
    if (!token) {
        let newId = convert.makeid(20);
        res.cookie('token', newId).send({
            status: 'success'
        })
    } else {
        res.json('succes'); //We moeten een reply geven.
    }
};

convert.switchScreen = function switchScreen(users, iterator, slaveChannel) {
    if (iterator === 1) {
        convert.setState(users[0], {
            tricolor: '#00c800',
            color: 'white'
        });
        slaveChannel.to(users[0].id).emit('setState', users[0])
    } else {
        convert.setState(users[iterator - 1], {
            tricolor: '#00c800',
            color: 'white'
        });
        slaveChannel.to(users[iterator - 1].id).emit('setState', users[iterator - 1]);
        convert.setState(users[iterator - 2], {
            tricolor: '',
            color: 'white'
        });
        slaveChannel.to(users[iterator - 2].id).emit('setState', users[iterator - 2]);
    }
};

convert.userAlreadyParticipating = function userAlreadyParticipating(user, users) {
    //random user that always joins
    console.log("checking if participating");
    console.log("userId: " + user.id);
    if (!user.id) return true;
    return users.filter(currentUser => {
        return user.id === currentUser.id;
    }).length > 0;
};

convert.updateDelays = function (timeInfo, users) {
    for (let i in users) {
        if (users[i].id === timeInfo.id) {
            users[i].delay = timeInfo.delay;
            break;
        }
    }
};

//TRIANGULATION

//assumptions: temp_users van formaat [{id : ..., topRight: [y, x], ..., screenAngle: ...}, {...}]

//voegt de midPoints toe aan elke user (van elk scherm) formaat: temp_users[i].midPoint = [y, x]
convert.addMidPoints = function addMidPoints(temp_users) {
    let midPoints = [];
    for (const user of temp_users) {
        let bottomY = Math.max(user.topRight[0], user.topLeft[0], user.bottomRight[0], user.bottomLeft[0]);
        let topY = Math.min(user.topRight[0], user.topLeft[0], user.bottomRight[0], user.bottomLeft[0]);
        let rightmostX = Math.max(user.topRight[1], user.topLeft[1], user.bottomRight[1], user.bottomLeft[1]);
        let leftmostX = Math.min(user.topRight[1], user.topLeft[1], user.bottomRight[1], user.bottomLeft[1]);
        let difY = bottomY - topY;
        let difX = rightmostX - leftmostX;
        user.midPoint = [bottomY - difY / 2, leftmostX + difX / 2];
    }
};

//voegt voor elke user de id's toe van de users waarmee hij moet verbinden (in de triangulatie), gebruikt ook addMidPoints() om midPoints toe te voegen
convert.triangulate = function triangulate(temp_users) {
    convert.addMidPoints(temp_users);
    let midPointLocations = [];
    for (const temp_user of temp_users) {
        midPointLocations.push(temp_user.midPoint);
    }
    const del = delaunator.from(midPointLocations);
    const triangles = del.triangles;
    let adjacentUsers = [];
    for (let i = 0; i < temp_users.length; i++) {
        let user = temp_users[i];
        for (let j = 0; j < triangles.length; j = j + 3) {//We itereren over alle driehoeken (3 entries per driehoek)
            if (i === triangles[j]) { //user ID is het eerste hoekpunt van de driehoek
                let adjacentUser1 = { //De twee andere hoekpunten waarmee user dus verbonden moet worden
                    id: temp_users[triangles[j + 1]].id,
                    midPoint: temp_users[triangles[j + 1]].midPoint
                };
                let adjacentUser2 = {
                    id: temp_users[triangles[j + 2]].id,
                    midPoint: temp_users[triangles[j + 2]].midPoint
                };
                adjacentUsers.some(user => user.id === adjacentUser1.id) || adjacentUsers.push(adjacentUser1); //elegante manier om dubbels te vermijden in lijst met objecten
                adjacentUsers.some(user => user.id === adjacentUser2.id) || adjacentUsers.push(adjacentUser2);
                continue;
            }
            if (i === triangles[j + 1]) { //user ID is het tweede hoekpunt van de driehoek
                let adjacentUser1 = {
                    id: temp_users[triangles[j]].id,
                    midPoint: temp_users[triangles[j]].midPoint
                };
                let adjacentUser2 = {
                    id: temp_users[triangles[j + 2]].id,
                    midPoint: temp_users[triangles[j + 2]].midPoint
                };
                adjacentUsers.some(user => user.id === adjacentUser1.id) || adjacentUsers.push(adjacentUser1);
                adjacentUsers.some(user => user.id === adjacentUser2.id) || adjacentUsers.push(adjacentUser2);
                continue;
            }
            if (i === triangles[j + 2]) { //user ID is het derde hoekpunt van de driehoek
                let adjacentUser1 = {
                    id: temp_users[triangles[j]].id,
                    midPoint: temp_users[triangles[j]].midPoint
                };
                let adjacentUser2 = {
                    id: temp_users[triangles[j + 1]].id,
                    midPoint: temp_users[triangles[j + 1]].midPoint
                };
                adjacentUsers.some(user => user.id === adjacentUser1.id) || adjacentUsers.push(adjacentUser1);
                adjacentUsers.some(user => user.id === adjacentUser2.id) || adjacentUsers.push(adjacentUser2);
            }
        }
        user.adjacentUsers = adjacentUsers;
        adjacentUsers = [];
    }
};

convert.getDimensions = function getDimensions(user) {
    const topX = user.topRight[1];
    const topY = user.topRight[0];
    const bottomX = user.bottomRight[1];
    const bottomY = user.bottomRight[0];
    const leftX = user.topLeft[1];
    const leftY = user.topLeft[0];
    const width = Math.sqrt((topX - leftX) * (topX - leftX) + (topY - leftY) * (topY - leftY));
    const height = Math.sqrt((topX - bottomX) * (topX - bottomX) + (topY - bottomY) * (topY - bottomY));
    return [height, width];
};

//GENERATING TEMPLATE USERS

convert.generate_user = function generate_user(user_id, TLx, TLy, width, height, angleRad) {
    const BLx = Math.round(TLx + height * Math.sin(angleRad));
    const BLy = Math.round(TLy + height * Math.cos(angleRad));
    const TRx = Math.round(TLx + width * Math.cos(angleRad));
    const TRy = Math.round(TLy - width * Math.sin(angleRad));
    const BRx = Math.round(BLx + width * Math.cos(angleRad));
    const BRy = Math.round(BLy - width * Math.sin(angleRad));
    return {
        id: user_id,
        topRight: [TRy, TRx],
        bottomRight: [BRy, BRx],
        topLeft: [TLy, TLx],
        bottomLeft: [BLy, BLx],
        screenAngle: angleRad
    };
};

Array.min = function (array) {
    return Math.min.apply(Math, array);
};
Array.max = function (array) {
    return Math.max.apply(Math, array);
};

//Return the corners of the smallest rectangle that can be drawn around the screens. These corners
//are expressed in terms of x and y pixels. This rectangle is drawn in the picture that was taken by the user, so it's
//resolution is relative to the resolution of that picture.
convert.outerCorners = function (users) {
    let yCoordinates = [];
    let xCoordinates = [];
    for (const user of users) {
        yCoordinates.push(user.topRight[0], user.topLeft[0], user.bottomLeft[0], user.bottomRight[0]);
        xCoordinates.push(user.topRight[1], user.topLeft[1], user.bottomLeft[1], user.bottomRight[1]);
    }
    return {
        minY: Array.min(yCoordinates),
        maxY: Array.max(yCoordinates),
        minX: Array.min(xCoordinates),
        maxX: Array.max(xCoordinates),
    };
};

module.exports = convert;
