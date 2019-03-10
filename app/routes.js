const authRoutes = require('./routes/authRoutes');
const boardRoutes = require('./routes/boardRoutes');
const profileRoutes = require('./routes/profileRoutes');
const publishRoutes = require('./routes/publishRoutes');
const searchRoutes = require('./routes/searchRoutes');
const eventRoutes = require('./routes/eventRoutes');
const dealRoutes = require('./routes/dealRoutes');

const logger = require('./../config/logger')(__filename);

module.exports = function(app, passport) {
    authRoutes(app, passport);
    boardRoutes(app);
    profileRoutes(app);
    publishRoutes(app);
    searchRoutes(app);
    eventRoutes(app);
    dealRoutes(app);
    
// normal routes ===============================================================
    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
       // console.log(req.user._id);
       // console.log("_______________________________________________");

      //  console.log(req.headers);

        //logger.debug(req.user._id + " " + req.headers);

        if(req.user){
            res.redirect('/dash');
        }
        else
        {
            res.render('index.ejs', {
                user : req.user,
            });
        };
      
    });


    // PROFILE SECTION =========================
    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('profile.ejs', {
            user : req.user
        });
    });

    // POLICIES SECTION =========================
    app.get('/policies', function(req, res) {
        res.render('policies.ejs', {
            user : req.user
        });
    });

    // SUPPORT SECTION =========================
    app.get('/support', function(req, res) {
        res.render('support.ejs', {
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

