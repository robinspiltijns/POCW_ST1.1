import React from 'react';
import io from 'socket.io-client';
import {Helmet} from 'react-helmet';
import cookie from 'react-cookies';

let animationStartTimeStamp = new Date();
let reachedMidPoint = false;
let trajectoryType = '';
let goesOver = false;
const browserWidth = window.innerWidth;
const browserHeight = window.innerHeight;
const angle1 = Math.atan2(browserHeight, browserWidth);
const angle2 = Math.atan2(browserHeight, -browserWidth);
const angle3 = Math.atan2(-browserHeight, -browserWidth) + 2 * Math.PI;
const angle4 = Math.atan2(-browserHeight, browserWidth) + 2 * Math.PI;

/* global cv */
class App extends React.Component {

    constructor() {
        super();
        //Connect to the socket-channel for slaves
        this.slaveChannel = io('/slaveChannel');
        this.state = {
            tricolor: '',
            color: '',
            canvasDataToDisplay: '',
            canvasWidth: '',
            canvasHeight: '',
            animationInfo: '',
            browserDimensions: [window.innerWidth, window.innerHeight], //werd gebruikt voor foto display
            //Load the cookie sent by the server into a variable.
            id: cookie.load('token'),
            isCounting: false,
            seconds: 10,
            timeDiff: 0
        };
        this.canvas = React.createRef();
        this.count = this.count.bind(this);
        this.init = this.init.bind(this);
        this.draw = this.draw.bind(this);
        //Let the server know that this client has joined, add it's token for identification.
    }

    componentDidMount() {
        console.log("my state:  " + JSON.stringify(this.state));
        this.slaveChannel.emit('slaveJoin', this.state
        );
        this.slaveChannel.on('setState', (state) => {
            console.log(JSON.stringify(state));
            this.setState(state);
        });
        this.slaveChannel.on('animationInfo', (animationInfo) => {
            this.setState({
                animationInfo: animationInfo,
            });
            this.init()
        });
        //The server wants to calculate the time-difference between our clock and the server's clock.
        this.slaveChannel.on('initialiseCountdown', (time) => {
            let receivedTime = new Date().getTime();
            this.slaveChannel.emit('timeData', {
                id: this.state.id,
                t1: time, //This is the time on which the server sent 'initialiseCountdown'
                t2: receivedTime,
                t3: new Date().getTime()
            });
        });

        //The server wants us to start our countdown at a given time, we take our time-difference into account.
        this.slaveChannel.on('startCountdown', () => {
            if (!this.state.isCounting) {

            console.log("going green");
            this.setState({
                isCounting: true,
                tricolor: 'green',
                color: 'green'
            });
            console.log("timeOut: ");
            console.log(this.state.timeToStart);
            console.log(this.state.timeDiff);
            console.log(-new Date().getTime());
            console.log((this.state.timeToStart + this.state.timeDiff - new Date().getTime()));
            setTimeout(() => {
                this.count();
                console.log("going yellow");
                this.setState({
                    color: 'yellow',
                    tricolor: 'yellow'
                })
            }, this.state.timeToStart + this.state.timeDiff - new Date().getTime())
        }
        });

        this.slaveChannel.on('requestSlaves', () => {
            this.slaveChannel.emit('slaveJoin', this.state);
        });

        this.slaveChannel.on('setCanvas', (mainCanvasData, width, height) => {
            this.setState({
                canvasDataToDisplay: mainCanvasData,
                canvasWidth: width,
                canvasHeight: height
            });
        })
    }

