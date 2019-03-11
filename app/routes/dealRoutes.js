const mongoose = require('mongoose');
const DealDb = mongoose.model('deals');
var h2p = require('html2plaintext');
const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

module.exports = function(app) {
    
    // DEALS SECTION =========================
    app.get('/deals', async (req, res) => {

        console.log(req.query);

        var dateFrom = new Date();
        var dateTill = new Date().setFullYear(new Date().getFullYear() + 1);
        dateTill = new Date(dateTill);
        let deals;

        var coordinates = [ 103.851959, 1.290270];

        if(req.query.f)
        {
            dateFrom = new Date(req.query.f);
        }

        if(req.query.t)
        {
            dateTill = new Date(req.query.t);
        }

        dateFrom.setDate(dateFrom.getDate()-1);

        if(req.query.loc && req.query.loc!="0")
        {
            if(req.query.loc =="12"){ coordinates[0] = 103.857233; coordinates[1]= 1.326918; }
            if(req.query.loc =="10"){coordinates[0] = 103.806918; coordinates[1]= 1.313175;}
            if(req.query.loc =="09"){coordinates[0] = 103.839142; coordinates[1]= 1.302186;}
            if(req.query.loc =="13"){coordinates[0] = 103.874080; coordinates[1]= 1.334911;}
            if(req.query.loc =="20"){coordinates[0] = 103.834898; coordinates[1]= 1.363935;}
            if(req.query.loc =="03"){coordinates[0] = 103.817818; coordinates[1]= 1.286258;}
            if(req.query.loc =="21"){coordinates[0] = 103.781152; coordinates[1]= 1.345959;}
            if(req.query.loc =="01"){coordinates[0] = 103.857231; coordinates[1]= 1.281608;}
            if(req.query.loc =="15"){coordinates[0] = 103.899341; coordinates[1]= 1.303275;}
            if(req.query.loc =="18"){coordinates[0] = 103.942101; coordinates[1]= 1.364472;}
            if(req.query.loc =="25"){coordinates[0] = 103.769120; coordinates[1]= 1.421162;}
            if(req.query.loc =="24"){coordinates[0] = 103.701711; coordinates[1]=  1.401733;}
            if(req.query.loc =="22"){coordinates[0] = 103.694844; coordinates[1]= 1.333989;}
            if(req.query.loc =="26"){coordinates[0] = 103.818596; coordinates[1]=  1.396574;}
            if(req.query.loc =="28"){coordinates[0] = 103.868431; coordinates[1]= 1.407088;}
            if(req.query.loc =="23"){coordinates[0] = 103.759325; coordinates[1]= 1.373564;}
            if(req.query.loc =="04"){coordinates[0] = 103.817038; coordinates[1]=  1.271327;}
            if(req.query.loc =="05"){coordinates[0] = 103.777660; coordinates[1]= 1.295978;}
            if(req.query.loc =="16"){coordinates[0] = 103.946680; coordinates[1]= 1.325934;}
            
            console.log("dateTill is " + dateTill + " f is " + dateFrom);

            deals = await DealDb.aggregate([
                {$geoNear: {
                    near: { type: "Point", "coordinates": [ coordinates[0] , coordinates[1] ] },
                    spherical: true,
                    distanceField: "dist.calculated",
                    maxDistance: 10000,
                    key: "geometry",
                    query: { from: {$lt: dateTill}, to: { $gte: dateFrom} }
                 }},       
            ]);

            console.log(deals);
        }
        else
        {
            console.log("t is " + dateTill + "f is " + dateFrom);

            deals = await DealDb.find({ from: {$lt: dateTill}, to: { $gte: dateFrom} });
        }
        

        if(deals != null){
            for(var i = 0 ; i < deals.length; i ++){
                deals[i].description = h2p(deals[i].description);
                if(deals[i].description.length > 250 )
                {
                    deals[i].description = deals[i].description.substring(0, 250);
                    deals[i].description = deals[i].description + '...';
                }
                deals[i].start = monthNames[deals[i].from.getMonth()] + ' ' + deals[i].from.getDate()  ;
                deals[i].end = monthNames[deals[i].to.getMonth()] + ' ' + deals[i].to.getDate() ;
            }
            deals.sort(function(a,b){
                // Turn your strings into dates, and then subtract them
                // to get a value that is either negative, positive, or zero.
                return new Date(a.from) - new Date(b.from);
            });
        }
        console.log("rending deals");

        res.render('deals.ejs', {
            user : req.user,
            deals
        });
    });

    app.get('/deals/recommend', function(req, res) {
        res.render('dealsrecommend.ejs', {
            user : req.user
        });
    });

 }
 

