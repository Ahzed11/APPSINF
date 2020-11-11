const mongoose = require('mongoose');
const User = require('./user');

const articleSchema = new mongoose.Schema({
    title: {
        type: String,
    },
    description: {
        type: String,
    },
    tags: {
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

articleSchema.index({title: 'text', description: 'text', tags: 'text'});

const Article = mongoose.model('Article', articleSchema);

module.exports = Article;
