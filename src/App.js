import React, { Suspense, useContext } from 'react';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';

import AuthContext from './store/authContext';
import NowPlayingContext from './store/nowPlayingContext';

import Player from './components/Player/Player';

import './App.css';

const Auth = React.lazy(() => import('./components/Auth/Auth'));
const Podcast = React.lazy(() => import('./components/Podcast/Podcast'));
const Discover = React.lazy(() => import('./components/Discover/Discover'));
const Profile = React.lazy(() => import('./components/Profile/Profile'));
const Subscriptions = React.lazy(() => import('./components/Subscriptions/Subscriptions'));

function App() {
    const nowPlaying = useContext(NowPlayingContext);
    const auth = useContext(AuthContext);

    return (
        <BrowserRouter>
            <div className="App">
                <div className="Main">
                    <div className="Body">
                        <Suspense fallback={<></>}>
                            {!auth.isAuthorized ? (
                                <Switch>
                                    <Route path="/auth">
                                        <Auth />
                                    </Route>
                                    <Route path="/">
                                        <Redirect to="/auth" />
                                    </Route>
                                </Switch>
                            ) : (
                                <Switch>
                                    <Route path="/subscriptions">
                                        <Subscriptions />
                                    </Route>
                                    <Route path="/discover">
                                        <Discover />
                                    </Route>
                                    <Route path="/profile">
                                        <Profile />
                                    </Route>
                                    <Route path="/podcast/:id">
                                        <Podcast />
                                    </Route>
                                    <Route path="/">
                                        <Redirect to="/subscriptions" />
                                    </Route>
                                </Switch>
                            )}
                        </Suspense>
                    </div>
                </div>
                <div
                    className="Player"
                    style={
                        !auth.isAuthorized || nowPlaying.src === ''
                            ? { display: 'none' }
                            : null
                    }
                >
                    <Player nowPlaying={nowPlaying} />
                </div>
            </div>
        </BrowserRouter>
    );
}

export default App;
