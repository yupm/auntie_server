const mongoose = require('mongoose');
const Item = mongoose.model('item');
var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
    host: 'localhost:9200',
    log: 'trace',
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
                    "geometry.coordinates" : [103.851959, 1.290270],
                    "order" : "asc",
                    "unit" : "km"
                },
            }
          ],
          query : {
            multi_match: {
              query: req.query.q, 
              fuzziness: 6,
              prefix_length: 1,
              fields: [ "title", "description", "tags", "specifications.details"] 
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
                fuzziness: 6,
                prefix_length: 1,
                fields: [ "title", "description", "tags", "specifications.details"] 
            }
          }
        }
      };
    

        const esSearch = await client.search({
            index: 'consumer',
            body
          });
          
        var obj_ids = esSearch.hits.hits.map(function(searchResult) { return mongoose.Types.ObjectId(searchResult._id); });
        const results = await Item.find({_id: {$in: obj_ids}}).populate('company');

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