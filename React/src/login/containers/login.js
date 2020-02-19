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
        this.master = this.master.bind(this);
        this.slave = this.slave.bind(this);
        this.overview = this.overview.bind(this);
        //This allows us to display different pages without reloading
        this.state = {
            toMaster: false,
            toSlave: false,
            toOverview: false,
            masterOccupied: false
        };

        // connect to the socket channel for login-clients
        this.loginChannel = io('/loginChannel');

        // boolean checking whether master is occupied
        this.masterOccupied = true;
        // server informing client whether master is occupied
        this.loginChannel.on('master occupation state', (state)=>{
            this.setState({masterOccupied: state})
        });
        //this http request asks the server to update this client's token, which will be used to identify this client
        axios.get('/login').then((res) => {
        });
    }

    //When the master button is clicked, switch to master, master is not already occupied.
    master() {
        if (! this.state.masterOccupied) {
            this.setState({
                toMaster: true
            })
        }
    }

    //When the slave button is clicked, switch to slave
    slave() {
        this.setState({
            toSlave: true,
            toOverview: false,
        })
    }

    overview() {
        this.setState({
            toOverview: true,
            toSlave: false,
        })
    }

    render() {
        if (this.state.toMaster === true) {
            return <Redirect to='/master'/>
        }
        if (this.state.toSlave === true) {
            return <Redirect to='/slave'/>
        }

        if(this.state.toOverview === true) {
            return <Redirect to='/overview'/>
        }
        return (
            <div>
                <Helmet>
                    <style>{'body { background-color: #032F64; }'}</style>
                </Helmet>
                <h1>
                    Multicat
                </h1>
                <img className='center' src={nyan} alt = ''/>
                <div >
                    <button name='master' onClick={this.master}>
                        Master
                    </button>
                    <button name='slave' onClick={this.slave}>
                        Slave
                    </button>
                    <button name='overview' onClick={this.overview}>
                        Overview
                    </button>
                </div>
                    {this.state.masterOccupied && <h2>Master has been occupied</h2>}
            </div>
        )
    }
}

export default App;
