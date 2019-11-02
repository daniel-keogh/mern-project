import React, { Component } from 'react';
import Player from '../Player/Player';

class PlayerWrapper extends Component {
    state = { isQueued: false }

    render() {
        return (
            <div className="Player" style={!this.state.isQueued ? { display: 'none' } : null}>
                <Player />
            </div>
        );
    }
}

export default PlayerWrapper;