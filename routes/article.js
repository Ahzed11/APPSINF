const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Article = require('../models/article');
const Comment = require('../schemas/comment');
const createError = require("http-errors");
const showdown = require('showdown');
const { body, validationResult } = require('express-validator');


/* GET view page. */
router.get('/view/:slug', async function(req, res, next) {
    const article = await Article.findOne({slug: req.params.slug}).populate('author').populate('comments.author');
    if (article){
        const converter = new showdown.Converter();
        article.content = converter.makeHtml(article.content);
        res.render('article/article_view', {
            userName: req.session.userName,
            article: article,
            commentErrorMessage: req.query.commentErrorMessage,
            session: req.session
        });
    } else {
        next(createError(404));
    }
});

/* GET mine page. */
router.get('/mine', async function(req, res, next) {
    if (!req.session.userName) {
        res.redirect('/');
        return;
    }

    const index = !req.query.index || req.query.index < 0 ? 0 : req.query.index;

    const articles = await Article.aggregate([
        {
            $lookup: {
                "from": User.collection.name,
                "localField": "author",
                "foreignField": "_id",
                "as": "user"
            }
        },
        { "$unwind": "$user" },
        {
            $match: { 'user.userName': req.session.userName }
        },
        {
            $project: {
                "title": 1,
                "shortDescription": 1,
                "tags": 1,
                "author": "$user",
                "createdAt": 1,
                "slug": 1,
            }
        },
        { $skip: index * 8 },
        { $limit: 8 },
    ]);

    if (articles){
        res.render('article/mine', {
            userName: req.session.userName,
            articles: articles,
            index: index
        });
    } else {
        res.redirect('/auth');
    }
});

/* GET write page. */
router.get('/write', function(req, res, next) {
    if (req.session.userName){
        res.render('article/article_write', {userName: req.session.userName});
    } else {
        res.redirect('/auth');
    }
});

/* POST write page. */
router.post('/write',
    [
        body('article-write-title').isLength({min: 8})
            .withMessage("Le titre doit contenir au moins 8 caractères"),
        body('article-write-content').notEmpty()
            .withMessage("Le contenu ne peut être vide"),
        body('article-write-short-description').isLength({min: 8, max: 40})
            .withMessage("La courte description doit contenir entre 8 et 40 caractères"),
    ],
    function(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors.array());
        res.render('article/article_write', {
            userName: req.session.userName,
            errors: errors.array(),
            body: req.body
        });
        return;
    }

    User.findOne({userName: req.session.userName}, (err, user) => {
        if(user){
            const article = new Article();

            article.title = req.body['article-write-title'].replace(/^\w/, function(c) {
                return c.toUpperCase();
            });
            article.content = req.body['article-write-content'];
            article.shortDescription = req.body['article-write-short-description']
            article.tags = req.body['article-write-tags'].toLowerCase();

            const slug = `${user.userName}-${req.body['article-write-title']}-${Date.now()}`.toLowerCase()
                .replace(/\s/g, '-');
            article.slug = slug;
            article.author = user;

            article.save().then(() => {
                user.articles.push(article['_id']);
                user.save().then(() => {
                    res.redirect(`/article/view/${slug}`);
                })
            });
            return;
        }

        res.redirect('/article/write');
    })
});

/* GET edit page. */
router.get('/edit/:slug', async function(req, res, next) {
    const article = await Article.findOne({slug: req.params.slug}).populate('author');
    if (article){
        if (article.author.userName === req.session.userName) {
            const body = {
                "article-write-title": article.title,
                "article-write-content": article.content,
                "article-write-short-description": article.shortDescription,
                "article-write-tags": article.tags,
                slug: req.params.slug
            }
            res.render('article/article_write', {
                userName: req.session.userName,
                body: body
            })
        } else {
            res.redirect(`/article/view/${req.params.slug}`);
        }
    } else {
        next(createError(404));
    }
});

/* POST edit page. */
router.post('/edit/:slug', async function(req, res, next) {
    const article = await Article.findOne({slug: req.params.slug}).populate('author');
    if (article){
        if (article.author.userName === req.session.userName) {
            article.title = req.body['article-write-title'].replace(/^\w/, function(c) {
                return c.toUpperCase();
            });
            article.content = req.body['article-write-content'];
            article.shortDescription = req.body['article-write-short-description']
            article.tags = req.body['article-write-tags'];

            try {
                await article.save();
            } catch (e) {
                console.log(e);
            }
        }
        res.redirect(`/article/view/${req.params.slug}`);
    } else {
        next(createError(404));
    }
});

/* get delete page. */
router.get('/delete/:slug', async function(req, res, next) {
    const article = await Article.findOne({slug: req.params.slug}).populate('author');
    if (article){
        if (article.author.userName === req.session.userName) {
            await Article.deleteOne({slug: req.params.slug})
            res.redirect(`/`);
        } else {
            res.redirect(`/article/view/${req.params.slug}`);
        }
    } else {
        next(createError(404));
    }
});

/* POST comment. */
router.post('/comment/:slug',
    [
        body('comment-write-content').notEmpty().withMessage("Le commentaire ne peut être vide")
    ],
    async function(req, res, next) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.redirect(`/article/view/${req.params.slug}?commentErrorMessage=${errors.array()[0].msg}`);
            return;
        }

        const article = await Article.findOne({slug: req.params.slug});
        if (article){
            User.findOne({userName: req.session.userName}, (err, user) => {
                if (user){
                    article.comments.push({content: req.body['comment-write-content'], author: user});
                    try {
                        article.save(() => {
                            res.redirect(`/article/view/${req.params.slug}`);
                        });
                    } catch (e) {
                        console.log(e);
                    }
                } else {
                    res.redirect(`/article/view/${req.params.slug}`);
                }
            });
        } else {
            res.redirect(`/article/view/${req.params.slug}`);
        }
    });

/* POST reaction. */
router.post('/reaction/:slug', async function(req, res, next) {
    let isSuccess = false;
    const reactions = ['heart_eyes', 'joy', 'smile', 'face_with_raised_eyebrow', 'cry', 'angry'];
    const reaction = req.body['reaction-write-content'];

    if (reactions.find((e) => e === reaction)) {
        const article = await Article.findOne({slug: req.params.slug});
        if (article){
            User.findOne({userName: req.session.userName}, (err, user) => {
                if (user){
                    const previousReactionIndex = article.reactions.findIndex((e) => {
                        return  e.author.toString() === user['_id'].toString();
                    });
                    if (previousReactionIndex >= 0) {
                        article.reactions.splice(previousReactionIndex, 1);
                    }

                    article.reactions.push({content: reaction, author: user});
                    article.save(() => {
                        res.redirect(`/article/view/${req.params.slug}`);
                    });
                } else {
                    res.redirect(`/article/view/${req.params.slug}`);
                }
            });
        } else {
            res.redirect(`/article/view/${req.params.slug}`);
        }
    } else {
        res.redirect(`/article/view/${req.params.slug}`);
    }
});

module.exports = router;
