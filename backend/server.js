const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const FeedParser = require('feedparser');
const mongoose = require('mongoose');
const request = require('request');
const axios = require('axios');

const app = express();
const PORT = 4000;

const mongodb = require('./config/keys').mongoURI;
mongoose.connect(mongodb, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const PodcastModel = require('./models/podcast');

app.use(bodyParser.json());
app.use(cors());
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/api/top', (req, res) => {
    axios.get(`https://rss.itunes.apple.com/api/v1/ie/podcasts/top-podcasts/all/50/explicit.json`)
        .then(data => {
            return data.data.feed.results;
        })
        .then(top => {
            res.json({
                top: top.map(item => {
                    return {
                        id: item.id,
                        name: item.name,
                        artist: item.artistName,
                        artwork: item.artworkUrl100,
                    };
                })
            });
        })
        .catch(() => {
            res.status(500).send({ top: [] });
        });
});

app.get('/api/subscriptions', (req, res) => {
    PodcastModel.find({}, (err, subscriptions) => {
        if (!subscriptions) {
            res.send(500).json({ subscriptions: [] });
        } else {
            res.json({ subscriptions });
        }
    });
});

app.post('/api/subscriptions', (req, res) => {
    /* If an RSS feed was passed from the client, extract the info from there.
     * Based on this demo: https://github.com/scripting/feedParserDemo
     */
    if ('feedUrl' in req.body && req.body.feedUrl !== '') {
        try {
            const stream = request(req.body.feedUrl);
            const feedparser = new FeedParser({ addmeta: false });

            stream.on('response', function (res) {
                if (res.statusCode !== 200) {
                    this.emit('error', new Error('Bad status code'));
                } else {
                    stream.pipe(feedparser);
                }
            });

            stream.on('error', function (err) {
                console.log(err.message);
            });

            feedparser.on('readable', function () {
                PodcastModel.create({
                    name: this.meta.title,
                    artist: this.meta.author,
                    artwork: this.meta.image.url,
                    feedUrl: req.body.feedUrl
                });

                res.status(201).send();
            });

            feedparser.on('error', function (err) {
                console.log(err.message);
            });
        } catch (e) {
            res.status(500).send(e.message);
        }
    } else {
        // Need to search iTunes to retrieve the RSS feed since the client didn't send one.
        axios.get(`https://itunes.apple.com/lookup?id=${req.body.id}&entity=podcast`)
            .then(data => {
                return data.data.results[0].feedUrl
            })
            .then(feedUrl => {
                PodcastModel.create({
                    name: req.body.name,
                    artist: req.body.artist,
                    artwork: req.body.artwork,
                    feedUrl
                });
            })
            .catch(e => {
                res.send(e.message);
            });
    }
});

/* Get info about a particular subscription by parsing its RSS feed and returning it to the client as a JSON string.
 * The code here is largely based on this demo by Dave Winer: https://github.com/scripting/feedParserDemo 
 */
app.get('/api/subscriptions/:id', (req, res) => {
    PodcastModel.findById({ _id: req.params.id }, (err, data) => {
        if (!data) {
            res.status(404).send({});
        } else {
            const stream = request(data.feedUrl);
            const feedItems = [];
            const feedparser = new FeedParser({ addmeta: false });

            stream.on('response', function (res) {
                if (res.statusCode !== 200) {
                    res.send({})
                } else {
                    stream.pipe(feedparser);
                }
            });

            stream.on('error', function (err) {
                console.log(err.message);
            });

            feedparser.on('readable', function () {
                try {
                    const item = this.read();
                    if (item !== null) {
                        feedItems.push({
                            title: item.title,
                            date: item.date,
                            audio: item.enclosures[0]
                        });
                    }
                } catch (err) {
                    console.log(err.message);
                }
            });

            feedparser.on('end', function () {
                res.json({
                    id: data.id,
                    name: data.name,
                    artist: data.artist,
                    artwork: data.artwork,
                    favourite: data.favourite,
                    description: this.meta.description,
                    link: this.meta.link,
                    episodes: feedItems
                });
            });

            feedparser.on('error', function (err) {
                console.log(err.message);
            });
        }
    });
});

app.put('/api/subscriptions/:id', (req, res) => {
    PodcastModel.findByIdAndUpdate(req.params.id, req.body, { new: true }, (err, data) => {
        if (err) {
            res.send(err.message);
        } else {
            res.send(data);
        }
    });
});

/* Delete a subscription i.e. unsubscribe. */
app.delete('/api/subscriptions/:id', (req, res) => {
    PodcastModel.deleteOne({ _id: req.params.id }, (err, data) => {
        if (err) {
            res.send(err.message);
        } else {
            res.send(data);
        }
    });
});

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));