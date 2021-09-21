import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Slider from '@material-ui/core/Slider';
import Typography from '@material-ui/core/Typography';

import PauseCircleFilledIcon from '@material-ui/icons/PauseCircleFilled';
import PlayCircleFilledIcon from '@material-ui/icons/PlayCircleFilled';
import Forward30Icon from '@material-ui/icons/Forward30';
import Replay30Icon from '@material-ui/icons/Replay30';

import PlayerArtwork from '@/Player/PlayerArtwork';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '100%',
        padding: '8px 32px',
    },
    controlsLeft: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        paddingRight: '24px',
    },
    controlsCenter: {
        textAlign: 'center',
        width: '100%',
        minWidth: 0,
        display: 'flex',
        justifyContent: 'stretch',
        alignItems: 'center',
    },
    playIcon: {
        height: '52px',
        width: '52px',
    },
    seekIcon: {
        color: theme.palette.grey[700],
    },
    nowPlaying: {
        whiteSpace: 'nowrap',
    },
    seekbarContainer: {
        flexGrow: 1,
        paddingRight: '24px',
    },
    seekbar: {
        width: '90%',
    },
}));

function PlayerControls(props) {
    const classes = useStyles();

    return (
        <Card className={classes.root} elevation={3}>
            <div className={classes.controlsLeft}>
                <ButtonGroup variant="text">
                    <Button
                        onClick={props.onReplay}
                        className={classes.seekIcon}
                    >
                        <Replay30Icon fontSize="large" />
                    </Button>
                    <Button onClick={props.onPlayPauseClicked} color="primary">
                        {props.isPaused ? (
                            <PlayCircleFilledIcon
                                className={classes.playIcon}
                            />
                        ) : (
                            <PauseCircleFilledIcon
                                className={classes.playIcon}
                            />
                        )}
                    </Button>
                    <Button
                        onClick={props.onForward}
                        className={classes.seekIcon}
                    >
                        <Forward30Icon fontSize="large" />
                    </Button>
                </ButtonGroup>
            </div>

            <div className={classes.controlsCenter}>
                <div className={classes.seekbarContainer}>
                    <CardContent className={classes.nowPlaying}>
                        <Typography component="h6" variant="h6" noWrap>
                            {props.epTitle}
                        </Typography>
                        <Typography
                            color="textSecondary"
                            variant="subtitle2"
                            noWrap
                        >
                            {props.podTitle}
                        </Typography>
                    </CardContent>
                    <Slider
                        className={classes.seekbar}
                        defaultValue={0}
                        value={(props.currentTime / props.duration) * 100}
                        marks={[
                            {
                                value: 0,
                                label: formatSeconds(props.currentTime),
                            },
                            {
                                value: 100,
                                label: formatSeconds(props.duration),
                            },
                        ]}
                        onChange={props.onSliderChange}
                    />
                </div>

                {props.podId && props.podTitle && props.podArtwork ? (
                    <PlayerArtwork
                        id={props.podId}
                        title={props.podTitle}
                        artwork={props.podArtwork}
                    />
                ) : null}
            </div>
        </Card>
    );
}

/* Converts from seconds to HH:MM:SS. Necessary since the HTML <audio> element times (currentTime & duration) are in seconds.
 * Based on this S.O. answer: https://stackoverflow.com/a/37096512
 */
function formatSeconds(secs) {
    if (Number.isNaN(secs)) return '00:00';

    const h = String(Math.floor(secs / 3600)).padStart(2, '0');
    const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0');
    const s = String(Math.floor((secs % 3600) % 60)).padStart(2, '0');

    if (h === '00') {
        return `${m}:${s}`;
    }
    return `${h}:${m}:${s}`;
}

export default PlayerControls;
