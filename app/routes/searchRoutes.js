const mongoose = require('mongoose');
const Item = mongoose.model('item');




module.exports = function(app) {
    // SEARCH SECTION =========================
    app.get('/search', function(req, res) {
         res.render('search.ejs', {
             user : req.user,
             results: ""
         });
     });
 

     app.post('/search', async(req, res) => {
        console.log("Searching");
        console.log(req.body);  

        const results = await Item.find({ $text: { $search: req.body.searchInput } }).populate('company');
        console.log(results);


        res.render('search.ejs', {
            user : req.user,
            results
        });

    });
 }
 