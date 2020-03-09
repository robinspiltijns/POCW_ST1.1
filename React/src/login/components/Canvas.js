import React from 'react'

class Canvas extends React.Component {
    constructor(props) {
        super(props);
        this.canvasRef = React.createRef();
    }

    componentDidUpdate() {
        // Draws a square in the middle of the canvas rotated
        // around the centre by this.props.angle
        const { angle } = this.props;
        const canvas = this.canvasRef.current;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        ctx.save();
        ctx.beginPath();
        ctx.clearRect(0, 0, width, height);
        ctx.translate(width / 2, height / 2);
        ctx.rotate((angle * Math.PI) / 180);
        if(angle > 90 && angle < 270 ) {
            ctx.fillStyle = 'RED';
        } else {
            ctx.fillStyle = '#4397AC';
        }
        ctx.fillRect(-width / 4, -height / 4, width / 2, height / 2);
        ctx.restore();
        ctx.font = '40px Arial';
        ctx.fillText(angle.toString(),0,150);
    }

    render() {
        return <canvas width="300" height="300" ref={this.canvasRef} />;
    }
}

export default Canvas
