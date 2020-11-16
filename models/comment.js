const mongoose = require('mongoose');
const User = require('./user');

const commentSchema = new mongoose.Schema({
    content: {
        type: String,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type:Date,
        default:Date.now,
    },
});

module.exports = commentSchema;
