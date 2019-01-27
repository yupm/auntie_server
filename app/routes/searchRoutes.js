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
    app.get('/search', function(req, res) {
         res.render('search.ejs', {
             user : req.user,
             results: ""
         });
     });
 

     app.post('/search', async(req, res) => {
        console.log("Searching");
        console.log(req.body);  


        const esSearch = await client.search({
            index: 'consumer',
            body: {
              query: {
                multi_match: {
                    query: req.body.searchInput, 
                    fuzziness: 2,
                    prefix_length: 1,
                    fields: [ "tile", "description", "tags"] 
                }
              }
            }
          });
          
       // const results = await Item.find({ $text: { $search: req.body.searchInput } }).populate('company');

        console.log(esSearch);
        for (const result of esSearch.hits.hits) {
            console.log('result:', result);
        }


        res.render('search.ejs', {
            user : req.user,
            results: ""
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