    timeout(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async count() {
        let i;
        for (i = this.state.seconds; i > 0; i--) {
            await this.timeout(1000); //wait 1 second and decrease the timer by 1
            this.setState({seconds: this.state.seconds - 1});
        }
        this.setState({
            color: 'blue',
            tricolor: 'blue'
        });
        setTimeout(() => {
            this.setState({
                seconds: 10,
                isCounting: false
            })
        }, 1000);
        this.slaveChannel.emit('finishCountdown')
    }

    componentDidUpdate() {
        this.drawCanvas();
    }

    //Animation

    init() {
        if (this.state.animationInfo) {
            const animationInfo = this.state.animationInfo;
            const toDir = animationInfo.toDir;
            const fromDir = animationInfo.fromDir;

            if (toDir !== '' && fromDir !== '') {
                goesOver = true;
            }
            if (toDir === '' && fromDir === '') {

                return; //NO DIRECTIONS SO NO ANIMATION
            }

            if (fromDir === '' && !goesOver) {
                trajectoryType = 'startPoint';
                animationStartTimeStamp = new Date();
                window.requestAnimationFrame(this.draw);
                return;
            }

            if (toDir === '' && !goesOver) {
                trajectoryType = 'endPoint';
                animationStartTimeStamp = new Date();
                window.requestAnimationFrame(this.draw);
                return;
            }

            if (goesOver){
                //first the midpoint has to be reached so trajectory type endpoint
                trajectoryType = 'endPoint';
                animationStartTimeStamp = new Date();
                window.requestAnimationFrame(this.draw);
                return;
            }
        }
    }

    draw() {
        //CANVAS INFO
        let browserHeight = this.state.browserDimensions[1];
        let browserWidth = this.state.browserDimensions[0];
        let cutOff = true;
        const ctx = this.canvas.current.getContext('2d');

        //ANIMATION INFO
        const radius = 30;
        const animationInfo = this.state.animationInfo;
        const toDir = animationInfo.toDir;
        const fromDir = animationInfo.fromDir;
        const velocity = animationInfo.velocity;

        let xPos = 0;
        let yPos = 0;

        //TIME RELATED
        const startTime = animationStartTimeStamp;
        const time = new Date();
        const timeDeltaSeconds = time.getSeconds() - startTime.getSeconds();
        const timeDeltaMilliSeconds = time.getMilliseconds() - startTime.getMilliseconds();

        //START POINT

        if (trajectoryType === 'startPoint') {
            const distance = velocity * timeDeltaSeconds + velocity / 1000 * timeDeltaMilliSeconds;
            const dx = Math.cos(toDir) * distance;
            const dy = Math.sin(toDir) * distance;
            const startX = browserWidth / 2;
            const startY = browserHeight / 2;
            xPos = dx + startX;
            yPos = dy + startY;
            if ((toDir < angle1 && toDir >= 0) || (toDir > angle4 && toDir < 2 * Math.PI)) {
                cutOff = (xPos - radius) >= browserWidth;
            }
            if (toDir >= angle1 && toDir < angle2) {
                cutOff = (yPos - radius) >= browserHeight;
            }
            if (toDir >= angle2 && toDir < angle3) {
                cutOff = (xPos + radius) <= 0;
            }
            if (toDir >= angle3 && toDir <= angle4) {
                cutOff = (yPos + radius) <= 0;
            }
            if (cutOff) {
                console.log('cut off');
                ctx.clearRect(0, 0, browserWidth, browserHeight);
                //this.slaveChannel.emit('animation done');
                return;
            }
        }

        if (trajectoryType === 'endPoint') {
            let totalDistance = 0;
            if ((fromDir < angle1 && fromDir >= 0) || (fromDir > angle4 && fromDir < 2 * Math.PI)) {
                totalDistance = Math.sqrt(browserWidth * browserWidth / 4 + Math.tan(fromDir) * browserWidth / 2 * Math.tan(fromDir) * browserWidth / 2) + radius;
            }
            if (fromDir >= angle1 && fromDir < angle2) {
                totalDistance = Math.sqrt(browserHeight * browserHeight / 4 + (1 / Math.tan(fromDir)) * browserHeight / 2 * (1 / Math.tan(fromDir)) * browserHeight / 2) + radius;

            }
            if (fromDir >= angle2 && fromDir < angle3) {
                totalDistance = Math.sqrt(browserWidth * browserWidth / 4 + Math.tan(fromDir) * browserWidth / 2 * Math.tan(fromDir) * browserWidth / 2) + radius;
            }
            if (fromDir >= angle3 && fromDir <= angle4) {
                totalDistance = Math.sqrt(browserHeight * browserHeight / 4 + (1 / Math.tan(fromDir)) * browserHeight / 2 * (1 / Math.tan(fromDir)) * browserHeight / 2) + radius;
            }
            const distance = totalDistance - velocity * timeDeltaSeconds - velocity / 1000 * timeDeltaMilliSeconds;
            if (distance <= 1){
                console.log('reached Midpoint');
                if (goesOver){
                    trajectoryType = 'startPoint';
                    animationStartTimeStamp = new Date();
                    //SWITCHING THE NEXT FRAME TO 'LEAVING THE MIDPOINT'
                    window.requestAnimationFrame(this.draw);
                }
                return;
            }
            const dx = Math.cos(fromDir) * distance;
            const dy = Math.sin(fromDir) * distance;
            const startX = browserWidth / 2;
            const startY = browserHeight / 2;
            xPos = dx + startX;
            yPos = dy + startY;
        }

        //CALCULATING TRAJECTORY

        //CLEARING THE FRAME
        ctx.clearRect(0, 0, browserWidth, browserHeight);

        //RENDERING THE FRAME
        ctx.beginPath();
        ctx.arc(xPos, yPos, radius, 0, 2 * Math.PI); // drawing the midpoint
        ctx.stroke();

        //CALLING THE NEXT FRAME
        window.requestAnimationFrame(this.draw)
    }

    //Canvas
    drawCanvas() {
        let browserHeight = this.state.browserDimensions[1];
        let browserWidth = this.state.browserDimensions[0];
        const canvas = this.canvas.current;
        const color = this.state.tricolor;
        const canvasDataToDisplay = this.state.canvasDataToDisplay;
        const ctx = canvas.getContext('2d');

        const animationInfo = this.state.animationInfo;

        ctx.clearRect(0, 0, browserWidth, browserHeight);

        //DRAWING THE TRIANGLE
        if (color) {
            ctx.beginPath();
            ctx.fillStyle = color;
            ctx.moveTo(0, 0);
            ctx.lineTo(browserWidth, 0);
            ctx.lineTo(0, browserHeight);
            ctx.fill();
            ctx.closePath();
        }

        if (canvasDataToDisplay) {
            const canvasWidth = this.state.canvasWidth;
            const canvasHeight = this.state.canvasHeight;
            const imgElement = new Image();
            imgElement.onload = function () {
                ctx.drawImage(imgElement, 0, 0, canvasWidth, canvasHeight, 0, 0, browserWidth, browserHeight);
            };
            imgElement.src = canvasDataToDisplay;

        }

    }

    render() {
        return (
            <div>
                <Helmet>
                    <style>{`body {background-color: ${this.state.color}; }`}</style>
                </Helmet>
                {this.state.hasImageToDisplay && <img width={window.innerWidth} src={this.state.toDisplay} alt=''/>}
                {this.state.isCounting && <h1>{this.state.seconds}</h1>}
                <canvas ref={this.canvas} width={this.state.browserDimensions[0]}
                        height={this.state.browserDimensions[1]}/>
                {this.state.isCounting && <div>{this.state.seconds}</div>}
            </div>
        )
    }
}

export default App;
