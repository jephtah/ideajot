const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const {ensureAuthenticated} = require('../helpers/auth');


//Require Model
require('../models/Ideas');
const Idea = mongoose.model('Idea');

//Get all ideas
router.get('/',ensureAuthenticated, (req, res) => {
    Idea.find({user: req.user.id})
        .sort('desc')
        .then((ideas) => {
            res.render('ideas/index', { ideas : ideas })
        })
})   

//Add a new idea
router.get('/add', ensureAuthenticated, (req, res) => {
    res.render('ideas/add')
});

//Edit Process
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
    Idea.findById({ 
        _id: req.params.id 
    })
    .then(idea => {
        if(idea.user != req.user.id){
            res.redirect('/ideas');
        }else{
            res.render('ideas/edit', {
                idea: idea
            });
        }
    })
    .catch(err => console.log(err));
});

//Update Process
router.put('/:id', ensureAuthenticated, (req, res) => {
    Idea.findOne({
        _id: req.params.id
    })
    .then(idea => {
        idea.title = req.body.title;
        idea.details = req.body.details

        idea.save()
            .then(idea => {
                req.flash('success_messages', 'Idea updated!');
                    res.redirect('/ideas');
                })
    })
})


//Processing form
router.post('/', ensureAuthenticated, (req, res) => {
    errors = [];

    if(!req.body.title){
        errors.push({ text: 'Please add title!' })
    }
    if (!req.body.details){
       errors.push({ text: 'Please add details!' })
    }
    if(errors.length > 0){
    res.render('ideas/add', {
        errors: errors,
        title: req.body.title,
        details: req.body.details
    });
    } else {
        const newUser = {
            title: req.body.title,
            details: req.body.details,
            user: req.user.id
        }
        new Idea(newUser)
                .save()
                .then(idea => { 
                    req.flash('success_messages', 'Your brilliant Idea just got added!');
                    res.redirect('/ideas')
                 } )
    }
})


//Delete Ideas
router.delete('/:id',ensureAuthenticated,  (req, res) => {
    Idea.deleteOne( { _id: req.params.id })
        .then(idea => {
            req.flash('success_messages', 'Idea\'s beeen deleted!');
            res.redirect('/ideas');
        });
})

module.exports = router;
