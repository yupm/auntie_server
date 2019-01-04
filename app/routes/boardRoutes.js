const mongoose = require('mongoose');
const Post = mongoose.model('posts');


module.exports = function(app) {

     // BOARD SECTION =========================
     app.get('/board', async(req, res)=> {

        const posts = await Post.find().limit(5).populate('poster');

       // console.log(posts);
        res.render('board.ejs', {posts});    

    });
    app.get('/board/:page', async(req, res)=> {
        const posts = await Post.find().limit(5).skip(req.params.page*5);

        res.render('board.ejs', {posts});
    });


    app.get('/board2', async(req, res)=> {

        const posts = await Post.find().limit(5).populate('poster');

       // console.log(posts);
        res.render('board2.ejs', {posts});    

    });

}


// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    //if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
