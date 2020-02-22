//Set up server, socket.io and express
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http); //maakt een socket instance
//Import needed functions and variables
const path = require('path');
const fs = require('fs');
const helpers = require('./helpers'); // importing helper functions
const json2csv = require('json2csv');
//The port on which this server will run.
const port = 8004;

let newLine= "\r\n";

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
    socket.on('userData', (data) => {
        console.log("got userdata: " + JSON.stringify(data));
        let csv = json2csv.parse(data).replace('"OS","Browser","timeDiff","KULNetwork"', '');
        console.log(csv);
        fs.appendFile('file.csv', csv, function (err) {
            if (err) throw err;
            console.log('The "data to append" was appended to file!');
        });
    })

    socket.on('getTimeDiffs', () => {
        console.log("got getTimeDiffs");
        slaveChannel.emit('timeDiffs', new Date().getTime());
    });

    socket.on('timeData', (timeData) => { //happens per slave, dont start a countdown per slave, just give them their delay
        console.log("got timeData")
        let t4 = new Date().getTime();
        let timeStamps = timeData;
        timeStamps.t4 = t4;
        let timeDiff = ((timeStamps.t2 - timeStamps.t1) - (timeStamps.t4 - timeStamps.t3)) / 2;
        loginChannel.emit('setState', {timeDiffSocket: timeDiff})
    });
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

