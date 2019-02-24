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
        var t = new Date();


        if(req.query.f)
        {
            f = new Date(req.query.f);
        }
        if(req.query.t)
        {
            t = new Date(req.query.t);
        }

        if(req.query.loc)
        {
            
        }
        
        f.setDate(f.getDate()-1);



        const events = await EventDb.find({ from: { $gte: d} });

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
 

