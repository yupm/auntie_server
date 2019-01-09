module.exports = function(app, passport) {

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        app.get('/login', function(req, res) {
            res.render('login.ejs', { message: req.flash('loginMessage') });
        });

        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }),  
        function(req, res) {
            console.log(req.body);
            if (req.body.remember) {
              req.session.cookie.maxAge = 180 * 24 * 60 * 60 * 1000; // Cookie expires after 30 days
            } else {
              req.session.cookie.expires = false; // Cookie expires at end of session
            }
        res.redirect('/');
    });


        // REGISTER =================================
        // show the registration form
        app.get('/register', function(req, res) {
            res.render('register.ejs', { message: req.flash('signupMessage') });
        });

        // process the signup form
        app.post('/register', passport.authenticate('local-signup', {
            successRedirect : '/', // redirect to the secure profile section
            failureRedirect : '/register', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));
    
}

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
   // if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
