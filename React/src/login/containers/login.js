import React from 'react';
import axios from '../../common/services/httpService';
import {Redirect} from "react-router-dom";
import io from 'socket.io-client'
import './login.css'
import 'reactstrap'

// merk op dat je op de master zou kunnen komen, als je op login geraakt nadat een master heeft geconnect
const n = 2; //amount of checkboxes

class App extends React.Component {
    constructor() {
        super();
        //Binding allows the function to access the state of this component, no matter where it is invoked
        this.send = this.send.bind(this);
        this.no = this.no.bind(this);
        this.yes = this.yes.bind(this);
        this.getOS = this.getOS.bind(this);
        this.handleChange = this.handleChange.bind(this);
        //This allows us to display different pages without reloading
        this.state = {
            OS: "",
            Browser: "",
            latency: 0,
            KULNetwork: false,
            toEnd: false,
            adjustedLatency: false,
            chosen: false
        };
        // connect to the socket channel for login-clients
        this.loginChannel = io('/loginChannel');
        axios.get('/login').then((res) => {
        });
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
        //Latency
        setInterval(() => {
            this.startTime = Date.now();
            console.log("made this.startTime: " + this.startTime);
            this.loginChannel.emit('a');
        }, 2000);
        this.loginChannel.on('b', () => {
            let now = Date.now();
            console.log('this.startTime: ' + this.startTime);
            console.log('date.now: ' + now);

            this.totalLatency = Date.now() - this.startTime;
            if (this.state.adjustedLatency) {
                this.setState({latency: 0.5 * this.state.latency + 0.5 * this.totalLatency / 2}) //0.5 to cancel random peaks
            } else {
                this.setState({
                    latency: this.totalLatency / 2,
                    adjustedLatency: true
                })
            }
        });
        //OS
        let OS = this.getOS();
        console.log("OS: " + OS);
        this.setState({OS: OS});

        //BROWSER
        let browser = this.getBrowser();
        console.log("browser: " + browser);
        this.setState({Browser: browser});
    }

    //When the master button is clicked, switch to master, master is not already occupied.

    //When the slave button is clicked, switch to slave
    send() {
        this.loginChannel.emit('userData', {
            OS: this.state.OS,
            Browser: this.state.Browser,
            KULNetwork: this.state.KULNetwork,
            latency: this.state.latency,
            clientTime: new Date().getTime()
        });
        this.setState({
            toEnd: true,
        })
    }

    yes() {
        this.setState({
            KULNetwork: true,
            chosen: true
        })
    }

    no() {
        this.setState({
            KULNetwork: false,
            chosen: true
        })
    }

    handleChange(event) {
        this.setState({KULNetwork: event.target.value});
    }


    render() {
        if (this.state.toEnd === true) {
            return <Redirect to='/slave'/>
        }

        return (
            <div>
                <ul>
                    <li> {"Your OS: " + this.state.OS} </li>
                    <li> {"Your browser: " + this.state.Browser} </li>
                    <li> {"Your latency: " + this.state.latency} </li>
                    <li>  {"Time difference with WTA: " + this.state.diffWTA} </li>
                </ul>
                <div>
                    <h3 hidden={this.state.chosen}>
                        {"Are you currently connected to the KUL network?"}
                    </h3>
                    <button hidden={this.state.chosen} name='yes' onClick={this.yes}>
                        Yes
                    </button>
                    <button hidden={this.state.chosen} name='no' onClick={this.no}>
                        No
                    </button>
                </div>
                <div>
                    <h3>
                        {"Thank You"}
                    </h3>
                    <button name='send' onClick={this.send} disabled={!this.state.chosen}>
                        Send
                    </button>
                    <div hidden={this.state.chosen}>Please indicate whether you are on a KUL network or not.</div>
                </div>
            </div>
        )
    }
}

export default App;
