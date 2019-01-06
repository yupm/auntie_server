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
            successRedirect : '/', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));


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
