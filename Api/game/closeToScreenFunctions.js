const gameHelpers = require('./gameHelpers');

// hoe bepalen wanneer de cirkel welk scherm binnengaat?
// 1. op voorhand weten welke rechthoeken worden geraakt bij een nieuwe goal
// 2. altijd de rechthoeken checken binnen het kwadrant van de rechthoek
// 3. altijd blijven emitten naar de slaves

// Wat is de beste manier om te checken wanneer moet worden geemit.
// Krijg je ook een height en width mee van het scherm in pixels. (in dat geval (width + height) -> cirkel rond het scherm)

function isWithinRectangle(point, TR, TL, BL, BR, alpha){
    let x = TL[0];
    let y = TL[1];
    newTL = [0, 0];
    TRx = (TR[0] - x);
    TRy = (TR[1] - y);
    BLx = (BL[0] - x)(TR[1] - y);
    newBR = [(BR[0] - x), (BR[1] - y)];
}

const matrixX1Y1toX1X2 = (alpha) => [
    [[Math.cos(alpha)], [Math.sin(alpha)]],
    [[-Math.sin(alpha)], [Math.cos(alpha)]],
];

// x naar x'
const myMatrix1 = (x, y, alpha) => [x*Math.cos(alpha) + y*Math.sin(alpha), y*Math.cos(alpha) - x*Math.sin(alpha)];
// x' naar x
const myMatrix2 = (x, y, alpha) => [x*Math.cos(alpha) - y*Math.sin(alpha), y*Math.cos(alpha) + x*Math.sin(alpha)];

// very primitive
function isCloseEnoughPrimitive(point, midPoint, givenRadius){
    return gameHelpers.getLength(midPoint, point) <= givenRadius;
}

function getManhattanLength(point1, point2){
    return Math.abs(point2[0] - point1[0]) + Math.abs(point2[0] - point1[0]);
}

// https://www.geeksforgeeks.org/how-to-check-if-a-given-point-lies-inside-a-polygon/
// https://www.geeksforgeeks.org/check-if-two-given-line-segments-intersect/






let point1 = [0, 0];
let point2 = [0, 10];
let point3 = [10, 10];
let point4 = [10, 0];
let myPoint = [11, 11];


//let exampleArray0 = ['TL', 'TR', 'BR', 'BL'];
let exampleArray = [point1, point2, point3, point4]

//
//https://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment
// this will check whether it comes close enough to our rectangle.
// this formula does work mathematically (checked it)


function dist2(v, w) { return (v.x - w.x)**2 + (v.y - w.y)**2 }

function distToSegmentSquared(p, v, w) {
    let l2 = dist2(v, w);
    if (l2 == 0) return dist2(p, v);
    let t = ((p[0] - v[0]) * (w[0] - v[0]) + (p[1] - v[1]) * (w[1] - v[1])) / l2;
    t = Math.max(0, Math.min(1, t));
    return dist2(p, { x: v.x + t * (w.x - v.x),
        y: v.y + t * (w.y - v.y) });
}

// second website, mmmm..., works as well but


let vectors = [];
for(let i=0; i<exampleArray.length - 1; i++){
    let p0 = exampleArray[i];
    let p1 = exampleArray[i + 1];
    let v1 = vector(p0, p1);
    let v2 = vector(p0, myPoint);
    vectors.push(v1);
    console.log(vectors);
}
let p0 = exampleArray[exampleArray.length - 1];
let p1 = exampleArray[0];
vectors.push(vector(p0, p1));
console.log(vectors);
console.log(exampleArray);














