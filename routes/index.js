const express = require('express');
const router = express.Router();
const Article = require('../models/article');

/* GET home page. */
router.get('/', async function(req, res, next) {
  let articles;
  const searchTerm = req.query.searchTerm;

  if(searchTerm){
    articles = await Article.find({$text: {$search: searchTerm}}).populate('author').sort('-createdAt');
  } else {
    articles = await Article.find().populate('author').sort('-createdAt');
  }

  res.render('index', {userName: req.session.userName, articles: articles, searchTerm: searchTerm});
});

module.exports = router;
