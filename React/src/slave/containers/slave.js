import React from 'react';
import io from 'socket.io-client';
import {Helmet} from 'react-helmet';
import cookie from 'react-cookies';

/* global cv */
class App extends React.Component {

    constructor() {
        super();
        //Connect to the socket-channel for slaves
        this.slaveChannel = io('/slaveChannel');
        this.state = {
            id: cookie.load('token'),
        };
    }

    componentDidMount() {
        console.log("my state:  " + JSON.stringify(this.state));
        this.slaveChannel.emit('slaveJoin', this.state
        );
        this.slaveChannel.on('setState', (state) => {
            console.log(JSON.stringify(state));
            this.setState(state);
        });
    }

    render() {
        return (
            <div>
                <Helmet>
                    <style>{`body {background-color: ${this.state.color}; }`}</style>
                </Helmet>
                <h1>Thanks!</h1>
            </div>
        )
    }
}

export default App;
