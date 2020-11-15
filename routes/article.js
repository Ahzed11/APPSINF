const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Article = require('../models/article');
const createUUID = require('../helpers/createUUID');
const createError = require("http-errors");

/* GET view page. */
router.get('/view/:slug', async function(req, res, next) {
    const article = await Article.findOne({slug: req.params.slug}).populate('author');
    if (article){
        res.render('article/article_view', {userName: req.session.userName, article: article});
    } else {
        next(createError(404));
    }
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
            article.tags = req.body['article-write-tags'];

            //TODO: Améliorer la création du slug
            const slug = `${req.body['article-write-title']}${createUUID()}`;
            article.slug = slug;
            article.author = user;

            article.save();
            res.redirect(`/article/view/${slug}`);
            return;
        }

        res.redirect('/article/write');
    })
});

module.exports = router;
