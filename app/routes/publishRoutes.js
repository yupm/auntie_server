const mongoose = require('mongoose');
var path = require('path');
var fs = require('fs-extra');

const Events = mongoose.model('events');
const Item = mongoose.model('item');
var Hashids = require('hashids');
var hashids = new Hashids('A hashing function for Auntie.cc2019');
var multer = require('multer');
var upload = multer({ dest: './public/upload/temp' });
var async = require('async');


module.exports = function(app) {
    // POSTING SECTION =========================
    app.get('/item', function(req, res) {
        res.render('item.ejs',{
            user : req.user
        });
    });

    app.post('/item', isLoggedIn, upload.fields([{ name: 'file', maxCount: 4 }, {name: 'cdata', maxCount: 4}]), async (req, res)=>{
        console.log('success!');
    
        for(var i =0; i < req.files.file.length; i++){
            console.log(req.files.file[i].originalname);
            fs.unlink(req.files.file[i].path, (err) => {
                if (err) throw err;
                console.log('path/file.txt was deleted');
            });         
        };

        console.log("I promise you"); 

        var folderPath = hashids.encodeHex(req.user.id) + '/';
        var pathToUrls = [];

        async.each(req.files.cdata, function(tempfile, callback) {
            var ext = path.extname(tempfile.originalname).toLowerCase();

            if (ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.gif') {
                var filepath = folderPath + genItemString() + ext;
                var targetPath = path.resolve('./public/upload/' + filepath);
                var tempPath = tempfile.path;
  
                fs.ensureDir('./public/upload/' + folderPath)
                .then(() => {
                    fs.rename(tempPath, targetPath, function (err) {
                        if (err) throw err;
                        console.log("The target path is " + targetPath);                      
                        console.log("The temp path is " + tempPath);
                        var imgUrl = '/bucket/upload/' + filepath;        
                        pathToUrls.push(imgUrl);
                        callback();
                    });
                })
                .catch(err => {
                    console.error(err);
                    callback(err);
                });
                    
            } else {
                fs.unlink(tempPath, function () {
                    if (err) throw err;
                    callback('Only image files are allowed');      
                });
            }
        }, function(err) {
            // if any of the file processing produced an error, err would equal that error
            if( err ) {
              // One of the iterations produced an error.
              console.log('A file failed to process');
              console.log(err);
              if(err ==='Only image files are allowed')
              {
                    res.status(422).json( { error: err });
              }else{
                    res.status(500).json( { redirect: '/item' });
              }
            } else {
                console.log('All files have been processed successfully');

                const { title, description, itemTags } = req.body;
                const listing = new Item({
                    title,
                    description,
                    owner: req.user.id,
                    filenames: pathToUrls,
                    tags: itemTags.split(','),
                    geometry: req.user.companyProfile.geometry
                });
            
                listing.save(function (err, image) {333333
                    if(err){
                        console.log("TODO");
                        res.status(500).json( { redirect: '/item' });

                    }else{
                        res.status(200).json( { redirect: '/item' });
                    }
                });
        
            }
        });      

        console.log("WHY"); 
       
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
        return next();
   }
    res.redirect('/');
}
