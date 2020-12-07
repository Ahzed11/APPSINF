const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const { body, validationResult } = require('express-validator');

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
router.post('/register',
    [
        body('register-username').isLength({min: 3})
            .withMessage("Le nom d'utilisateur doit contenir au moins 3 caractères")
            .custom(async (value,{req, loc, path}) => {
                const user = await User.findOne({userName: req.body['register-username']});
                if (user) {
                    throw new Error("Ce nom d'utilisateur est déjà pris");
                } else {
                    return value;
                }
            }),
        body('register-first-name').isLength({min: 2})
            .withMessage("Le nom prénom doit contenir au moins 2 caractères"),
        body('register-last-name').isLength({min: 2})
            .withMessage("Le nom nom doit contenir au moins 2 caractères"),
        body('register-email').isEmail().normalizeEmail()
            .withMessage("L'adresse email doit être une adresse email valide")
            .custom(async (value,{req, loc, path}) => {
                const user = await User.findOne({email: req.body['register-email']});
                if (user) {
                    throw new Error("Cet email est déjà pris");
                } else {
                    return value;
                }
            }),
        body('register-password').notEmpty().withMessage("Le mot de passe ne peut être vide")
            .custom((value,{req, loc, path}) => {
            if (value !== req.body['register-password-confirm']) {
                throw new Error("Les mots de passe ne correspondent pas !");
            } else {
                return value;
            }
        }).withMessage("Le mot de passe doit correspondre à la confirmation")
    ],
    (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.render('auth', {userName: req.session.userName, errors: errors.array(), body: req.body});
        return;
    }

    const user = new User();

    user.userName = req.body['register-username'];
    user.firstName = req.body['register-first-name'];
    user.lastName = req.body['register-last-name'];
    user.email = req.body['register-email'];

    // Hash the password before saving the user
    const salt = bcrypt.genSaltSync(10);
    user.password = bcrypt.hashSync(req.body['register-password'], salt);

    user.save()
        .then(() => {
            req.session.userName = user.userName;
            req.session.save();

            res.redirect('/');
        })
        .catch(() => {
            res.redirect('/auth');
        })
});

/* POST login page. */
router.post('/login', (req, res) => {
    User.findOne({userName: req.body['login-username']}, (err, user) => {
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
