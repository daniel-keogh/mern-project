import React, { Component } from 'react';
import PlayerControls from './PlayerControls/PlayerControls';

class Player extends Component {
    constructor(props) {
        super(props);

        this.state = {
            epTitle: '',
            podTitle: '',
            src: '',
            skipTime: 30,
            currentTime: 0,
            duration: 0
        };

        // Will allow the component to access properties of the HTML <audio> element.
        this.audioElement = new React.createRef();
    }

    // Updates the state whenever the src prop changes (i.e. Whenever something new is about to be played).
    static getDerivedStateFromProps(props, state) {
        if (props.nowPlaying.src !== state.src) {
            return { ...props.nowPlaying };
        }
        return null;
    }

    render() {
        return (
            <React.Fragment>
                <PlayerControls
                    epTitle={this.state.epTitle}
                    podTitle={this.state.podTitle}
                    currentTime={this.state.currentTime}
                    duration={this.state.duration}
                    isPaused={this.audioElement.current ? this.audioElement.current.paused : true}
                    onReplay={this.handleReplay}
                    onForward={this.handleForward}
                    onPlayPauseClicked={this.handlePlayPauseClicked}
                    onSliderChange={this.handleSliderChange}
                />
                <audio
                    autoPlay
                    src={this.state.src}
                    onTimeUpdate={this.handleTimeUpdate}
                    ref={this.audioElement}
                >
                </audio>
            </React.Fragment>
        );
    }

    handlePlayPauseClicked = () => {
        if (this.audioElement.current.paused) {
            this.audioElement.current.play();
        } else {
            this.audioElement.current.pause();
        }
    }

    handleReplay = () => {
        // If near the start of the file, set the current time to zero (prevents currentTime being set to a negative number).
        if ((this.state.currentTime - this.state.skipTime) <= 0) {
            this.audioElement.current.currentTime = 0;
        } else {
            this.audioElement.current.currentTime -= this.state.skipTime;
        }
    }

    handleForward = () => {
        // If near the end of the file, set the current time to the total duration (prevents currentTime being set to a number greater than the duration).
        if ((this.state.currentTime + this.state.skipTime) >= this.state.duration) {
            this.audioElement.current.currentTime = this.state.duration;
        } else {
            this.audioElement.current.currentTime += this.state.skipTime;
        }
    }

    handleTimeUpdate = (e) => {
        this.setState({
            currentTime: e.target.currentTime,
            duration: this.audioElement.current.duration
        });
    }

    // Syncs the slider with the current playback position.
    handleSliderChange = (e, value) => {
        // Convert the slider's new value property from a % to a time.
        this.audioElement.current.currentTime = this.state.duration * value * 0.01;

        this.setState({
            currentTime: this.audioElement.current.currentTime
        });
    }
}

export default Player;