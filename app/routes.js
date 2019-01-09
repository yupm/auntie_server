const authRoutes = require('./routes/authRoutes');
const boardRoutes = require('./routes/boardRoutes');
const profileRoutes = require('./routes/profileRoutes');
const publishRoutes = require('./routes/publishRoutes');
const searchRoutes = require('./routes/searchRoutes');


module.exports = function(app, passport) {
    authRoutes(app, passport);
    boardRoutes(app);
    profileRoutes(app);
    publishRoutes(app);
    searchRoutes(app);
    
// normal routes ===============================================================
    // show the home page (will also have our login links)
    app.get('/', function(req, res) {

        if(req.user){
            res.render('profile.ejs', {
                user : req.user
            });
        }
        else
        {
            res.render('index.ejs', {
                user : req.user
            });
        };
      
    });


    // PROFILE SECTION =========================
    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('profile.ejs', {
            user : req.user
        });
    });

    // DEALS SECTION =========================
    app.get('/deals', function(req, res) {
        res.render('deals.ejs', {
            user : req.user
        });
    });
    
    // EVENTS SECTION =========================
    app.get('/events', function(req, res) {
        res.render('events.ejs', {
            user : req.user
        });
    });

    app.get('/events/recommend', function(req, res) {
        res.render('recommend.ejs', {
            user : req.user
        });
    });


    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    app.get('/*', function(req, res) {
        res.json(404, { error: '404 not found.' });
    });
};


// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}

