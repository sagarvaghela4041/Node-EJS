const bcrypt = require('bcryptjs');

const { STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY } = require('../constants');
const stripe = require('stripe')(STRIPE_SECRET_KEY);

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

    stripe.products.create({
        name: 'Gold Special',
    }).then(product => {
        // console.log('product', new Date().toISOString());
        return stripe.prices.create({
            unit_amount: 1200,
            currency: 'usd',
            product: product.id
        })
    }).then((price) => {
        // console.log('price', new Date().toISOString());
        return stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                { price: price.id, quantity: 2 },
            ],
            mode: 'payment',
            success_url: req.protocol + '://' + req.get('host') + '/user/Thank-you',
            cancel_url: req.protocol + '://' + req.get('host') + '/404'
        })
    }).then(session => {
        // console.log('session', new Date().toISOString());
        res.render('welcome', {
            user: req.session.user,
            sessionId: session.id,
            stipePublishableKey: STRIPE_PUBLISHABLE_KEY
        });
    }).catch(err => {
        console.log(err);
    });
}

module.exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        console.log(err);
        res.redirect('/user/login');
    });
}

module.exports.getThankYou = (req, res, next) => {
    res.render('thank-you');
}