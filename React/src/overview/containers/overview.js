import React from 'react';
import io from 'socket.io-client'
import convertCanvasData from '../../common/convertCanvasData'

class App extends React.Component {
    constructor() {
        super();
        this.overviewChannel = io('/overviewChannel');
        this.state = {
            canvasDataToDisplay: '',
            canvasWidth: '',
            canvasHeight: '',
            browserDimensions: [window.innerWidth, window.innerHeight]
        };
        this.canvas = React.createRef();
    }

    componentDidMount() {
        this.overviewChannel.on('overviewUpdate', command => {
            this.setState({
                users: command.users
            });
        });
        this.overviewChannel.on('setCanvas', (mainCanvasData, width, height) => {
            this.setState({
                canvasDataToDisplay: mainCanvasData,
                canvasWidth: width,
                canvasHeight: height
            })
        })
    }


    componentDidUpdate() {
        this.drawCanvas()
    }

    drawCanvas() {

        const canvas = this.canvas.current;
        const canvasToDisplay = this.state.canvasDataToDisplay;
        const ctx = canvas.getContext('2d');
        const browserWidth = this.state.browserDimensions[0];
        const browserHeight = this.state.browserDimensions[1];

        ctx.clearRect(0, 0, browserWidth, browserHeight);
        if (canvasToDisplay) {
            const canvasWidth = this.state.canvasWidth;
            const canvasHeight = this.state.canvasHeight;

            const widthScale = browserWidth/canvasWidth;
            const heightScale = browserHeight/canvasHeight;

            const scale = Math.min(widthScale, heightScale);

            const imgElement = new Image();
            imgElement.onload = function () {
                ctx.drawImage(imgElement, 0, 0, canvasWidth, canvasHeight, 0, 0, scale * canvasWidth, scale * canvasHeight);
            };
            imgElement.src = canvasToDisplay;
        }
    }

    render() {
        return (
            <div>
                <canvas ref={this.canvas} width={this.state.browserDimensions[0]} height={this.state.browserDimensions[1]}/>
            </div>
        )
    }
}

export default App;
