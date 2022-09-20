const bcrypt = require('bcryptjs');

const User = require('../models/user-model');

module.exports.getRegistrationForm = (req, res, next) => {
    res.render('registration')
}

module.exports.postRegistrationForm = (req, res, next) => {
    bcrypt.hash(req.body.password, 12)
        .then(hashedPassword => {
            const user = new User({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                userName: req.body.userName,
                password: hashedPassword,
            })
            return user.save();
        }).then(() => {
            res.redirect('/user/login');
        }).catch((err) => {
            console.log(err);
        })
}

module.exports.getLoginForm = (req, res, next) => {
    res.render('login')
}

module.exports.postLoginForm = (req, res, next) => {
    User.findOne({ 'userName': req.body.userName }).exec()
        .then(user => {
            if (!user) {
                return res.redirect('/404');
            }
            bcrypt.compare(req.body.password, user.password)
                .then(success => {
                    if (success) {
                        req.session.user = user;
                        return res.redirect('/user/');
                    }
                    else {
                        return res.redirect('/404');
                    }
                })
        }).catch(err => {
            console.log(err);
        });
}

module.exports.getWelcome = (req, res, next) => {
    res.render('welcome', {
        user: req.session.user
    });
}

module.exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        console.log(err);
        res.redirect('/user/login');
    });
}