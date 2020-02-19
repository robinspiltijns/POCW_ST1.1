const server = require('../server');
const helpers = require('../helpers');
const gameHelpers = require('./gameHelpers');
// const http = server.http;
// const io = require('socket.io')(http);
// const slaveChannel = io('/slaveChannel');

// kan vanaf hier niet met slaveChannel werken


let radius;
let gameHandler;

// data from server
let temp_users;

// other stuff
let framesPerSecond = 20;


// as the users seem to contain most of the data it might be helpful to do this
// it is still unknown whether this is efficient enough
function getUsersByPoint1_1(users){
    let result;
    if (users === undefined) return null;
    for(user in users){
        let midPoint = [...user.midPoint];
        userByPoint[`${midPoint}`] = user; // maybe this will be enough?
    }
    return result;
}

function getUsersByPoint1_2(users){
    let result;
    for(user in users){
        let midPoint = [...user.midPoint];
        userByPoint[`${midPoint}`] = {adjacentUsers: [], user: user}; // maybe this will be enough?
        for(adjacentUser in user.adjacentUsers){
            usersByPoint[`${midPoint}`].adjacentPoints.push(adjacentUser);
        }
    }
    return result;
}



function getUsersByPoint2(users){
    let result;
    for(user in users){
        let midPoint = [...user.midPoint];
        let slaveAngle = user.screenAngle;

        userByPoint[`${midPoint}`] = {adjacentPoints: [], user: user, rectangleOfNotification: rectangle};
        for(adjacentUser in user.adjacentUsers){
            usersByPoint[`${midPoint}`].adjacentPoints.push([...adjacentUser.midPoint]);
        }

    }
    return result;
}




let usersByPoint = getUsersByPoint1_1(temp_users);


// let radius = 4;
let start;
let goal;
let head;
let myCircle = {x: undefined, y: undefined, radius: 4, color: 'lime'};

exports.start = () =>{


}

exports.test = () => {
    console.log('we have tested');
    // slaveChannel.emit('displayAnimation', {pointIn: 'test', pointOut: 'test', speed: 50, radius: 50});
}

exports.end = () => {
    clearInterval(updateGame);
    temp_users = undefined;
}


// start

//example of some output
//slaveChannel.emit('circleInfo', xCor, yCor, speed);

function point(x, y, speed) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    // this.speedX = this.speed * Math.cos(angle);
    // this.speedY = this.speed * Math.sin(angle);
    this.newPos = () => {
        this.x += this.speed* Math.cos(angle);
        this.y += this.speed * Math.sin(angle);
        head = [head[0] + this.speed *Math.cos(angle), head[1] + this.speed *Math.sin(angle)];
        angle = getAngle(head, goals[0]);
    }
    this.takeCorner = (lengthBeforeCorner) => {
        updateStartGoal();
        angle = getAngle(start, goals[0]);
        this.x  = start[0];
        this.y = start[1];
        head = [...start];
        this.x += (this.speed - lengthBeforeCorner) * Math.cos(angle);
        this.y += (this.speed - lengthBeforeCorner) * Math.sin(angle);
        head = [head[0] + (this.speed - lengthBeforeCorner) * Math.cos(angle),
            head[1] + (this.speed - lengthBeforeCorner) * Math.sin(angle)];
    }
    this.update = () => {
        let distToCorner = getLength([this.x, this.y], goals[0]);
        (distToCorner > this.speed) ? this.newPos(): this.takeCorner(distToCorner);
    }
}

function updateStartGoal(){
    goals.push(chooseRandomItem(connectionsByPoint[`${goals[numberOfGoals - 1]}`]));
    start = goals.shift();
    // if(goals.length !== numberOfGoals) console.log('problem');
    // console.log('goals', goals[0], goals[1], goals[2]);
}