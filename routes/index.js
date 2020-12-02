const express = require('express');
const router = express.Router();
const Article = require('../models/article');

/* GET home page. */
router.get('/', async function(req, res, next) {
  // Articles
  let articles;
  const searchTerm = req.query.searchTerm;

  if(searchTerm){
    articles = await Article.find({$text: {$search: searchTerm}}).populate('author').sort('-createdAt').limit(8);
  } else {
    articles = await Article.find().populate('author').sort('-createdAt').limit(8);
  }

  // Popular articles
  const popularArticles = await Article.aggregate([
    {
      $project: {
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

  // Popular tags
  const tags = await Article.aggregate([
    {
      $project: {
        "tagsWithComma": { $concat: [ "$tags", ","] },
      }
    },
  ]);

  let tagsConcat = ''
  tags.forEach((e) => {
    tagsConcat += e.tagsWithComma;
  })
  let tagArray = tagsConcat.replace(/ /g, '').split(',');
  let frequency = {};
  tagArray.forEach(tag => frequency[tag] ? frequency[tag]++ : frequency[tag] = 1);
  const keyVals = Object.entries(frequency);
  let sortedNestedArray = keyVals.sort((a, b) => a[1] - b[1]);
  let flattenedArray = sortedNestedArray.map((arr) => arr[0]);
  let popularTags = flattenedArray.reverse().slice(0, 8);

  res.render('index', {
    userName: req.session.userName,
    articles: articles,
    popularArticles: popularArticles,
    popularTags: popularTags,
    searchTerm: searchTerm
  });
});

module.exports = router;
