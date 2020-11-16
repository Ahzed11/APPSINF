const mongoose = require('mongoose');
const User = require('./user');

const articleSchema = new mongoose.Schema({
    title: {
        type: String,
    },
    content: {
        type: String,
    },
    shortDescription: {
        type: String,
    },
    tags: {
        type: String,
    },
    slug: {
        type: String,
        unique: true,
        index: true,
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

articleSchema.index({title: 'text', content: 'text', tags: 'text'});

const Article = mongoose.model('Article', articleSchema);

module.exports = Article;
