class Rectangle{
    constructor(width, height){
        this.width = width;
        this.height = height;
        let foo = width;
        this.enlarge = (a) => {
            this.width *=a;
            this.height*=a;
        }
        this.getFoo1 = () => {
            return foo;
        }
    }

    get getFoo(){
        return this.getFoo1();
    }

    get Area(){
        return this.calcArea();
    }

    calcArea(){
        return this.width * this.height;
    }

}

const square = new Rectangle(10,10);
console.log(square.Area);
console.log(square.calcArea());
console.log(square.getFoo);
square.enlarge(2);
console.log(square.calcArea());
console.log(square.getFoo);
