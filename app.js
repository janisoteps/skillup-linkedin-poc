require('dotenv').config();
const passport = require("passport");
const LinkedInStrategy = require("passport-linkedin-oauth2").Strategy;
const session = require('express-session')
const express = require("express");
const homeRoute = require('./routes/home');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const LINKEDIN_KEY = process.env.LINKEDIN_CLIENT_ID;
const LINKEDIN_SECRET = process.env.LINKEDIN_SECRET;
const port = 3006;

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize({}));
app.use(passport.session({}));

passport.use(new LinkedInStrategy({
    clientID: LINKEDIN_KEY,
    clientSecret: LINKEDIN_SECRET,
    callbackURL: `http://127.0.0.1:${port}/auth/linkedin/callback`,
    scope: ['r_emailaddress', 'r_liteprofile'],
    state: true
}, function(accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
        // User's LinkedIn profile is returned to represent the logged-in user.
        // Skillup can associate the LinkedIn account with a user record in your database,
        // and return that user instead.
        return done(null, profile);
    });
}));


app.get('/auth/linkedin',
    passport.authenticate('linkedin'),
    function(req, res){
        // The request will be redirected to LinkedIn for authentication, so this
        // function will not be called.
});

app.get('/auth/linkedin/callback', passport.authenticate('linkedin', {
    successRedirect: '/',
    failureRedirect: '/auth/linkedin'
}));

app.get("/", (req, res) => {
    homeRoute.homePage(req, res);
});

app.get('/logout', function (req, res){
    req.session.destroy(function (err) {
        if (err) {
            console.log(err);
        }
        res.redirect('/');
    });
});

app.listen(port, () => {
    console.log(`App listening on ${port}`)
});
