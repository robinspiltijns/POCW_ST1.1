import React from 'react';
import axios from '../../common/services/httpService';
import {Redirect} from "react-router-dom";
import io from 'socket.io-client'
import './login.css'
import 'reactstrap'
import Animation from "../components/Animation";

// merk op dat je op de master zou kunnen komen, als je op login geraakt nadat een master heeft geconnect
const n = 2; //amount of checkboxes
let initialChecks = 0;
let checks = 0;
let interval = 500;

class App extends React.Component {
    constructor() {
        super();
        this.sendA = this.sendA.bind(this);
        this.start = this.start.bind(this);
        this.toggleAnimation = this.toggleAnimation.bind(this);
        this.syncAnimation = this.syncAnimation.bind(this);
        this.resetAnimation = this.resetAnimation.bind(this);
        //This allows us to display different pages without reloading
        this.canvas = React.createRef();
        this.animation = React.createRef();
        this.state = {
            animate: false,
            backgroundColor: 'WHITE',
            offset: 0,
            OS: "",
            Browser: "",
            latency: 0,
            toEnd: false,
            browserDimensions: [window.innerWidth, window.innerHeight]
        };
        // connect to the socket channel for login-clients
        this.loginChannel = io('/loginChannel');
    }

    getOS() {
        this.OSName = '';
        if (navigator.appVersion.indexOf("Mobile") !== -1) {
            if (navigator.appVersion.indexOf("iPhone") !== -1) this.OSName = "IOS";
            if (navigator.appVersion.indexOf("Android") !== -1) this.OSName = "Android";
        } else {
            if (navigator.appVersion.indexOf("X11") !== -1) this.OSName = "UNIX";
            if (navigator.appVersion.indexOf("Linux") !== -1) this.OSName = "Linux";
            if (navigator.appVersion.indexOf("Mac") !== -1) this.OSName = "MacOS";
            if (navigator.appVersion.indexOf("Win") !== -1) this.OSName = "Windows";
        }
        return this.OSName
    }

    getBrowser() {
        this.BrowserVersion = '';
        if (navigator.appVersion.indexOf("Opera") !== -1) this.BrowserVersion = "Opera";
        else if (navigator.appVersion.indexOf("Edge") !== -1) this.BrowserVersion = "Edge";
        else if (navigator.appVersion.indexOf("Chrome") !== -1) this.BrowserVersion = "Chrome";
        else if (navigator.appVersion.indexOf("Safari") !== -1) this.BrowserVersion = "Safari";
        else if (navigator.appVersion.indexOf("FireFox") !== -1) this.BrowserVersion = "FireFox";
        else if (navigator.appVersion.indexOf("MSIE") !== -1) this.BrowserVersion = "Internet Explorer";
        else if (navigator.appCodeName.indexOf("Mozilla") !== -1) this.BrowserVersion = "Firefox";
        return this.BrowserVersion
    }


    componentDidMount() {
        this.offset = 0;
        //Latency
        this.sendA();
        this.loginChannel.on('b', (serverTime) => {
            let now = Date.now();
            this.latency = (now - this.startTime)/2;
            this.currentOffset = now - serverTime - this.latency;
           // console.log('latency: ' + this.latency)
          //  console.log('latest offset: ' + this.currentOffset)
            initialChecks++;
            if(initialChecks > 10) { //initial checks give inaccurate values
               // console.log('growing factor in avg: ' + checks*this.offset)
                this.offset = (checks*this.offset + this.currentOffset)/(checks +1);
               // console.log('latest average: ' + this.offset)
                checks++
            } else {
               // console.log('in initial checks')
            }
            this.setState({
                offset: this.offset
            })
            interval = this.latency*20
        })
        this.loginChannel.on('go', (date) => {
            this.setState({backgroundColor: 'GREEN'});
            console.log('date: ' + date)
            console.log('offset: ' + this.state.offset)
            console.log('now: ' + Date.now())
            console.log('total: ' + date - this.state.offset - Date.now())
            setTimeout(() => {
                this.setState({backgroundColor: 'BLUE'})
            }, (date + this.state.offset - Date.now()))
        });
        this.loginChannel.on('startAnimation', (startTime) => {
            this.resetAnimation();build
            setTimeout(() => {
                this.setState({animate: 'true'})
            }, (startTime + this.state.offset - Date.now()))
        });
        }

    sendA() {
        setTimeout(() => {
            this.startTime = Date.now();
            this.loginChannel.emit('a');
            this.sendA()
        }, interval)
    }

    start() {
        this.loginChannel.emit('start')
    }

    toggleAnimation() {
        this.setState(prevState => ({animate: !prevState.animate}))
    }

    syncAnimation() {
        this.loginChannel.emit('requestAnimation')
    }

    resetAnimation() {
        this.animation.current.reset()
    }

    render() {
        if (this.state.toEnd === true) {
            return <Redirect to='/slave'/>
        }

        return (
            <div style={{
                backgroundColor: this.state.backgroundColor,
                height: 1000
            }}>
                <div>{this.state.offset}</div>
                <div>
                    <button onClick={this.start}> START </button>
                    <button onClick={this.toggleAnimation}>Toggle Animation</button>
                    <button onClick={this.syncAnimation}>Sync Animation</button>
                    <button onClick={this.resetAnimation}>Reset Animation</button>
                </div>

                <Animation ref={this.animation} running = {this.state.animate}/>
            </div>
        )
    }
}

export default App;
