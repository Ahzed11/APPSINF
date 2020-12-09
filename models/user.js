const mongoose = require('mongoose');
const Article = require('./article');

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        unique: true,
    },
    firstName: {
        type: String,
    },
    lastName: {
        type: String,
    },
    email: {
        type: String,
        unique: true,
        index: true,
    },
    password: {
        type: String,
    },
    articles: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Article'
    }]
});

const User = mongoose.model('User', userSchema);

module.exports = User;
