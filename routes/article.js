const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Article = require('../models/article');
const Comment = require('../models/comment');
const createUUID = require('../helpers/createUUID');
const createError = require("http-errors");
const showdown = require('showdown')

/* GET view page. */
router.get('/view/:slug', async function(req, res, next) {
    console.log('userName')
    console.log(req.session.userName)
    const article = await Article.findOne({slug: req.params.slug}).populate('author').populate('comments.author');
    if (article){
        const converter = new showdown.Converter();
        article.content = converter.makeHtml(article.content);
        res.render('article/article_view', {userName: req.session.userName, article: article});
    } else {
        next(createError(404));
    }
});

/* POST view page. */
router.post('/view/:slug', async function(req, res, next) {
    const article = await Article.findOne({slug: req.params.slug});
    if (article){
        User.findOne({userName: req.session.userName}, (err, user) => {
            if (user){
                article.comments.push({content: req.body['comment-write-content'], author: user});
                article.save();
            }
        });
    }
    res.redirect(`/article/view/${req.params.slug}`);
});

/* GET write page. */
router.get('/write', function(req, res, next) {
    if (req.session.userName){
        res.render('article/article_write', {userName: req.session.userName});
        return;
    }
    res.redirect('/auth');
});

/* POST write page. */
router.post('/write', function(req, res, next) {
    //TODO: Add verification on fields
    User.findOne({userName: req.session.userName}, (err, user) => {
        if(user){
            const article = new Article();

            article.title = req.body['article-write-title'];
            article.content = req.body['article-write-content'];
            article.shortDescription = req.body['article-write-short-description']
            article.tags = req.body['article-write-tags'];

            //TODO: Améliorer la création du slug
            const slug = `${req.body['article-write-title']}${createUUID()}`;
            article.slug = slug;
            article.author = user;

            article.save().then(() => {
                res.redirect(`/article/view/${slug}`);
            });
            return;
        }

        res.redirect('/article/write');
    })
});

module.exports = router;
