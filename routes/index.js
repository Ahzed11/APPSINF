const express = require('express');
const router = express.Router();
const Article = require('../models/article');
const User = require('../models/user')

/* GET home page. */
router.get('/', async function(req, res, next) {
  // Articles
  let articles;
  const searchTerm = req.query.searchTerm;
  const index = !req.query.index || req.query.index < 0 ? 0 : req.query.index;

  if(searchTerm){
    /* articles = await Article.find({$text: {$search: searchTerm}}).populate('author').sort('-createdAt')
        .skip(8 * index).limit(8); */

    articles = await Article.aggregate([
      {
        $match: { $text: {$search: searchTerm}}
      },
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
        $project: {
          "title": 1,
          "shortDescription": 1,
          "tags": 1,
          "author": "$user",
          "createdAt": 1,
          "slug": 1,
        }
      },
      { $skip: 8 * index },
      { $limit: 8 },
    ]);

  } else {
    articles = await Article.find().populate('author').sort('-createdAt').skip(8 * index).limit(8);
  }

  // Popular articles
  const popularArticles = await Article.aggregate([
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
      $project: {
        "title": 1,
        "shortDescription": 1,
        "tags": 1,
        "author": "$user",
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
    { $limit: 4 },
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
    searchTerm: searchTerm,
    index: index
  });
});

module.exports = router;
