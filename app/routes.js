const authRoutes = require('./routes/authRoutes');
const boardRoutes = require('./routes/boardRoutes');
const profileRoutes = require('./routes/profileRoutes');
const publishRoutes = require('./routes/publishRoutes');

module.exports = function(app, passport) {

    authRoutes(app, passport);
    boardRoutes(app);
    profileRoutes(app);
    publishRoutes(app);

// normal routes ===============================================================
    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
        res.render('index.ejs');
    });


    // PROFILE SECTION =========================
    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('profile.ejs', {
            user : req.user
        });
    });


    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
    
};


// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
   // if (req.isAuthenticated())
        return next();

    res.redirect('/');
}

