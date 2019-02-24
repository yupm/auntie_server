const mongoose = require('mongoose');
const EventDb = mongoose.model('events');
var h2p = require('html2plaintext');
const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

module.exports = function(app) {
    
    // EVENTS SECTION =========================
    app.get('/events', async (req, res) => {

        console.log(req.query);

        var f = new Date();
        var t = new Date().setFullYear(new Date().getFullYear() + 1);
        let events;

        if(req.query.f)
        {
            f = new Date(req.query.f);
        }

        if(req.query.t)
        {
            t = new Date(req.query.t);
        }

        f.setDate(f.getDate()-1);

        if(req.query.loc)
        {

            if(req.query.loc ==""){}
            if(req.query.loc ==""){}
            if(req.query.loc ==""){}
            if(req.query.loc ==""){}
            if(req.query.loc ==""){}
            if(req.query.loc ==""){}
            if(req.query.loc ==""){}
            if(req.query.loc ==""){}
            if(req.query.loc ==""){}
            if(req.query.loc ==""){}
            if(req.query.loc ==""){}
            if(req.query.loc ==""){}
            if(req.query.loc ==""){}
            if(req.query.loc ==""){}

            events = await EventDb.aggregate([
                {$geoNear: {
                    near: { type: "Point", coordinates: [ lat, lng ] },
                    key: "location",
                    spherical: true,
                    distanceField: "dist.calculated",
                    query: { from: { $gte: f, $lt: t} }
                 }},
                {$sort: {"dist.calculated" :1, "date": 1}}
            ]);
        }
        else
        {
            events = await EventDb.find({ from: { $gte: f, $lt: t} });
        }
        

        if(events != null){
            for(var i = 0 ; i < events.length; i ++){
                events[i].description = h2p(events[i].description);
                if(events[i].description.length > 250 )
                {
                    events[i].description = events[i].description.substring(0, 250);
                    events[i].description = events[i].description + '...';
                }
                events[i].start = monthNames[events[i].from.getMonth()] + ' ' + events[i].from.getDate()  ;
                events[i].end = monthNames[events[i].to.getMonth()] + ' ' + events[i].to.getDate() ;
            }
            events.sort(function(a,b){
                // Turn your strings into dates, and then subtract them
                // to get a value that is either negative, positive, or zero.
                return new Date(a.from) - new Date(b.from);
            });
        }

        res.render('events.ejs', {
            user : req.user,
            events
        });
    });

    app.get('/events/recommend', function(req, res) {
        res.render('recommend.ejs', {
            user : req.user
        });
    });

 }
 

