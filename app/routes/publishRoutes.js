const mongoose = require('mongoose');
var path = require('path');
var fs = require('fs-extra');

const Events = mongoose.model('events');
const Deals = mongoose.model('deals');

const Item = mongoose.model('item');
var Hashids = require('hashids');
var hashids = new Hashids('A hashing function for Auntie.cc2019');
var hashurls = new Hashids('Short and sweet');
const logger = require('../../config/logger')(__filename);

var multer = require('multer');
var upload = multer({ dest: './public/upload/temp' });
var async = require('async');

var h2p = require('html2plaintext');
var axios = require('axios');

const sharp = require('sharp');
sharp.cache(false);

const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

module.exports = function(app) {
    // POSTING SECTION =========================
    app.get('/post', isLoggedIn, function(req, res) {
        res.render('post.ejs',{
            user : req.user
        });
    });

    app.post('/post', isLoggedIn,  upload.fields([{name: 'cdata', maxCount: 4}]), async (req, res)=>{
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
                    sharp(tempPath)
                    .resize(1500, 1500, {
                      fit: sharp.fit.inside,
                      withoutEnlargement: true
                    })
                    .withMetadata()
                    .toFile(targetPath)
                    .then((info) => {
                        fs.unlink(tempPath, function(err) {
                            if (err) throw err;
                            var imgUrl = '/bucket/upload/' + filepath;        
                            pathToUrls.push(imgUrl);
                            callback();
                        });   
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
              logger.info('A file failed to process');
              logger.info(err);
              if(err ==='Only image files are allowed')
              {
                    res.status(422).json( { error: err });
              }else{
                    res.status(500).json( { redirect: '/post' });
              }
            } else {
                console.log('All files have been processed successfully');
                const { title, pdesc, itemTags, specNames, specValues, cat } = req.body;
                const description = h2p(pdesc);

                const urlid = new Date().getTime().toString()  + req.user.id;

                console.log(urlid);
                const url = hashurls.encodeHex(urlid) + '-' + convertToSlug(title);
                console.log(url);
                
                var specs = [];
                if(specNames){
                    for(var i =0; i < specNames.length; i++){
                        if(specNames[i] !== '')
                        {
                            specs.push({ attr : specNames[i], details: specValues[i]});
                        }
                    }
                }

                const listing = new Item({
                    title,
                    description,
                    html: pdesc,
                    company: req.user.company,
                    companyname: req.user.company.name,
                    category: cat,
                    url,
                    filenames: pathToUrls,
                    specifications: specs,
                    tags: itemTags.split(','),
                    geometry: req.user.company.geometry
                });
                logger.info("Saving");

                listing.save(function (err, image) {
                    if(err){
                        logger.info("TODO");
                        res.status(500).json( { redirect: '/post' });

                    }else{
                        res.status(200).json( { redirect: '/' });
                    }
                });        
            }

        });                  
        logger.info("Should not be here"); 
    });


    app.post('/events/recommend', upload.single('efile'), async (req, res)=>{

        if(!req.file)
        {
            if(!req.body.startDate){
                req.body.startDate = new Date()
            }
            if(!req.body.endDate){
                req.body.endDate = new Date().setMonth(new Date().getMonth() + 1);
            }
            const activity = new Events({
                title: req.body.title,
                company: req.body.company,
                from: req.body.startDate,
                to: req.body.endDate,
                description: req.body.description,
                venue: req.body.eventVenue,
                postal: req.body.eventPostal,                
                outboundURL: req.body.eventUrl,
            });


             console.log("Getting coordinates");

            axios.get(`https://developers.onemap.sg/commonapi/search?searchVal=${req.body.eventPostal}&returnGeom=Y&getAddrDetails=N`)
            .then(response => {
                console.log("Got response");
                console.log(response.data);

                var coordinates = [];
                if(response.data.results !== undefined && response.data.results.length != 0)
                {
                    console.log(response.data.results[0])
                    coordinates.push(response.data.results[0].LONGITUDE);
                    coordinates.push(response.data.results[0].LATITUDE);
                }
                else{
                    //Push defaults
                    console.log("Push defaults");
                    coordinates.push(103.851959);
                    coordinates.push(1.290270);
                }
                activity.geometry.coordinates = coordinates;

                const eurl = new Date().getTime().toString() + '-' + convertToSlug(req.body.title);      
                activity.url = eurl;
                console.log("Saving ");
                console.log(eurl);

                activity.save(function (err, image) {
                    if(err){
                        
                    }
                    else
                    {
                        res.redirect('/events');
                    }
                });          
            });
        }
        else{
            var tempPath = req.file.path;
            var ext = path.extname(req.file.originalname).toLowerCase();
            var fileStub = genItemString() + ext;
            var targetPath = path.resolve('./public/events/' + fileStub);
            var imgUrl = '/bucket/events/' + fileStub;

            if (ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.gif') {
                fs.ensureDir('./public/events')
                .then(() => {
                    sharp(tempPath)
                    .resize(2000, 2000, {
                      fit: sharp.fit.inside,
                      withoutEnlargement: true
                    })
                    .withMetadata()
                    .toFile(targetPath)
                    .then((info) => {
                        if(!req.body.startDate){
                            req.body.startDate = new Date()
                        }
                        if(!req.body.endDate){
                            req.body.endDate = new Date().setMonth(new Date().getMonth() + 1);
                        }
                        const activity = new Events({
                            title: req.body.title,
                            company: req.body.company,
                            from: req.body.startDate,
                            to: req.body.endDate,
                            description: req.body.description,
                            venue: req.body.eventVenue,
                            postal: req.body.eventPostal,                
                            filename: imgUrl,
                            outboundURL: req.body.eventUrl,
                        });
    
    
                        console.log("Getting coordinates");
    
                        axios.get(`https://developers.onemap.sg/commonapi/search?searchVal=${req.body.eventPostal}&returnGeom=Y&getAddrDetails=N`)
                        .then(response => {
                            console.log("Got response");
                            console.log(response.data);
    
                            var coordinates = [];
                            if(response.data.results !== undefined && response.data.results.length != 0)
                            {
                                console.log(response.data.results[0])
                                coordinates.push(response.data.results[0].LONGITUDE);
                                coordinates.push(response.data.results[0].LATITUDE);
                            }
                            else{
                                //Push defaults
                                console.log("Push defaults");
                                coordinates.push(103.851959);
                                coordinates.push(1.290270);
                            }
                            activity.geometry.coordinates = coordinates;
    
                            const eurl = new Date().getTime().toString() + '-' + convertToSlug(req.body.title);      
                            activity.url = eurl;
                            console.log("Saving ");
                            console.log(eurl);
    
                            activity.save(function (err, image) {
                                if(err){ 
                                    logger.info("Activity unable to save");
                                    logger.info(err)
                                }
                                else
                                {
                                    fs.unlink(tempPath, function(err) {
                                        if (err) throw err;
                                        res.redirect('/events');
                                    }); 
                                }
                            });          
                        });

                    });
                })
                .catch(err => {
                    logger.info(err)
                })
            } else {
                fs.unlink(tempPath, function () {
                    if (err) throw err;
                    res.json(500, { error: 'Only image files are allowed.' });
                });
            }
        }
    });


    app.post('/deals/recommend', upload.single('efile'), async (req, res)=>{
        if(!req.file)
        {
            if(!req.body.startDate){
                req.body.startDate = new Date()
            }

            if(!req.body.endDate){
                req.body.endDate = new Date().setMonth(new Date().getMonth() + 1);
            }

            const deal = new Deals({
                title: req.body.title,
                company: req.body.company,
                from: req.body.startDate,
                to: req.body.endDate,
                description: req.body.description,
                venue: req.body.dealLocation,
                postal: req.body.dealPostal,                
                outboundURL: req.body.dealUrl,
            });

            console.log("Getting coordinates");

            axios.get(`https://developers.onemap.sg/commonapi/search?searchVal=${req.body.dealPostal}&returnGeom=Y&getAddrDetails=N`)
            .then(response => {
                console.log("Got response");
                console.log(response.data);

                var coordinates = [];
                if(response.data.results !== undefined && response.data.results.length != 0)
                {
                    console.log(response.data.results[0])
                    coordinates.push(response.data.results[0].LONGITUDE);
                    coordinates.push(response.data.results[0].LATITUDE);
                }
                else{
                    //Push defaults
                    console.log("Push defaults");
                    coordinates.push(103.851959);
                    coordinates.push(1.290270);
                }
                deal.geometry.coordinates = coordinates;

                const eurl = new Date().getTime().toString() + '-' + convertToSlug(req.body.title);      
                deal.url = eurl;
                console.log("Saving ");
                console.log(eurl);


                deal.save(function (err, image) {
                    if(err){

                    }
                    else
                    {
                        res.redirect('/deals');
                    }
                });          
            });
        }
        else
        {
            var tempPath = req.file.path;
            var ext = path.extname(req.file.originalname).toLowerCase();
            var fileStub = genItemString() + ext;
            var targetPath = path.resolve('./public/deals/' + fileStub);
            var imgUrl = '/bucket/deals/' + fileStub;
    
            if (ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.gif') {
                fs.ensureDir('./public/deals')
                .then(() => {

                    sharp(tempPath)
                    .resize(2000, 2000, {
                      fit: sharp.fit.inside,
                      withoutEnlargement: true
                    })
                    .withMetadata()
                    .toFile(targetPath)
                    .then((info) => {
                        if(!req.body.startDate){
                            req.body.startDate = new Date()
                        }
    
                        if(!req.body.endDate){
                            req.body.endDate = new Date().setMonth(new Date().getMonth() + 1);
                        }
    
                        const deal = new Deals({
                            title: req.body.title,
                            company: req.body.company,
                            from: req.body.startDate,
                            to: req.body.endDate,
                            description: req.body.description,
                            venue: req.body.dealLocation,
                            postal: req.body.dealPostal,    
                            filename: imgUrl,            
                            outboundURL: req.body.dealUrl,
                        });
    
                        console.log("Getting coordinates");
    
                        axios.get(`https://developers.onemap.sg/commonapi/search?searchVal=${req.body.dealPostal}&returnGeom=Y&getAddrDetails=N`)
                        .then(response => {
                            console.log("Got response");
                            console.log(response.data);
    
                            var coordinates = [];
                            if(response.data.results !== undefined && response.data.results.length != 0)
                            {
                                console.log(response.data.results[0])
                                coordinates.push(response.data.results[0].LONGITUDE);
                                coordinates.push(response.data.results[0].LATITUDE);
                            }
                            else{
                                //Push defaults
                                console.log("Push defaults");
                                coordinates.push(103.851959);
                                coordinates.push(1.290270);
                            }
                            deal.geometry.coordinates = coordinates;
    
                            const eurl = new Date().getTime().toString() + '-' + convertToSlug(req.body.title);      
                            deal.url = eurl;
                            console.log("Saving ");
                            console.log(eurl);
    
    
                            deal.save(function (err, image) {
                                if(err){ 
                                    logger.info("Deal unable to save");
                                    logger.info(err)
                                }
                                else
                                {
                                    fs.unlink(tempPath, function(err) {
                                        if (err) throw err;
                                        res.redirect('/deals');
                                    }); 
                                }
                            });          
                        });

                    });
                })
                .catch(err => {
                    logger.info(err)
                })
            } else {
                fs.unlink(tempPath, function () {
                    if (err) throw err;
                    res.json(500, { error: 'Only image files are allowed.' });
                });
            }
        }   
    });

    // DASHBOARD SECTION =========================
    app.get('/dash', async(req, res)=>  {
        const listings = await Item.find({company: req.user.company});
        res.render('dash.ejs', {
            user : req.user,
            listings
        });
    });

    //DETAILS SECTION =========================
    app.get('/details/:url', async(req, res)=> {  
        const listing = await Item.findOne({ url: req.params.url}).populate('company');
        res.render('details.ejs', {
            user : req.user,
            listing
        });
    });

    //DETAILS SECTION =========================
    app.get('/events/promo/:url', async(req, res)=> {  
        var promotion = await Events.findOne({ url: req.params.url});

        promotion.start = monthNames[promotion.from.getMonth()] + ' ' + promotion.from.getDate()  ;
        promotion.end = monthNames[promotion.to.getMonth()] + ' ' + promotion.to.getDate() ;


        res.render('promo.ejs', {
            user : req.user,
            promotion
        });
    });

    app.get('/deals/promo/:url', async(req, res)=> {  
        var promotion = await Deals.findOne({ url: req.params.url});

        promotion.start = monthNames[promotion.from.getMonth()] + ' ' + promotion.from.getDate()  ;
        promotion.end = monthNames[promotion.to.getMonth()] + ' ' + promotion.to.getDate() ;

        res.render('promo.ejs', {
            user : req.user,
            promotion
        });
    });

    app.get('/delete/details/:url', isLoggedIn, async(req, res)=> {  
        const listing = await Item.findOne({ url: req.params.url});

        if(listing.company == req.user.company.id){
            console.log("same company!");

            var deleteArray = listing.filenames.map(function(r) {
                return r.replace(/bucket/g, 'public');
            });

            console.log(deleteArray);

            deleteFiles(deleteArray, function(err) {
                if (err) {
                    logger.info(err);
                } else {
                    console.log('all images removed');
                    listing.remove();
                    res.redirect('/dash');
                }
            });

        }else{
            logger.info("You don't own this!");
            res.json(403, { error: 'You do not own this asset.' });
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

function convertToSlug(RawSlug)
{
    return RawSlug
        .toLowerCase()
        .replace(/[^\w ]+/g,'')
        .replace(/ +/g,'-')
        ;
}


function deleteFiles(files, callback){
    var i = files.length;
    files.forEach(function(filepath){
        var deletepath = '.'+ filepath;

        fs.unlink(deletepath, function(err) {
        i--;
            if (err) {
                callback(err);
                return;
            } else if (i <= 0) {
                callback(null);
            }
        });
    });
  }
