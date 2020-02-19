//Set up server, socket.io and express
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http); //maakt een socket instance
//Import needed functions and variables
const path = require('path');
const fs = require('fs');
const main = require('../image_differences/main'); // importing functionalities for image processing
const helpers = require('./helpers'); // importing helper functions
const {createCanvas, loadImage, Image} = require('canvas');
//The port on which this server will run.
const port = 8004;
const canvasHelpers = require('./canvas');

let animationArray = [];
let index = 0;

const USE_TEMPLATES = false;
const template_users = [helpers.generate_user("ddu8CUZ9f5Mm3sGrZqZY", 10000, 10000, 1440, 820, Math.PI/4),
    helpers.generate_user("ywsII6aTw8oD5v8tV1UO", 10000, 20000, 1440, 820, 0),
    helpers.generate_user(3, 20000, 10000, 1440, 820, 0)];
    // helpers.generate_user(4, 550, 400, 144 * 2, 82 * 2, 0)];
const test_Scale = 10;
template_users[0].browserDimensions = [820, 1140];
template_users[1].browserDimensions = [820, 1140];
template_users[2].browserDimensions = [820, 1440];
// template_users[3].browserDimensions = [82 * test_Scale, 144 * test_Scale];
// MAIN CANVAS

const mainCanvas = createCanvas(1, 1); //intializing the canvas;
const ctxMain = mainCanvas.getContext('2d');

/*
Serve the react code to the client
 */

// Data that describes the state of the entire program.
//users = [];
let users = [];
let basePic = '';
let iterator = 0;
let usersWithDelay = 0;
let temp_users;

//When a request to login is sent, give the user a cookie if it doesn't already have one.
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
const masterChannel = io.of('/masterChannel');
const overviewChannel = io.of('/overviewChannel');

//LOGIN
loginChannel.on('connection', (socket) => {
    socket.emit("master occupation state", masterOccupied);
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

    socket.on('animation done', () => {
        console.log("ANIMATION DONE");
        index += 1;
        canvasHelpers.animate(slaveChannel, animationArray, index);
    });


    socket.on('disconnect', () => {
        users = [];
        slaveChannel.emit('requestSlaves');
        masterChannel.emit('updateUsers', users); //time-out moet hier niet denk ik?
        iterator = 0;
        masterChannel.emit('resetRecognition')
    })
});

//MASTER
let masterOccupied = false; // boolean checking whether master is occupied

masterChannel.on('connection', (socket) => {
    //No duplicate masters
    masterOccupied = true;
    console.log('master connected');
    // emitting to LOGIN namespace that master has connected
    loginChannel.emit('master occupation state', masterOccupied);
    //Keeping track of users
    masterChannel.emit('updateUsers', users);
    socket.on('requestUsers', () => {
        masterChannel.emit('updateUsers', users);
    });
    // if master disconnects, the boolean masterOccupied is set to false.
    socket.on('disconnect', () => {
        masterOccupied = false; // this now has not much use as there can be multiple masters
        loginChannel.emit('master occupation state', masterOccupied);
        console.log("master disconnected");
    });
    //Scanning screens
    socket.on('startPictures', () => {
        for (let user of users) {
            helpers.setState(user, {
                tricolor: '',
                color: 'white',
                canvasDataToDisplay: '',
                canvasWidth: '',
                canvasHeight: '',
            });
            slaveChannel.to(user.id).emit('setState', {
                tricolor: '',
                color: 'white',
                canvasDataToDisplay: '',
                canvasWidth: '',
                canvasHeight: '',});
        }
        masterChannel.emit('screensWhite');
    });
    socket.on('picture', async (dataUri) => {
        if (iterator === 0) {
            basePic = dataUri;
        } else {
            users[iterator - 1].img = dataUri;
            slaveChannel.to(users[iterator - 1]).emit('setState', users[iterator - 1]);
        }
        iterator++;
        if (iterator === users.length + 1) {
            helpers.setState(users[iterator - 2], {tricolor: ''});
            slaveChannel.to(users[iterator - 2].id).emit('setState', users[iterator - 2]);
            masterChannel.emit('gotAllPics');
            if (!USE_TEMPLATES) {
                temp_users = await main.scanScreen(basePic, users);
                let i, j;
                for (i = 0; i < temp_users.length; i++) {
                    for (j = 0; j < users.length; j++) {
                        let temp_user = temp_users[i];
                        let user = users[j];
                        if (user.id === temp_user.id) {
                            helpers.setState(user, temp_user);
                            slaveChannel.to(user.id).emit('setState', user);
                        }
                    }
                }
            }
            masterChannel.emit('updateUsers', users);
            return
        }
        helpers.switchScreen(users, iterator, slaveChannel);
        masterChannel.emit('nextScreen')
    });
    //Countdown
    socket.on('getTimeDiffs', () => {
        slaveChannel.emit('initialiseCountdown', new Date().getTime());
    });

    socket.on('DisplayImage', (imageData) => {
        console.log("in displayImage");
        canvasHelpers.resetCanvas(mainCanvas);
        loadImage(imageData).then(
            (image) => {
                if (users != undefined) {
                    masterChannel.emit('updateUsers', users);
                    ctxMain.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
                    canvasHelpers.prepareCanvasForImageDisplay(mainCanvas, users, image);
                    for (const slave of users) {
                        const slaveImageData = canvasHelpers.getSlaveImageData(mainCanvas, slave);
                        console.log("slaveImageData.width: " + slaveImageData.width);
                        console.log("slaveImageData.height: " + slaveImageData.height);
                        slaveChannel.to(slave.id).emit('setCanvas', slaveImageData.data, slaveImageData.width, slaveImageData.height)
                    }
                }
                canvasHelpers.drawScreens(mainCanvas, users);
                const overviewImageData = mainCanvas.toDataURL();
                overviewChannel.emit('setCanvas', overviewImageData, mainCanvas.width, mainCanvas.height);
            }

        )
    });


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

    //Animation

    socket.on('DisplayAnimation', () => {
        index = 0;
        animationArray = [];
        canvasHelpers.resetCanvas(mainCanvas);
        if (users != undefined){
            helpers.triangulate(users);
            animationArray = canvasHelpers.getAnimationArray(users, 5, 200);
            console.log(animationArray);
            canvasHelpers.animate(slaveChannel, animationArray, index);
        }
    });

});


http.listen(port, () => {
    console.log('listening on *:' + port);
});

