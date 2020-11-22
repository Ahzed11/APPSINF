const mongoose = require('mongoose');
const User = require('../models/user');

const reactionSchema = new mongoose.Schema({
    content: {
        type: String,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
});

module.exports = reactionSchema;
