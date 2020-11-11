var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/view', function(req, res, next) {
    res.render('article', {userName: req.session.userName});
});

module.exports = router;
