//Set up server, socket.io and express
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http); //maakt een socket instance
//Import needed functions and variables
const path = require('path');
const fs = require('fs');
const helpers = require('./helpers'); // importing helper functions
//The port on which this server will run.
const port = 8004;

app.get('/login', (req, res) => {
    helpers.updateCookies(req, res)
});

//Serve the build folder (this is only needed when running on the KUL server. Leaving it here doesn't break anything tho.
app.use(express.static(path.join(__dirname, 'build')));

// Down here, we create different namespaces take so that, while we have only need one connection (socket), we still can
// separate the different communication channels (the different namespaces). As this is server side,
// the channels written here send messages to our clients and listen to messages from our clients.

//Namespaces
const loginChannel = io.of('/loginChannel');
const slaveChannel = io.of('/slaveChannel');


//LOGIN
loginChannel.on('connection', (socket) => {
    socket.emit("master occupation state");
});

//SLAVE
slaveChannel.on('connection', (socket) => {


});

//MASTER
let masterOccupied = false; // boolean checking whether master is occupied



    //Triangulation




http.listen(port, () => {
    console.log('listening on *:' + port);
});

