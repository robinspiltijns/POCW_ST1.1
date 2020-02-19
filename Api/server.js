//Set up server, socket.io and express
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http); //maakt een socket instance
//Import needed functions and variables
const path = require('path');
const fs = require('fs');
const helpers = require('./helpers'); // importing helper functions
const {createCanvas, loadImage, Image} = require('canvas');
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
    // if socket hears a 'slaveJoin' it will update its users
    socket.on('slaveJoin', (user) => {
        //     console.log("user from slaveJoin: " + JSON.stringify(user));
        socket.join(user.id); //each slave is in a room, named after it's token
        if (!helpers.userAlreadyParticipating(user, users)) {
            users.push(user);
        }
        //using a template instead of users
        if (USE_TEMPLATES) {
            users = template_users;
        }
        // the master should be contacted that the users are updated
        masterChannel.emit('updateUsers', users);
        // the login will be contacted about the number of slaves
        loginChannel.emit('number of slaves', users.length);
        socket.on('timeData', (timeData) => { //happens per slave, dont start a countdown per slave, just give them their delay
            let t4 = new Date().getTime();
            let timeStamps = timeData;
            timeStamps.t4 = t4;
            let timeDiff = ((timeStamps.t2 - timeStamps.t1) - (timeStamps.t4 - timeStamps.t3)) / 2;

            users.forEach((user) => {
                if (user.id === timeData.id) {
                    helpers.setState(user, {
                        timeDiff: timeDiff
                    });
                    slaveChannel.to(user.id).emit('setState', {timeDiff: timeDiff});
                }
            });
            let timeToStart = new Date().getTime() + 2000;
            users.forEach((user) => {
                helpers.setState(user, {timeToStart: timeToStart});
            });
            slaveChannel.emit('setState', {timeToStart: timeToStart});
            slaveChannel.emit('startCountdown');
        });
    });


});

//MASTER
let masterOccupied = false; // boolean checking whether master is occupied



    //Triangulation
    socket.on('DisplayTriangulation', () => {
        canvasHelpers.resetCanvas(mainCanvas);
        if (users != undefined) {
            masterChannel.emit('updateUsers', users);
            canvasHelpers.prepareCanvasForTriangulation(mainCanvas, users); // FITTING THE COORDINATES TO THE CANVAS
            for (const slave of users) {
                const slaveTriangulationData = canvasHelpers.getSlaveTriangulationData(mainCanvas, slave);
                slaveChannel.to(slave.id).emit('setCanvas', slaveTriangulationData.data, slaveTriangulationData.width, slaveTriangulationData.height)
            }
            canvasHelpers.drawScreens(mainCanvas, users);
            const overviewTriangulationData = mainCanvas.toDataURL();
            overviewChannel.emit('setCanvas', overviewTriangulationData, mainCanvas.width, mainCanvas.height);
        }
        //Now that the users and the canvas are updated we can start cropping the main canvas.

        //Now that the slaves have got their respective images we can add the outlines of the slaves to the canvas and send it to overview
    });



http.listen(port, () => {
    console.log('listening on *:' + port);
});

