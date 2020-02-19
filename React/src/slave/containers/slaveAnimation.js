let animation = {};

//https://www.w3schools.com/graphics/game_components.asp
animation.getAngle = function(point1, point2){
    return Math.atan2(point2[1] - point1[1], point2[0] - point1[0]);
};

animation.getLength = function(point1, point2){
    return Math.sqrt(Math.pow(point2[0] - point1[0], 2) + Math.pow(point2[1] - point1[1], 2));
};

animation.circle = function(radius, color, x, y, speed, goals, ctx) {
    this.radius = radius;
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.start = [x, y];
    this.goals = goals;
    this.angle = exports.getAngle(this.start, this.goals[0]);
    this.newPos = () => {
        this.x += this.speed* Math.cos(this.angle);
        this.y += this.speed * Math.sin(this.angle);
    }
    this.takeCorner = (lengthBeforeCorner) => {
        this.start = this.goals.shift();
        this.x = this.start[0];
        this.y = this.start[1];
        this.angle = exports.getAngle(this.start, this.goals[0]);
        this.x += (this.speed - lengthBeforeCorner) * Math.cos(this.angle);
        this.y += (this.speed - lengthBeforeCorner) * Math.sin(this.angle);
    }
    this.update = () => {
        let distToCorner = exports.getLength([this.x, this.y], this.goals[0]);
        (distToCorner > this.speed) ? this.newPos(): this.takeCorner(distToCorner);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI); // drawing the circle
        ctx.fill();
        ctx.closePath();
    }
}

//(x1, y1) is the top right and (x2, y2) bottom left
animation.withinRectangle= function([xPoint, yPoint], [x1, y1], [x2, y2]) {
    return (xPoint >= x1 && xPoint <= x2 && yPoint >= y1 && yPoint <= y2);
}

animation.getEdgePointFromAngle = function(angle, angleScreen, w, h, threshold) {
    let point = [w/2, h/2];
    let val;
    if (0 <= angle && angle <= Math.PI) {
        if (angleScreen <= angle <= Math.PI - angleScreen) {
            val = (h/2 + threshold);
            (angle < Math.PI / 2) ? point[0] += val * Math.cot(angle) : point[0] -= val * Math.cot(angle);
            point[1] += val;

        } else {
            val = (w/2 + threshold);
            (angle < Math.PI / 2) ? point[0] += val : point[0] -= val;
            point[1] += val * Math.tan(angle);
        }
    } else {
        if (angleScreen <= -angle <= Math.PI - angleScreen) {
            val = (h/2 + threshold);
            (-angle < Math.PI / 2) ? point[0] += val * Math.cot(angle) : point[0] -= val * Math.cot(angle);
            point[1] -= val;
        } else {
            val = w/2 + threshold;
            (-angle < Math.PI / 2) ? point[0] += val : point[0] -= val;
            point[1] -= val * Math.tan(angle);
        }
    }
    return point;
};

export  default animation;

