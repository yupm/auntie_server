module.exports = function(app) {
    // SEARCH SECTION =========================
    app.get('/search', function(req, res) {
         res.render('search.ejs', {
             user : req.user
         });
     });
 
 }
 