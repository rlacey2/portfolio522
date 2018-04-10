// secret.js

// NEVER SAVE THIS FILE TO PUBLIC REPO/Location
// if using git, ensure it is in the .gitignore file
// Store relevant API keys and passwords here as a central store, ideally store as config variables in the cloud

var platform = require('./node_server/platform.js');
var runtime = platform.configure();  
 
var secret = {
 
    mongodb :   function () // using a function to return an object of mongodb settings for the server.js
				{			
					// all the next 5 values are setup by you first at mlabs using sandbox option
				    var username = "???";
                    var password = "???";
                    var url      = "ds???.mlab.com:???"; // CAREFUL
                    var database = "???";
					var collectionName = "??";    // this example assumes one collection only, multiple collections model with an object and keys here
					
					var dbURL = dbURL =  url + "/" + database;
					return {						
							connectionStr : function ()
							  { 								
								return "mongodb://" + username + ":" + password  + "@" + url + "/" + database;
							  },						
							database 		: database,
							collectionName 	: collectionName,
							dbURL			: dbURL
					}
				} , // mongodb
}; // secret

module.exports = secret;