const express = require('express');
const router = express.Router();
const Article = require('../models/article');

/* GET home page. */
router.get('/', async function(req, res, next) {
  let articles;
  const searchTerm = req.query.searchTerm;

  if(searchTerm){
    articles = await Article.find({$text: {$search: searchTerm}}).populate('author').sort('-createdAt').limit(8);
  } else {
    articles = await Article.find().populate('author').sort('-createdAt').limit(8);
  }

  let popularArticles = await Article.aggregate([
    { $project: {
        "title": 1,
        "shortDescription": 1,
        "tags": 1,
        "author": 1,
        "createdAt": 1,
        "slug": 1,
        "popularity": {
          $add : [
            { $size: "$comments" },
            { $size: "$reactions" }
          ]
        }
      }
    },
    { $sort: { "popularity": -1 } },
    { $limit: 2 }
  ]);
  console.log(popularArticles);

  res.render('index', {
    userName: req.session.userName,
    articles: articles,
    popularArticles: popularArticles,
    searchTerm: searchTerm
  });
});

module.exports = router;
