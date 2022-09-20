const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const mongodbSession = require('connect-mongodb-session')(session);

const userRouter = require('./routes/user');
const User = require('./models/user-model');

const app = express();
const sessionStore = new mongodbSession({
    uri: 'mongodb+srv://SagarVaghela:SagarVaghela@clusterone.r1aubpt.mongodb.net/ejsdemo',
    collection: 'sessions'
});

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
    session({
        secret: 'node ejs',
        resave: false,
        saveUninitialized: false,
        store: sessionStore
    })
);

app.use((req, res, next) => {
    if (!req.session.user) {
        next();
    }
    else {
        User.findById(req.session.user._id)
            .then(user => {
                req.user = user;
                next();
            })
            .catch(err => console.log(err));
    }
});

app.use('/user', userRouter);

app.use('/404', (req, res, next) => {
    res.render('404');
});

mongoose
    .connect('mongodb+srv://SagarVaghela:SagarVaghela@clusterone.r1aubpt.mongodb.net/ejsdemo')
    .then(() => {
        app.listen(3000);
    })
    .catch((err) => {
        console.log(err)
    });