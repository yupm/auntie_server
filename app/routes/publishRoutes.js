const mongoose = require('mongoose');
var path = require('path');
var fs = require('fs-extra');

const Events = mongoose.model('events');
const Item = mongoose.model('item');
var Hashids = require('hashids');
var hashids = new Hashids('A hashing function for Auntie.cc2019');
var multer = require('multer');
var upload = multer({ dest: './public/upload/temp' });



module.exports = function(app) {
    // POSTING SECTION =========================
    app.get('/item', function(req, res) {
        res.render('item.ejs',{
            user : req.user
        });
    });

    app.post('/item', isLoggedIn, upload.fields([{ name: 'file', maxCount: 4 }, {name: 'cdata', maxCount: 4}]), async (req, res)=>{
        console.log('success!');
        console.log(req.files);

        var saveImage = function () {
            var folderPath = hashids.encodeHex(req.user.id) + '/';

            
            var ext = path.extname(req.file.originalname).toLowerCase();
            var filepath = folderPath + genItemString() + ext;
            var targetPath = path.resolve('./public/upload/' + filepath);
            var imgUrl = '/bucket/upload/' + filepath;
            
            
            Item.find({ filename: imgUrl }, function (err, images) {
                if (images.length > 0) {
                    saveImage();
                } else {
                    var tempPath = req.file.path;

                    if (ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.gif') {
                        fs.ensureDir('./public/upload/' + folderPath)
                        .then(() => {

                            fs.rename(tempPath, targetPath, function (err) {
                                if (err) throw err;
        
                                const { title, description, itemTags } = req.body;
                                const listing = new Item({
                                    title,
                                    description,
                                    filename: imgUrl,
                                    poster: req.user.id,
                                    topics: itemTags.split(',')
                                });
    
                                listing.save(function (err, image) {
                                    res.redirect('/');
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
        res.json(200, { redirect: '/item' });
    });

    app.post('/events/recommend', async (req, res)=>{
        var tempPath = req.file.path;
        var ext = path.extname(req.file.originalname).toLowerCase();
        var fileStub = genItemString() + ext;
        var targetPath = path.resolve('./public/events/' + fileStub);
        var imgUrl = '/bucket/events/' + fileStub;

        if (ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.gif') {
            fs.ensureDir('./public/events')
            .then(() => {

                fs.rename(tempPath, targetPath, function (err) {
                    if (err) throw err;

                    const activity = new Events({
                        title: req.body.title,
                        company: req.body.company,
                        from: req.body.startDate,
                        to: req.body.endDate,
                        description: req.body.description,
                        filename: imgUrl,
                        url: req.body.eventUrl,
                    });

                    activity.save(function (err, image) {
                        res.redirect('/events');
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
    });

}

function genItemString(){
    const possible = 'abcdefghijklmnopqrstuvwxyz0123456789';
    var generateString = new Date().getTime().toString() + '-';
    for (var i = 0; i < 10; i += 1) {
        generateString += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return generateString;
}

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
   if (req.isAuthenticated())
   {
        console.log("In log in check");
        console.log(req.user);
        return next();
   }
    res.redirect('/');
}
