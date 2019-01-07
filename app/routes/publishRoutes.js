const mongoose = require('mongoose');
const Post = mongoose.model('posts');
var path = require('path');
var fs = require('fs-extra');

module.exports = function(app) {
    // POSTING SECTION =========================
    app.get('/post', isLoggedIn, function(req, res) {
        res.render('post.ejs');
    });

    app.post('/post', isLoggedIn, async (req, res)=>{
        var saveImage = function () {
            var possible = 'abcdefghijklmnopqrstuvwxyz0123456789',
                folderPath = req.user.id + '/';
            var imgUrl = folderPath
            for (var i = 0; i < 20; i += 1) {
                imgUrl += possible.charAt(Math.floor(Math.random() * possible.length));
            }
            
            Post.find({ filename: imgUrl }, function (err, images) {
                if (images.length > 0) {
                    saveImage();
                } else {
                    var tempPath = req.file.path,
                        ext = path.extname(req.file.originalname).toLowerCase(),
                        
                        targetPath = path.resolve('./public/upload/' + imgUrl + ext);

                    if (ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.gif') {
                        fs.ensureDir('./public/upload/' + folderPath)
                        .then(() => {
                            console.log('success!');

                            fs.rename(tempPath, targetPath, function (err) {
                                if (err) throw err;
        
                                const { title, description, topics } = req.body;
                                const posting = new Post({
                                    title,
                                    description,
                                    filename: imgUrl + ext,
                                    poster: req.user.id,
                                    topics: topics.split(',')
                                });
    
                                posting.save(function (err, image) {
                                    res.redirect('/board');
                                });
                            });

                        })
                        .catch(err => {
                            console.error(err)
                        })

                    } else {
                        fs.unlink(tempPath, function () {
                            if (err) throw err;

                            res.json(500, { error: 'Only image files are allowed.' });
                        });
                    }

                }

            });

        };

        saveImage();

    });


    app.post('/cloud/post', isLoggedIn, async (req, res)=>{

        console.log(req);
        res.redirect('/');

    });

}


// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
   // if (req.isAuthenticated())
   console.log("In log in check");
   console.log(req.user);
        return next();

    res.redirect('/');
}
