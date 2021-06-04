const User = require('../models/User');

exports.getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            const error = new Error('User not found');
            error.status = 404;
            throw error;
        } else {
            res.status(200).json(user);
        }
    } catch (err) {
        if (!err.status) {
            err.status = 500;
        }
        next(err);
    }
};

exports.updateUser = async (req, res, next) => {
    const { email } = req.body;

    req.user.email = email;

    try {
        const { _id, email, registeredSince, subscriptions } =
            await req.user.save();

        res.status(200).json({
            _id,
            email,
            registeredSince,
        });
    } catch (err) {
        err.status = 500;
        next(err);
    }
};

exports.deleteUser = async (req, res, next) => {
    try {
        if (req.params.id != req.user._id) {
            const error = new Error("Cannot delete another user's account");
            error.status = 403;
            throw error;
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            const error = new Error('User not found');
            error.status = 404;
            throw error;
        } else {
            await user.deleteOne();
        }

        res.status(204).send();
    } catch (err) {
        if (!err.status) {
            err.status = 500;
        }
        next(err);
    }
};
