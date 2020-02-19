const gameHelpers = require('./game/gameHelpers');

exports.serverCircle = function(radius, color, startUser, speed, goalUsers) {
    this.radius = radius;
    this.x = startUser.midPoint[1]; // aargh
    this.y = startUser.midPoint[0];
    this.speed = speed;
    this.startUser = startUser;
    this.start = [...startUser.midPoint]
    this.goalUsers = goalUsers;
    this.goal = [...this.goalUsers[0].midPoint];
    this.angle = gameHelpers.getAngle2(this.start, this.goal);
    this.color = color;
    this.newPos = () => {
        this.x += this.speed * Math.cos(this.angle);
        this.y += this.speed * Math.sin(this.angle);
    }
    this.takeCorner = (lengthBeforeCorner) => {
        this.startUser = this.goalUsers.shift();
        this.goalUsers.push(gameHelpers.getRandomItem(goalUsers[this.goalUsers.length - 1].adjacentUsers));
        this.start = this.startUser.midPoint;
        this.goal = this.goalUsers[0].midPoint;
        this.angle = gameHelpers.getAngle2(this.start, this.goal);
        this.x = this.s (this.speed - lengthBeforeCorner) * Math.cos(this.angle);
        this.y = (this.speed - lengthBeforeCorner) * Math.sin(this.angle);
    }
    this.update = () => {
        let distToCorner = gameHelpers.getLength([this.x, this.y], this.goal);
        (distToCorner > this.speed) ? this.newPos(): this.takeCorner(distToCorner, nextGoal);
    }
    this.delete = () => {
        delete this; // does this work?
    }
}

