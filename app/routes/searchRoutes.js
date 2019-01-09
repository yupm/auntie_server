module.exports = function(app) {
    // SEARCH SECTION =========================
    app.get('/search', isLoggedIn, function(req, res) {
         res.render('search.ejs', {
             user : req.user
         });
     });
 
 }
 
 
 // route middleware to ensure user is logged in
 function isLoggedIn(req, res, next) {
     //if (req.isAuthenticated())
         return next();
 
     res.redirect('/');
 }
 