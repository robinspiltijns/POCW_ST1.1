import React from 'react';
import io from 'socket.io-client'
import './master.css'
import Camera, {FACING_MODES} from 'react-html5-camera-photo';
import 'react-html5-camera-photo/build/css/index.css';
import FileBase64 from 'react-file-base64';


class App extends React.Component {

    constructor() {
        super();
        this.state = {
            users: [],
            angle: '',
            todoMessage: "Press start when all slaves are connected.",
            showCamera: false,
            pictureToDisplay: '',
            displayMessage:'',
        };
        //Connect to the socket channel for master-clients.
        this.masterChannel = io('/masterChannel');
        //Binding allows the function to access the state of this component, no matter where it is invoked
        this.start = this.start.bind(this);
        this.getTimeDiffs = this.getTimeDiffs.bind(this);
        this.triangulate = this.triangulate.bind(this);
        this.displayImage = this.displayImage.bind(this);
        this.displayAnimation = this.displayAnimation.bind(this);
    }

    componentDidMount() { //When the component is mounted, start listening for socket commands.
        //Keeping user-list up to date
        this.masterChannel.on('updateUsers', (users) => {
            let messageToDisplay = '';
            for (const user of users){
                messageToDisplay = messageToDisplay + user.id + ': ' + JSON.stringify(user.topRight) + ', ';
            }
            this.setState({
                users: users,
                displayMessage: messageToDisplay
            });
        });
        //The server keeps us up-to-date on the status of the picture-taking process.
        this.masterChannel.on('screensWhite', () => {
            this.setState({todoMessage: 'Please take a picture with all white screens in it'})
        });
        //The server confirms that the previous picture has been taken and that the next screen should be red.
        this.masterChannel.on('nextScreen', () => {
            this.setState({todoMessage: 'If the next screen is red, please take a picture'})
        });
        //The server confirms that all pictures have been taken.
        this.masterChannel.on('gotAllPics', () => {
            this.setState({
                showCamera: false,
                todoMessage: 'All pictures have been taken'
            });
        });
        this.masterChannel.on('resetRecognition', () => {
            this.setState({
                showCamera: false,
                todoMessage: 'A slave disconnected, please start again.'
            });
        });
    }

    //When the picture has been taken, emit an event to the server with the picture as data (in base64).
    onTakePhoto(dataUri) {
        this.masterChannel.emit('picture', dataUri);
        console.log(dataUri)
    }

    //When the user wants to start, show the camera and let the server know.
    start() {
        this.setState({showCamera: true});
        //Let the server know that we will start taking pictures
        this.masterChannel.emit('startPictures');
    }

    //Let the server know we want to start a countdown on the clients.
    getTimeDiffs() {
        this.masterChannel.emit('getTimeDiffs');
    }

    //Let the server know we want to show off triangulation.
    triangulate() {
        this.masterChannel.emit('DisplayTriangulation');
    }

    triangulateTemplates() {
        this.masterChannel.emit('DisplayTemplateTriangulation');
    }

    //uploading image
    getFiles(files){
        this.setState({ pictureToDisplay: files });
    }

    //request slaves to display images
    displayImage() {
        const imageData = this.state.pictureToDisplay.base64;
        this.masterChannel.emit('DisplayImage', imageData);
    }

    displayAnimation() {
        this.masterChannel.emit('DisplayAnimation');
    }

    render() {
        return (
            <div>
                <button onClick={this.start}>Start</button>
                <h1>{this.state.todoMessage}</h1>
                <div className='content'>
                    {this.state.showCamera && <Camera
                        onTakePhoto={(dataUri) => {
                            this.onTakePhoto(dataUri);
                        }} idealFacingMode={FACING_MODES.ENVIRONMENT} isImageMirror={false}
                    />}
                </div>
                <button onClick={this.getTimeDiffs}>Start countdown</button>
                <button onClick={this.triangulate}>Triangulate</button>
                <button onClick={this.displayImage}>Display Image</button>
                <button onClick={this.displayAnimation}>Animate</button>
                <FileBase64
                    multiple={ false }
                    onDone={ this.getFiles.bind(this) } />
                {this.state.displayMessage}
            </div>

        )
    }
}

export default App;
