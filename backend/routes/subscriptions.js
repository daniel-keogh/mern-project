const express = require('express');
const { body, query } = require('express-validator');
const {
    getAllSubscriptions,
    getSubscription,
    addSubscription,
    updateSubscription,
    deleteSubscription,
} = require('../controllers/subscriptions');
const Podcast = require('../models/podcast');

const router = express.Router();

router.get('/', getAllSubscriptions);

router.get('/:id', [
    query('limit')
        .isInt({ min: 1 })
        .withMessage('limit must be a number greater than zero')
        .optional(),
], getSubscription);

router.post('/', [
    body('feedUrl')
        .notEmpty()
        .withMessage('feedUrl cannot be empty')
        .isURL()
        .withMessage('feedUrl must be a valid URL')
        .custom(async value => {
            const podcast = await Podcast.findOne({ feedUrl: value });
            if (podcast) {
                return Promise.reject(`Already subscribed to the given feedUrl`);
            }
        })
], addSubscription);

router.put('/:id', [
    body('title')
        .notEmpty()
        .withMessage('title cannot be empty')
        .isString()
        .withMessage('title must be a string'),
    body('author')
        .notEmpty()
        .withMessage('author cannot be empty')
        .isString()
        .withMessage('author must be a string'),
    body('artwork')
        .notEmpty()
        .withMessage('artwork cannot be empty')
        .isURL()
        .withMessage('artwork must be a valid URL'),
    body('description')
        .notEmpty()
        .withMessage('description cannot be empty')
        .isString()
        .withMessage('description must be a string'),
    body('link')
        .notEmpty()
        .withMessage('link cannot be empty')
        .isURL()
        .withMessage('link must be a valid URL'),
    body('feedUrl')
        .notEmpty()
        .withMessage('feedUrl cannot be empty')
        .isURL()
        .withMessage('feedUrl must be a valid URL')
        .custom(async (value, { req }) => {
            const podcast = await Podcast.findOne({
                $and: [
                    { feedUrl: value },
                    { _id: { $ne: req.params.id } }
                ]
            });

            if (podcast) {
                return Promise.reject('Already subscribed to the given feedUrl');
            }
        }),
    body('favourite')
        .notEmpty()
        .withMessage('favourite cannot be empty')
        .isBoolean()
        .withMessage('favourite must be a boolean'),
], updateSubscription);

router.delete('/:id', deleteSubscription);

module.exports = router;
