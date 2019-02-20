const mongoose = require('mongoose');
const Item = mongoose.model('item');
var elasticsearch = require('elasticsearch');
const logger = require('../../config/logger')(__filename);

var client = new elasticsearch.Client({
    host: 'localhost:9200',
    log: [{
      type: 'stdio',
      levels: [ 'trace', 'error', 'warning'] // change these options
    }],
    apiVersion: '5.6'
  });

module.exports = function(app) {
    // SEARCH SECTION =========================
    app.get('/search',  async(req, res) =>{
      console.log(req.query);

      var body;
      if(req.query.d)
      {
        console.log("Filter distance");
        body = {
          sort : [
            {
                _geo_distance : {
                    "geometry.coordinates" : [103.852585892041, 1.29293624242153],
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