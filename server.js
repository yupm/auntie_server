// server.js

// set up ======================================================================
// get all the tools we need
var express  = require('express');
var app      = express();
var port     = process.env.PORT || 8081;
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');
var     path = require('path');
const logger = require('./config/logger')(__filename);
var expressWinston = require('express-winston');

const fs = require('fs');
const http = require('http');
const https = require('https');

var keys = require('./config/keys');

require('./app/models/post');
require('./app/models/event');
require('./app/models/deal');
require('./app/models/item');
require('./app/models/company');


var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');
const MongoStore = require('connect-mongo')(session);

var configDB = require('./config/database.js');


// Certificate
//const privateKey = fs.readFileSync('/home/ubuntu/ssl/cfauntie.key.pem', 'utf8');
//const certificate = fs.readFileSync('/home/ubuntu/ssl/cfauntie.cert.pem', 'utf8');

/*
const credentials = {
	key: privateKey,
	cert: certificate
};
*/


// configuration ===============================================================
mongoose.connect(configDB.url, { useNewUrlParser: true }); // connect to our database

require('./config/passport')(passport); // pass passport for configuration
app.use(expressWinston.logger(logger));

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/bucket', express.static(path.join(__dirname, './public')));
app.use('/assets', express.static(path.join(__dirname, '/assets')));


app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({
    secret: keys.sessionSecret, // session secret
    resave: true,
    saveUninitialized: true,
    store: new MongoStore({mongooseConnection: mongoose.connection })
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session
app.disable('x-powered-by');

// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
// Starting both http & https servers
const httpServer = http.createServer(app);
//const httpsServer = https.createServer(credentials, app);

httpServer.listen(port, () => {
	console.log('HTTP Server running on port' + port);
});

/*
httpsServer.listen(443, () => {
	console.log('HTTPS Server running on port 443');
});*/



