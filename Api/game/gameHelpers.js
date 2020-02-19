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

exports.withinRectangle = (TLpoint, point, width, height) => {
    let leftSide, rightSide;
    return TLpoint[0] <= point[0] <= TLpoint[0] + width && TLpoint[1] <= point[1] <= TLpoint[1] + height
}

exports.getRandomNumber = (low, high) => {
    low + Math.floor(Math.random() * (high + 1 - low));
}

exports.getAngle = (point1, point2) => {
    return Math.atan2(point2[1] - point1[1], point2[0] - point1[0]);
}

// choose a random item from an array
exports.getRandomItem = (array) => {
    if (array.length === 0){
        return null;
    }
    return array[Math.floor(Math.random() * (array.length))];
}

// returns a random item from an array with the number of the item.
exports.getRandomItemWithNumber = (array) => {
    if (array.length === 0){
        return [null, 0];
    }
    let number = Math.floor(Math.random() * (array.length));
    return {item: array[number], number: number};
}

//https://stackoverflow.com/questions/3115982/how-to-check-if-two-arrays-are-equal-with-javascript
// in image_differences
exports.arraysEqual = (a, b) => {
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
exports.findPointTripleOccurence = (triplets) => {
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

exports.getLength = (point1, point2) => {
    return Math.sqrt(Math.pow(point2[0] - point1[0], 2) + Math.pow(point2[1] - point1[1], 2));
}

exports.getAngle2 = (point1, point2) => {
    let xDiff = point2[1] - point2[0];
    let yDiff = point2[0] - point1[0];
    return Math.atan2(yDiff, xDiff);
}

exports.switchCoordinates = ([c0, c1]) => {
    return [c1, c0];
}

exports.scalarProduct = function(point1, point2){
    return point1[0]*point2[0] + point1[1]*point2[1];
}

exports.magnitude = (vector) => {
    return Math.sqrt(Math.pow(vector[0],2) + Math.pow(vector[1],2));
}

exports.vector = function(point1, point2){
    return [point2[0] - point1[0], point2[1] - point1[1]];
}

// this function is based upon https://stackoverflow.com/questions/10983872/distance-from-a-point-to-a-polygon
// but is corrected
exports.closeEnoughToScreen = function(screen, point, threshold){
    let screenArray = [screen.TL, screen.TR, screen.BR, screen.BL];
    for (let i=0; i<screenArray.length - 1; i++){
        let p0 = exampleArray[i];
        let p1 = exampleArray[(i+1)%(screenArray.length)];
        let v1 = vector(p0, p1);
        let v2 = vector(p0, point);
        let c = scalarProduct(v1, v2) / magnitude(v1);
        // v1.v2 = |v1||v2|cos(a),   c = |v2|cos(a)
        let dist;
        if (c <= 0){
            dist = magnitude(v2);
            // the point is closer to p0 than any other point on the line segment
        } else if (c < 1){
            dist = magnitude(Math.sqrt(scalarProduct(v2, v2) - c**2)); // here I seem to disagree with the code online (first website)
            //sqrt(|v2|**2 - (|v2|cos(a))**2) = |v2|sin(a) which is the distance of the point to the line segment
        } else{
            dist = magnitude(vector(p1, point));
            // the point is closer to p1 than any other point on the line segment
        }
        if (dist < threshold){
            return true;
        }
    }
    return false;
}

exports.closeEnoughToScreen = function(screen, point, threshold){

}


function Ab(p1, p2, p3, p4) {
    let [x1, x2, x3, x4] = [p1[1], p2[1], p3[1], p4[1]];
    let [y1, y2, y3, y4] = [p1[0], p2[0], p3[0], p4[0]];
    return [A(x1, x2, x3, x4, y1, y2, y3, y4), b(x1, y1, x3, y3)];
};

function matrix2x2(a, b, c, d){
    let matrix = [[a, b], [c, d]];
    return matrix;
}

function b(x1, y1, x3, y3){
    return [x1 - x3, y1 - y3];
}

function createZeroMatrixNxM(n, m){
    let matrix = [];
    for(let i=0; i<n; i++){
        matrix[i] = [];
        for(let j=0; j<m; j++){
            matrix[i].push(0);
        }
    }
}

function getDeterminant2x2(matrix){
    let [a, b, c, d] = [matrix[0][0], matrix[0][1], matrix[1][0], matrix[1][1]];
    return a*d - b*c;
}

function multiplyMatrixVector(matrix, vector){
    if (matrix.length === 0) return null;
    if (matrix[0].length !== vector.length) return null;

    let matrix_result = [];
    for(let i=0; i<matrix.length; i++){
        let row = [];
        for(let j=0; j<matrix[0].length; j++){
            row.push(matrix[i][j]*vector[j]);
        }
        matrix_result.push(row);
    }
}

function getInverse2x2Matrix(matrix){
    let [a, b, c, d] = [matrix[0][0], matrix[0][1], matrix[1][0], matrix[1][1]];
    let det = a*d - b*c;
    if (det === 0) return null;
    return matrix2x2(d/det, -b/det, -c/det, a/det);
}

exports.searchSolutionLineSegments = function(p1, p2, p3, p4){
    let A = A(p1, p2, p3, p4);
    let b = b(p1, p3);
    let invA = getInverse2x2Matrix(A);
    if (invA !== null) {
        let x = multiplyMatrixVector(invA, b); //the t in x = x1 + t(x2-x1), y = y1 + t(y2-y1), 0<=t<=1 and u in x = x3 + u(x4-x3), y = y3 + u(y4-y3)
        if ((0 <= x[0] || x[0] <= 1) && (0 <= x[1] || x[1] <= 1)){
            console.log('solution found');
            return x[0]; //the t in x = x1 + t(x2-x1), y = y1 + t(y2-y1), 0<=t<=1
        } else {console.log('no solution found'); return null;}
    } else{

        if (b[0] !== 0){
            if(A[0][0] !== 0) {
                if (b[0] / A[0][0] === b[1] / A[0][1]) {
                    console.log('collinear');
                    let min12 = Math.min(p1[1], p2[1]);
                    let max12 = Math.max(p1[1], p2[1]);
                    let min34 = Math.min(p3[1], p4[1]);
                    let max34 = Math.max(p3[1], p4[1]);
                    if ((Math.max(p3[1], p4[1]) < Math.min(p1[1], p2[1])) ||
                        (Math.min(p3[1], p4[1]) > Math.max(p1[1], p2[1]))) return null;
                    let res;
                    return res;
                } else {
                    console.log('parallel');
                    return null;
                }
            } else if (A[0][1] !== 0) {
                if (b[0] / A[0][1] === b[1] / A[1][1]){
                    console.log('collinear')
                } else {
                    console.log('parallel');
                    return null;
                }
            }
        } else if (b[1] === 0){
            return null;
        }
    }

}
