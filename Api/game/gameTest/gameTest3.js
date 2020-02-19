//https://www.w3schools.com/graphics/game_components.asp

let timeOut = 50;

let circ1;

let speed = 20;

let start;
let goal;
let goals = []; // containing the current goal + the next goal. To be implemented yet.
let head;
let angle;

let [point1, point2, point3, point4, point5] = [[0, 250], [550, 550], [40,40], [600,200], [900,400]];

// triangles are unused and are unlikely to be used again. They however give an overview of the triangles in our test animation
let triangle1 = [point1, point2, point3];
let triangle2 = [point3, point2, point4];
let triangle3 = [point4, point2, point5];
let triangle4 = [point2, point3, point5];

let currentTriangle;
let triangles = triangle1.concat(triangle2).concat(triangle3);
let trianglesByPoint = findPointTripleOccurence(triangles);
// triangles are unused and are unlikely to be used again

let connectionsByPoint = {};
connectionsByPoint[`${point1}`] = [point2, point3];
connectionsByPoint[`${point2}`] =  [point1, point3, point4, point5];
connectionsByPoint[`${point3}`] =  [point1, point2, point4];
connectionsByPoint[`${point4}`] =  [point2, point3, point5];
connectionsByPoint[`${point5}`] =  [point2, point3, point4];


// in fact you need N+2 goals, when there are midpoints of N visible screens overlapping 1 visible screen.
let numberOfGoals = 2;

function startGame(){
    start = [...chooseRandomItem(connectionsByPoint[`${point1}`])];
    goals.push([...chooseRandomItem(connectionsByPoint[`${[...start]}`])]);
    for (let i=0; i<numberOfGoals - 1; i++){
        goals.push([...chooseRandomItem(connectionsByPoint[`${[...goals[i]]}`])]);
    }
    head = [...start];
    angle = getAngle(start, goals[0]);
    myGameArea.start();
    circ1 = new circle(10, 'lime', start[0], start[1], speed);
}

let myGameArea = {
    canvas : document.createElement("canvas"),
    start : function() {
        this.canvas.width = 2000;
        this.canvas.height = 2000;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.interval = setInterval(updateGameArea, timeOut);
    },
    clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    end: function() {
        this.clear();
        clearInterval(updateGameArea);
    }
};

const ctx = myGameArea.canvas.getContext('2d');



function circle(radius, color, x, y, speed) {
    this.radius = radius;
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
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI); // drawing the circle
        ctx.fill();
        ctx.closePath();
    }
}

function updateStartGoal(){
    goals.push(chooseRandomItem(connectionsByPoint[`${goals[numberOfGoals - 1]}`]));
    start = goals.shift();
    // if(goals.length !== numberOfGoals) console.log('problem');
    // console.log('goals', goals[0], goals[1], goals[2]);
}



function updateGameArea() {
    myGameArea.clear();
    circ1.update();
}

function getAngle(point1, point2){
    return Math.atan2(point2[1] - point1[1], point2[0] - point1[0]);
}

function getLength(point1, point2){
    return Math.sqrt(Math.pow(point2[0] - point1[0], 2) + Math.pow(point2[1] - point1[1], 2));
}

// deprecated
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






