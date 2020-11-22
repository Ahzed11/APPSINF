const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/user');

const router = express.Router();

/* GET auth page. */
router.get('/', (req, res) => {
    console.log(req.session.userName);
    res.render('auth', {userName: req.session.userName});
});

/* GET logout page. */
router.get('/logout', (req, res) => {
    req.session.destroy();

    res.redirect('/');
});

/* POST register page. */
router.post('/register', (req, res) => {
    //TODO: Add verification on fields

    const user = new User();

    user.userName = req.body['register-username'];
    user.firstName = req.body['register-first-name'];
    user.lastName = req.body['register-last-name'];
    user.email = req.body['register-email'];

    // Hash the password before saving the user
    const salt = bcrypt.genSaltSync(10);
    user.password = bcrypt.hashSync(req.body['register-password'], salt);

    user.save();

    req.session.userName = req.body['register-username'];
    req.session.save();

    res.redirect('/');
});

/* POST login page. */
router.post('/login', (req, res) => {
    User.findOne({userName: req.body['login-user-name']}, (err, user) => {
        if (user) {
            bcrypt.compare(req.body['login-password'] , user.password)
            .then((isValid) => {
                if (isValid) {
                    req.session.userName = user.userName;
                    req.session.save();

                    res.redirect('/');
                } else {
                    res.redirect('/auth');
                }
            })
        } else {
            res.redirect('/auth');
        }
    })
});

module.exports = router;
