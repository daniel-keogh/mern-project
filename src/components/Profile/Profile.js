import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import NavBar from '../NavBar/NavBar';
import AuthContext from '../../store/authContext';
import DangerCard from './DangerCard';
import ProfileCard from './ProfileCard';
import axios from '../../config/axios';

const useStyles = makeStyles((theme) => ({
    section: {
        marginTop: theme.spacing(3),
        marginBottom: theme.spacing(4),
    },
    sectionTitle: {
        marginBottom: theme.spacing(1),
    },
}));

function Profile() {
    const classes = useStyles();
    const history = useHistory();
    const authContext = useContext(AuthContext);

    const [profileUpdated, setProfileUpdated] = useState(false);
    const [profileInfo, setProfileInfo] = useState({
        email: '',
        registeredSince: null,
        subscriptions: 0,
    });

    useEffect(() => {
        if (!authContext.userId) return;

        axios.get(`/api/users/${authContext.userId}`).then((res) => {
            const { email, registeredSince, subscriptions } = res.data;

            setProfileInfo({
                email,
                registeredSince,
                subscriptions: subscriptions.length,
            });

            setProfileUpdated(false);
        });
    }, [authContext.userId, profileUpdated]);

    const handleProfileUpdated = () => setProfileUpdated(true);

    const handleLogout = () => {
        authContext.logout();
        history.replace('/auth');
    };

    return (
        <React.Fragment>
            <NavBar title="Profile" />
            <Container maxWidth="sm">
                <section className={classes.section}>
                    <Typography
                        variant="h5"
                        component="h5"
                        className={classes.sectionTitle}
                    >
                        Profile
                    </Typography>
                    <ProfileCard
                        email={profileInfo.email}
                        registeredSince={profileInfo.registeredSince}
                        subscriptions={profileInfo.subscriptions}
                        onLogout={handleLogout}
                    />
                </section>
                <section className={classes.section}>
                    <Typography
                        variant="h5"
                        component="h5"
                        className={classes.sectionTitle}
                    >
                        Danger Area
                    </Typography>
                    <DangerCard
                        onProfileUpdated={handleProfileUpdated}
                        onProfileDeleted={handleLogout}
                    />
                </section>
            </Container>
        </React.Fragment>
    );
}

export default Profile;
