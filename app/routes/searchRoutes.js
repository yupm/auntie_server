const mongoose = require('mongoose');
const Item = mongoose.model('item');
const querystring = require('querystring');
var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
    host: 'localhost:9200',
    log: 'trace',
    apiVersion: '5.6'
  });

module.exports = function(app) {
    // SEARCH SECTION =========================
    app.get('/search',  async(req, res) =>{

        const esSearch = await client.search({
            index: 'consumer',
            body: {
              query: {
                multi_match: {
                    query: req.query.q, 
                    fuzziness: 6,
                    prefix_length: 1,
                    fields: [ "tile", "description", "tags"] 
                }
              }
            }
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