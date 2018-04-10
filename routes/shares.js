var express = require('express');
var router = express.Router();   // router functionality
 

var MongoClient = require('mongodb').MongoClient  	// mongodb": "^3.0.4
var ObjectID = require('mongodb').ObjectID;  		// NB Needed

var Q = require('q'); // promises 

// remember server.js consumes /api/v1/shares/ part of the path before sending here
// this router handles from the last / i.e. route refactoring 
  
var stocksCollection;   // this will be the eventual reference to a collection within mongoDB in this file
 
var mongoDB_settings = require('../secrets.js').mongodb(); 

var connectURL = mongoDB_settings.connectionStr(); 

var dbName = mongoDB_settings.dbName; 
var collectionName = mongoDB_settings.collectionName; 

MongoClient.connect(connectURL) //  ^3.0.4   
		.then(client => {
				console.log("connected to the mongoDB using ^3.0.4");
				console.log("dbURL: " + mongoDB_settings.dbURL);
				stocksCollection = client.db(dbName).collection(collectionName);			
		})
		.catch( error => {		 
				console.log(error);	
				stocksCollection	= null;			
			})

// rest routes for handing parts of the crud behaviour			
			
router.get('/:_id', function(req, res) { 	// Read one document of stocks by id
	
	var _id = req.params.id;
	console.log("get /shares/:_id", _id);
	stocksCollection.find( {"_id": ObjectID(_id) })
							.then( Result => {
								res.status(200);
								res.json( 	Result[0] );
							})
							.catch( error => {
								console.log(error)
										res.status(404);
										res.json( error);									  
							});				 	
});

router.get('/', function(req, res) { 	// Read one document of stocks by id
	
	console.log("get /shares");
	stocksCollection.findOne( { })
							.then( Result => {
								res.status(200);
								res.json( 	Result  );
							})
							.catch( error => {
								console.log(error)
										res.status(404);
										res.json( error);									  
							});				 	
});

router.post('/', function(req, res) { 
	// we are cheating here, we only want one document in the collection IN THIS MODEL
	// create if it does not exist, otherwise overwrite existing
	// it exists if the _id is present in the req.body of the post
	console.log("post /shares");
	var _id;
	var stocksDocument;
	
	if (req.body._id) { // update
 	
		stocksDocument = req.body;
		_id = req.body._id;
		//console.log(req.body._id);
		 console.log(stocksDocument);			
 
												// at this stage _id is a STRING
	    stocksDocument._id = ObjectID( _id ); 	// NB ensure the _id is of the correct mongoDB type ERROR OTHERWISE
												// https://www.quora.com/How-do-I-update-a-document-in-mongodb-using-_id-as-query-parameter
		stocksCollection.update( {"_id" : ObjectID( _id )}, stocksDocument )
							.then( result => {
								res.status(200)
								res.json(stocksDocument);
							})
							.catch( error => {
									console.log(error);
									res.status(404);
									res.json( {} );	 //   failure								  
							});	
	}
	else
	{  // insert
 		
		//stocksDocument = {  "stocks" : req.body }; // need a wrapper as the _id is not to be in the stocks as a key
		stocksDocument =   req.body  ;
 
		stocksCollection.insert( stocksDocument )
							.then(result => {  
							   var inserted = 	result.ops[0];  
								console.log(inserted._id);
								res.status(200)
								res.json(inserted);
							})
							.catch( error => {
										console.log(error);
										res.status(404); 
										res.json( {} );	 //   failure								  
							});	
	} 	
});

router.put('/', function(req, res) {
	res.status(200)
    res.send({ 'msg' : 'PUT handler for /api/v1/shares route.'});
});
		
module.exports = router;


