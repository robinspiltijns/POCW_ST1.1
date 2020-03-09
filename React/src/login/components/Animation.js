import Canvas from './Canvas'
import React from 'react'

class Animation extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            angle: 0,
            frame: 0,
        };
        this.updateAnimationState = this.updateAnimationState.bind(this);
        this.fpsAnimation = this.fpsAnimation.bind(this);
        this.reset = this.reset.bind(this);
    }

    componentDidMount() {
        // this.rAF = requestAnimationFrame(this.updateAnimationState);
        this.fpsAnimation()
    }

    fpsAnimation() {

            setInterval(() => {
                if(this.props.running) {
                    this.setState(prevState => ({
                        angle: (prevState.angle + 1)%360,
                        frame: (prevState.frame + 1)
                    }));
                }
            }, 32)
    }

    updateAnimationState() {

            this.setState(prevState => ({angle: prevState.angle + 1}));
            this.rAF = requestAnimationFrame(this.updateAnimationState); //test dit nog

    }

    reset() {
        this.setState({
            angle: 0,
            frame: 0
        })
    }

    componentWillUnmount() {
        cancelAnimationFrame(this.rAF);
    }

    getFrame() {
        return this.state.frame
    }

    render() {
        return <Canvas angle={this.state.angle} />;
    }
}

export default Animation
