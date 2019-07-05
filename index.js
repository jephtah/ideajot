const express = require('express');
const methodOverride = require('method-override');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const bodyparser = require('body-parser');
const passport = require('passport');




mongoose.connect('mongodb://localhost/vidjot', {useNewUrlParser: true})
    .then(() => console.log("Database connection successfully established..."))
    .catch((err) => console.log("Database connection could not be established due to " + err))

const app = express();


//Handlebars middle ware
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

//BodyParser middleware
app.use(bodyparser.urlencoded({ extended: false }))
app.use(bodyparser.json())

//Loading static files
app.use(express.static(path.join(__dirname, 'public')));

//Middleware for MethodOverride
app.use(methodOverride('_method'));

//Express-session middleware
app.set('trust proxy', 1) // trust first proxy
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
}))

//Passport Middleware
app.use(passport.initialize());
app.use(passport.session()); 

app.use(flash());


//Global variables
app.use(function(req, res, next){
    res.locals.success_messages = req.flash('success_messages');
    res.locals.error_messages = req.flash('error_messages');
    res.locals.error_ = req.flash('error')
    res.locals.user = req.user || null;
    next();
});


app.get('/', (req, res) => { 
    res.render('index');
});

app.get('/about', (req, res) => {
    res.render('about')
});

//Loading routes
//Load Idea routes
const ideas = require('./routes/ideas');

//Load user routes
const users = require('./routes/users');

//Passport Config
require('./config/passport')(passport); 


app.use('/ideas', ideas );
app.use('/users', users)


const port = process.env.PORT || 5000

app.listen(port, () => console.log(`The app is running on port ${port}`))
