import React from 'react';
import axios from '../../common/services/httpService';
import {Redirect} from "react-router-dom";
import Helmet from 'react-helmet'
import nyan from '../resources/nyan.gif'
import io from 'socket.io-client'
import './login.css'
import 'reactstrap'

// merk op dat je op de master zou kunnen komen, als je op login geraakt nadat een master heeft geconnect

class App extends React.Component {
    constructor() {
        super();
        //Binding allows the function to access the state of this component, no matter where it is invoked


        this.slave = this.slave.bind(this);

        //This allows us to display different pages without reloading
        this.state = {
            OS: "",
            toSlave: false,


        };


        // connect to the socket channel for login-clients
        this.loginChannel = io('/loginChannel');

        // boolean checking whether master is occupied

        // server informing client whether master is occupied
        this.loginChannel.on('master occupation state', (state)=>{
            this.setState({masterOccupied: state})
        });
        //this http request asks the server to update this client's token, which will be used to identify this client
        axios.get('/login').then((res) => {
        });
    }

    componentDidMount() {
        console.log(navigator);
        if (navigator.appVersion.indexOf("Win")!==-1) this.OSName="Windows";

        if (navigator.appVersion.indexOf("Ios")!==-1) this.OSName="IOS";
        if (navigator.appVersion.indexOf("Mac")!==-1) this.OSName="MacOS";
        if (navigator.appVersion.indexOf("X11")!==-1) this.OSName="UNIX";
        if (navigator.appVersion.indexOf("Linux")!==-1) this.OSName="Linux";
        if (navigator.appVersion.indexOf("Android")!==-1) this.OSName="Android";
        this.setState({OS: this.OSName})
    }

    //When the master button is clicked, switch to master, master is not already occupied.

    //When the slave button is clicked, switch to slave
    slave() {
        this.setState({
            toSlave: true,
            toOverview: false,
        })
    }


    render() {
        if (this.state.toSlave === true) {
            return <Redirect to='/slave'/>
        }

        return (
            <div>
                <h1>
                    {"You are on " + this.state.OS}
                </h1>
                <div >

                    <button name='slave' onClick={this.slave}>
                        Send
                    </button>

                </div>
                    {this.state.masterOccupied && <h2>Master has been occupied</h2>}
            </div>
        )
    }
}

export default App;
