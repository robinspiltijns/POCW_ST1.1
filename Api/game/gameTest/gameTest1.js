// with a little help of https://p5js.org/examples/interaction-snake-game.html

//https://github.com/processing/p5.js/wiki/p5.js-overview

//let helpers = require('./gameHelpers');
//console.log(helpers.findAngle([0,0],[4,4]));

let speed = 8;
let diameter = 20;

// object with triangles per point

let xCor = 0;
let yCor = 250;


let start;
let head;
let goal;
let angle;

let [point1, point2, point3, point4, point5] = [[0, 250], [550, 550], [40,40], [600,200], [900,400]];

//console.log(point4);

let triangle1 = [point1, point2, point3];
let triangle2 = [point3, point2, point4];
let triangle3 = [point4, point2, point5];
let triangle4 = [point2, point3, point5];

let connectionsByPoint = {point1: [point2, point3], point2: [point1, point2, point3, point4, point5],
    point3: [point1, point2, point4], point4: [point2, point3, point5], point5: [point2, point3, point4]};


let triangleStart = [];
let currentTriangle;
let triangles = triangle1.concat(triangle2).concat(triangle3).concat(triangle4);
console.log(triangles);

let trianglesByPoint = findPointTripleOccurence(triangles);
console.log(trianglesByPoint);
console.log('\n');
console.log(trianglesByPoint[point2]);
console.log('\n');
console.log(trianglesByPoint[point4]);
console.log('\n');



let amplitude = 0;

let ourSine = (x, length) => {
    makePeriodic2(x, makeRandomCoefficients(-4, 4, 5), length);
}

let empty;

function setup() {
    let canvas = createCanvas(2000, 2000); // 600,480
    frameRate(200); // frames per second
    currentTriangle = [[...triangles[0]], [...triangles[1]], [...triangles[2]]];
    head = [...currentTriangle[0]];
    goal = [...currentTriangle[1]];
    angle = getAngle(head, goal);
}

function draw(){
    //background(200,100,30);
    stroke(0);
    ellipse(xCor, yCor, diameter, diameter);
    updateEllipseCoordinates2();
}

function updateEllipseCoordinates(){
    xCor = head[0] + speed * Math.cos(angle) - amplitude * Math.sin(angle);
    yCor = head[1] + speed * Math.sin(angle) + amplitude * Math.cos(angle);
    head = [head[0] + speed * Math.cos(angle), head[1] + speed * Math.sin(angle)]
    if(getLength(head, goal) < speed){
        console.log('within length');
        // console.log(head, goal);
        updateGoal();
        angle = getAngle(head, goal);
        //console.log(2, {s: start, g: goal});
    }
    // angle = getAngle(head, goal);

}

function updateEllipseCoordinates2(){
    if(getLength(head, goal) >= speed){
        xCor = head[0] + speed * Math.cos(angle) - amplitude * Math.sin(angle);
        yCor = head[1] + speed * Math.sin(angle) + amplitude * Math.cos(angle);
        head = [head[0] + speed * Math.cos(angle), head[1] + speed * Math.sin(angle)]
        angle = getAngle(head, goal);
    } else {
        console.log('within length');
        let furtherRoad = speed - getLength(head, goal);
        updateGoal();
        angle = getAngle(head, goal);
        head = [head[0] + furtherRoad* Math.cos(angle), head[1] + furtherRoad * Math.sin(angle)]
    }
}




// this functionality only allows the snake to 'follow' the triangles in one way (counterclockwise or clockwise
// it doesn't prevent U-turns (as triangles may have the same sides).
function updateGoal(){
    let oldGoal = [...goal];
    currentTriangle = chooseRandomItem(trianglesByPoint[`${oldGoal}`]);
    for(let i=0; i<3; i++){
        if (arraysEqual(currentTriangle[i], oldGoal)){
            //console.log(currentTriangle[i]);
            head = [xCor, yCor];
            goal = [...currentTriangle[(i+1)%3]]
            //console.log('help', goal);
        }
    }
}

// These should go into some gameHelpers functionality, but unfortunately if I try require(''), it doesn't do
// anything at all, probably because of the way I tried to work things out.

sinePeriod = (x, period) => {
    return Math.sin(2*Math.PI*x/period);
}



// make random integer coefficients between two values.
makeRandomCoefficients = (lowerBound, upperBound, numberCoeff) => {
    let coeff = [];
    for (let i = 0; i<numberCoeff; i++){
        coeff.push(Math.floor((Math.random() * (upperBound + 1 - lowerBound)) + lowerBound));
    }
    return coeff;
}

makePeriodic2 = function makePeriodic2(x, coeff, length){
    let sum = 0;
    for(let i = 0; i<coeff.length; i++){
        sum += coeff[i] * sinePeriod(x, length/(i+1));
    }
    return sum;
}

// withinRectangle = (TLpoint, point, width, height) => {
//     let leftSide, rightSide;
//     (width > 0)? leftSide = (TLpoint[0] <= point[0] <= TLpoint[0] + width) : leftSide = (TLpoint[0] >= point[0] >= TLpoint[0] + width);
//     (height > 0)? rightSide = (TLpoint[1] <= point[1] <= TLpoint[1] + height) : rightSide = (TLpoint[1] >= point[1] >= TLpoint[1] + height)
//     return leftSide && rightSide;
// }

function getAngle(point1, point2){
    return Math.atan2(point2[1] - point1[1], point2[0] - point1[0]);
}

// choose a random item from an array
function chooseRandomItem(array){
    if (array.length === 0){
        return null;
    }
    return array[Math.floor(Math.random() * (array.length))];
}



//https://stackoverflow.com/questions/3115982/how-to-check-if-two-arrays-are-equal-with-javascript
// in image_differences
function arraysEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;

    // If you don't care about the order of the elements inside
    // the array, you should sort both arrays here.
    // Please note that calling sort on an array will modify that array.
    // you might want to clone your array first.

    for (let i = 0; i < a.length; ++i) {

        if (a[i] !== b[i]) {
            if (Array.isArray(a[i]) && Array.isArray(b[i])) {
                if (!arraysEqual(a[i], b[i])) {return false;}
            }else return false;
        }
    }

    return true;
}

// search all triple occurences per point (assuming each triple containing three different points and no double triples)
function findPointTripleOccurence(triplets){
    let result = {};
    for(let i=0;i<triplets.length/3; i++) {
        let triangle = [[...triplets[3 * i]], [...triplets[3 * i + 1]], [...triplets[3 * i + 2]]];
        for (let j = 0; j < 3; j++) {
            let point = triplets[3 * i + j];
            if (result[`${triplets[3 * i + j]}`] === undefined) { // ugly, but works
                result[`${triplets[3 * i + j]}`] = [[...triangle]];
            } else {
                result[`${triplets[3 * i + j]}`].push([...triangle]);
            }
        }
    }
    return result;
}

function getLength(point1, point2){
    return Math.sqrt(Math.pow(point2[0] - point1[0], 2) + Math.pow(point2[1] - point1[1], 2));
}