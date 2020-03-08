import Canvas from './Canvas'
import React from 'react'

class Animation extends React.Component {
    constructor(props) {
        super(props);
        this.state = { angle: 0 };
        this.updateAnimationState = this.updateAnimationState.bind(this);
        this.fpsAnimation = this.fpsAnimation.bind(this)
    }

    componentDidMount() {
        // this.rAF = requestAnimationFrame(this.updateAnimationState);
        this.fpsAnimation()
    }

    fpsAnimation() {

            setInterval(() => {
                if(this.props.running) {
                    this.setState(prevState => ({angle: prevState.angle + 1}));
                }
            }, 16)
    }

    updateAnimationState() {

            this.setState(prevState => ({angle: prevState.angle + 1}));
            this.rAF = requestAnimationFrame(this.updateAnimationState);

    }

    componentWillUnmount() {
        cancelAnimationFrame(this.rAF);
    }

    render() {
        return <Canvas angle={this.state.angle} />;
    }
}

export default Animation
