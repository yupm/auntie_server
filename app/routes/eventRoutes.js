const mongoose = require('mongoose');
const EventDb = mongoose.model('events');


module.exports = function(app) {
    
    // EVENTS SECTION =========================
    app.get('/events', async (req, res) => {
        
        const events = await EventDb.find({ from: { $lt: new Date() } });

        console.log(events);

        res.render('events.ejs', {
            user : req.user
        });
    });

    app.get('/events/recommend', function(req, res) {
        res.render('recommend.ejs', {
            user : req.user
        });
    });

 }
 