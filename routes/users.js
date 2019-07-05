const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const passport = require('passport');

//Load user model
require('../models/User');
const User = mongoose.model('users');

//User login
router.get('/login', (req, res) => {
    res.render("users/login")
})

//User register
router.get('/register', (req, res) => {
    res.render("users/register")
});

//Login Route
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/ideas',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_messages', 'You are now logged out!')
    res.redirect('/users/login')
})

router.post('/register', (req, res) => {
    let errors = [];

    if (req.body.password != req.body.password2){
        errors.push({text: 'Passwords do not match!'})
    }

    if(req.body.password.length < 4){
        errors.push({text: 'Password length must be greater than 4'})
    }

    if (errors.length > 0){
        res.render('users/register', {
            errors: errors,
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email
        });
    } else {
        User.findOne({email: req.body.email})
            .then((user) => {
                if(user){
                    req.flash('error_messages', 'User with this email already exists')
                } else {
                    const newUser = new User({
                        firstname: req.body.firstname,
                        lastname: req.body.lastname,
                        email: req.body.email,
                        password: req.body.password
                    });
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            if (err) throw err;
                            newUser.password = hash;
                            newUser.save()
                                .then(user => {
                                    req.flash('success_messages', 'You are now registered and can log in!')
                                    res.redirect('/users/login');
                                })
                                .catch( err => {
                                    console.log(err);
                                    return;
                                });
                        })
                }); 
            }
    });
    }

});

module.exports = router;