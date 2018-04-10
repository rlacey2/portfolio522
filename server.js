var express = require('express');


var bodyParser = require('body-parser');
var logger = require('morgan');  // console logging of requests
var shares   = require('./routes/shares'); // delegate all requests for shares to this file, see below

var path = require('path');
var fs = require('fs');  // for loading localhost test certs
var os = require('os');
var https = require('https'); 
var http  = require('http');  

var platform = require('./node_server/platform.js').configure();
 
var app = express(); 
app.enable('trust proxy'); // needed for req.secure for bluemix

app.use(bodyParser.urlencoded({'extended':'true'}));             
app.use(bodyParser.json());                                      
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));  
app.use(logger('dev'));  // log every request to the console


app.use (function (req, res, next) {  // req.protocol
        if (req.secure) {
                // request was via https, so do no special handling
                next();
        } else { // request was via http, so redirect to https
				console.log("redirecting from http to https");
				console.log('https://' + req.headers.host + req.url);
                res.redirect('https://' + req.headers.host + req.url);
        }
});
 
app.use(   "/",  
			express.static(__dirname + '/_ngClient')    
);
 
app.use( // alias to third party js code etc
			"/js_thirdparty", //the URL throught which you want to access   content
			express.static(__dirname + '/js_thirdparty') 
);		
app.use( //  alias mapping
			"/node_modules", //the URL throught which you want to access   content
			express.static(__dirname + '/node_modules') 
);
 
app.use('/api/v1/shares',  shares);   // route client calls with this api syntax to .\routes\shares.js

app.use(function(req, res, next) { // If no route is matched by now, it must be a 404
	console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%");
    var err = new Error('Route Not Found, are you using the correct http verb / is it defined?\n\n' + req.method + "\t" + req.path + "\n\n");
    err.status = 404;		 
    next(err);
});

// start the server depending on the deployed location
if (platform.isLocalHost) { //was cfCore.isLocal
// openssl genrsa -out test-key.pem 1024 
// openssl req -new -key test-key.pem -out certrequest.csr
// openssl x509 -req -in certrequest.csr -signkey test-key.pem -out test-cert.pem	
	console.log("*** Using temp SSL keys on the nodejs server");
	var privateKey   = fs.readFileSync('ssl/test-key.pem');
	var certificate  = fs.readFileSync('ssl/test-cert.pem'); 

    var localCertOptions = {  // use local self-signed cert
        key: privateKey, 
        cert: certificate, 
        requestCert: false, 
        rejectUnauthorized: false 
    }; 		
		
    https.createServer (localCertOptions, app).listen (platform.port, function () { 
	   console.log(new Date().toISOString());
	   console.log(__dirname + '/_ngClient');
    }); 
 	
} else { // not local, its in the cloud somewhere, assuming cloud provides ssl certs for https

    if (platform.architecture === "bluemix") // could refactor next 2, leaving separate incase needed in future
	{
		app.listen(platform.port, function() {
		    console.log (platform.architecture + ' server startup port: ' + platform.port); 
		}); 
	}
	else 
		if (platform.architecture === "heroku")
	{ 
		app.listen(platform.port, function() {
		    console.log (platform.architecture + ' server startup port: ' + platform.port); 
		}); 			
	}		
}    