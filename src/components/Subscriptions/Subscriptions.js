import React, { Component } from 'react';
import axios from 'axios';
import { Grid } from '@material-ui/core';
import Welcome from '../Welcome/Welcome';
import AddNew from '../AddNew/AddNew';
import SubscriptionItem from './SubscriptionItem/SubscriptionItem';
import NavBar from '../NavBar/NavBar';
import "./Subscriptions.css";

class Subscriptions extends Component {
    constructor(props) {
        super(props);

        this.state = {
            subscriptions: [],
            noSubscriptions: false
        };
    }

    componentDidMount() {
        axios.get(`http://localhost:4000/api/subscriptions`)
            .then(res => {
                if (res.status !== 200 || res.data.subscriptions.length === 0) {
                    throw new Error();
                } else {
                    this.setState({
                        subscriptions: res.data.subscriptions,
                        noSubscriptions: false
                    });
                }
            })
            .catch(() => {
                this.setState({
                    noSubscriptions: true
                });
            });
    }

    render() {
        const header = <NavBar title="Subscriptions" />;

        if (this.state.noSubscriptions) {
            return (
                <React.Fragment>
                    {header}
                    <Grid container justify="center" style={{ height: "100%", alignItems: "center" }}>
                        <Grid item xs={12} sm={6} md={4} lg={3}>
                            <Welcome onAddNewClicked={this.handleAddNewClicked} style={{ height: "100%" }} />
                        </Grid>
                    </Grid>
                </React.Fragment>
            );
        }

        const subs = this.state.subscriptions.map(sub => {
            return (
                <SubscriptionItem
                    key={sub._id}
                    id={sub._id}
                    name={sub.name}
                    author={sub.artist}
                    artwork={sub.artwork}
                    history={this.props.history}
                />
            );
        });

        return (
            <React.Fragment>
                {header}
                <div className="subs-grid-wrapper">
                    <div className="subs-grid">
                        {subs}
                    </div>
                </div>
                <AddNew onAddNewClicked={this.handleAddNewClicked} />
            </React.Fragment>
        );
    }

    handleAddNewClicked = () => {
        // Pass the ID's of subscribed podcasts as an array in order to tell which ones the user is already subscribed to.
        this.props.history.push({
            pathname: '/discover',
            state: { subscriptions: this.state.subscriptions.map(sub => sub._id) }
        });
    }
}

export default Subscriptions;