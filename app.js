require('dotenv').config();
const passport = require("passport");
const LinkedInStrategy = require("passport-linkedin-oauth2").Strategy;
const cookieSession = require('cookie-session');
const express = require("express");
const homeRoute = require('./routes/home');
const cookieParser = require ("cookie-parser");

const app = express();

app.use(cookieParser());
app.use(cookieSession({
    name: 'session',
    keys: ['session'],
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    maxAge: 90 * 24 * 60 * 60 * 1000 // 90 days
}));

app.use(express.json());
app.use(express.urlencoded({extended: false}));

const LINKEDIN_KEY = process.env.LINKEDIN_CLIENT_ID;
const LINKEDIN_SECRET = process.env.LINKEDIN_SECRET;
const port = 3006;

passport.serializeUser((user, done) => {
    const emailDict = (Array.isArray(user.emails) && user.emails.length > 0) ? user.emails[0] : null;
    const photoDict = (Array.isArray(user.photos) && user.photos.length > 0) ? user.photos[0] : null;

    const skinnyUser = {
        id: user.id,
        name: user.name,
        email: !!emailDict ? emailDict?.value : null,
        photo: !!photoDict ? photoDict?.value : null
    };
    done(null, skinnyUser);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

app.use(passport.initialize({}));
app.use(passport.session({}));

passport.use(new LinkedInStrategy({
    clientID: LINKEDIN_KEY,
    clientSecret: LINKEDIN_SECRET,
    callbackURL: `http://127.0.0.1:${port}/auth/linkedin/callback`,
    scope: ['r_emailaddress', 'r_liteprofile'],
    state: true
}, function (accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
        // User's LinkedIn profile is returned to represent the logged-in user.
        // Skillup can associate the LinkedIn account with a user record in your database,
        // and return that user instead.
        return done(null, profile);
    });
}));

checkPassportAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next()
    } else {
        res.status(401).send(
            `
            <div>
            <h2>Unauthorized</h2>
            <button style="background-color: #65676a; font-size: 2rem; 
                 padding: 10px; border-width: 0; border-radius: 10px; cursor: pointer" 
                 onclick="window.location='/'">Go home</button>
            </div>
            `
        );
    }
};

app.get('/auth/linkedin',
    passport.authenticate('linkedin'),
    function (req, res) {
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

app.get('/my-profile', checkPassportAuthenticated, function (req, res) {
    const name = req.user.name.givenName;
    const family = req.user.name.familyName;
    const photo = req.user.photo;
    const email = req.user.email;

    res.send(
        `<h1>${name} Profile</h1><div style="font-size:140%"> <p>User is Logged In </p>
                <p>Name: ${name} ${family} </p>
                <p> Linkedn Email: ${email} </p>
                <img src="${photo}"/>
                </div>
                `
    );
});

app.get('/api/public-test', function (req, res) {
    res.json({
        data: 'No auth needed here'
    })
});

app.get('/api/protected-test', checkPassportAuthenticated, function (req, res) {
    res.json(
        {
            data: 'Only with auth'
        }
    );
})

app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

app.listen(port, () => {
    console.log(`App listening on ${port}`)
});
