const gameHelpers = require('./game/gameHelpers');

function vector(point1, point2){
    return [point2[0] - point1[0], point2[1] - point1[1]];
}

scalarProduct = function(point1, point2){
    return point1[0]*point2[0] + point1[1]*point2[1];
}

function magnitude(vector){
    return Math.sqrt(Math.pow(vector[0],2) + Math.pow(vector[1],2));
}

function angle(vector){
    return gameHelpers.getAngle(vector, [0, 0]);
}

function rico(point1, point2){
    return (point2[1] - point1[1])/(point2[0] - point2[0]);
}

function doesIntersect(rico1, rico2){
    return (rico1 === rico2);
}


//https://www.geeksforgeeks.org/check-if-two-given-line-segments-intersect/


// Given three colinear points p, q, r, the function checks if
// point q lies on line segment 'pr'
function onSegment(p, q, r){
    if (q[0] <= Math.max(p[0], r[0]) && q[0] >= Math.min(p[0], r[0]) &&
        q[1] <= Math.max(p[1], r[1]) && q[1] >= Math.min(p[1], r[1]))
        return true;

    return false;
}

// To find orientation of ordered triplet (p, q, r).
// The function returns following values
// 0 --> p, q and r are colinear
// 1 --> Clockwise
// 2 --> Counterclockwise
function orientation(p, q, r){
    // See https://www.geeksforgeeks.org/orientation-3-ordered-points/
    // for details of below formula.
    let val = (q[1] - p[1]) * (r[0] - q.x) -
    (q[0] - p[0]) * (r[1] - q[1]);

    if (val == 0) return 0;  // colinear

    return (val > 0)? 1: 2; // clock or counterclock wise
}

// The main function that returns true if line segment 'p1q1'
// and 'p2q2' intersect.
function doIntersect(p1, q1, p2, q2) {
    // Find the four orientations needed for general and
    // special cases
    let o1 = orientation(p1, q1, p2);
    let o2 = orientation(p1, q1, q2);
    let o3 = orientation(p2, q2, p1);
    let o4 = orientation(p2, q2, q1);

    // General case
    if (o1 != o2 && o3 != o4)
        return true;

    // Special Cases
    // p1, q1 and p2 are colinear and p2 lies on segment p1q1
    if (o1 == 0 && onSegment(p1, p2, q1)) return true;

    // p1, q1 and q2 are colinear and q2 lies on segment p1q1
    if (o2 == 0 && onSegment(p1, q2, q1)) return true;

    // p2, q2 and p1 are colinear and p1 lies on segment p2q2
    if (o3 == 0 && onSegment(p2, p1, q2)) return true;

    // p2, q2 and q1 are colinear and q1 lies on segment p2q2
    if (o4 == 0 && onSegment(p2, q1, q2)) return true;

    return false; // Doesn't fall in any of the above cases
}

// Driver program to test above functions
function main() {
    let p1 = [1, 1]
    let q1 = [10, 1];
    let p2 = [1, 2];
    let q2 = [10, 2];

    doIntersect(p1, q1, p2, q2)? console.log("Yes\n"): console.log("No\n");

    p1 = [10, 0];
    q1 = [0, 10];
    p2 = [0, 0];
    q2 = [10, 10];

    doIntersect(p1, q1, p2, q2)? console.log("Yes\n"): console.log("No\n");

    p1 = [-5, -5];
    q1 = [0, 0];
    p2 = [1, 1];
    q2 = [10, 10];

    doIntersect(p1, q1, p2, q2)? console.log("Yes\n"): console.log("No\n");

    return 0;
}

main();
// problem: should return no, yes, no