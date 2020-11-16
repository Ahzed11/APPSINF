const express = require('express');
const router = express.Router();
const Article = require('../models/article');

/* GET home page. */
router.get('/', async function(req, res, next) {
  const articles = await Article.find().populate('author').limit(5).sort('-createdAt');
  res.render('index', {userName: req.session.userName, articles: articles});
});

module.exports = router;
