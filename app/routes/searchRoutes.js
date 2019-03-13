const mongoose = require('mongoose');
const Item = mongoose.model('item');
var elasticsearch = require('elasticsearch');
const logger = require('../../config/logger')(__filename);

var client = new elasticsearch.Client({
    host: 'localhost:9200',
    log: [{
      type: 'stdio',
     // levels: [ 'trace', 'error', 'warning'] // change these options
    }],
    apiVersion: '5.6'
  });

module.exports = function(app) {
    // SEARCH SECTION =========================
    app.get('/search',  async(req, res) =>{
      console.log("I am in search request");

      console.log(req.url);

      var body;

      var coordinates = [ 103.851959, 1.290270];

      if(req.query.loc && req.query.loc!="0")
      {
        console.log("Filter distance");

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

        body = {
          sort : [
            {
                _geo_distance : {
                    "geometry.coordinates" : coordinates,
                    "order" : "asc",
                },
            }
          ],
          query : {
            multi_match: {
              query: req.query.q, 
              fuzziness: 3,
              prefix_length: 1,
              fields: [ "title", "description", "specifications.details", "companyname"],
              cutoff_frequency: 0.0001
            }
          }
        }
      }
      else
      {
        console.log("Multi search");
        body= {
          query: {
            multi_match: {
                query: req.query.q, 
                fuzziness: 3,
                prefix_length: 1,
                fields: [ "title", "description", "specifications.details","companyname"],
                cutoff_frequency: 0.0001
            }
          }
        }
      };

      if(req.query.start){
        body["from"] = req.query.start;
        body["size"] = 20;
      }
  
      const esSearch = await client.search({
          index: 'consumer',
          body
        });
        
      var obj_ids = esSearch.hits.hits.map(function(searchResult) { return mongoose.Types.ObjectId(searchResult._id); });
      const results = await Item.find({_id: {$in: obj_ids}}).populate('company');

      for(var s = 0; s < obj_ids.length; s++){
        var tempResult = results[s];          
          for(var j = s; j < obj_ids.length; j++){
            if(results[j]._id.equals(obj_ids[s])){
                results[s] = results[j];
                results[j] = tempResult;
                break;
            }
          }
      }

      res.render('search.ejs', {
          user : req.user,
          results
      });
     });

 }
 

 /*
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
*/