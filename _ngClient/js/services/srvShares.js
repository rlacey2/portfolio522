var angularnodeApp = angular.module("angularnodeApp");
  
angularnodeApp.service('srvShares', [ '$http', 'nrzLightify', '$q',  function( $http, nrzLightify, $q ) {
	var routePrefix = '/api/v1/shares';  // each to change in future
	
	var currentStocksDocument = {}; // the service copy of the data
	
	function flash(options) {   // technical debt, put this in a utility service
					nrzLightify({
					type: options.type || 'info',   //   info  || warning  ||  danger  || success
					text: options.msg || "",
				},  options.duration || 5000);
	}
	
	
	// static share data for testing /resetting, in a real application this would not be here
	
	var stocks = {  // no _id here it will be set or reused during a reset
				"AIBG_I" : { "Name" : "Allied Irish Banks Group", "HO": "Dublin", 
 
							"held": [ { "ts" : "20170101", "ex" : "ise" , "number" : 1000, "cost": 4500.00,  
			                 "pps" : 4.50 , "cpps" : 4.60, "nowValue": 0, "gainloss" :0, "sellingcosts" : 0},
							 
							  { "ts" : "20170102", "ex" : "ise" , "number" : 1000, "cost": 4600.00,  
			                 "pps" : 4.60 , "cpps" : 4.60, "nowValue": 0, "gainloss" :0, "sellingcosts" : 0}
							]
							}
			 ,
				"BOI_I" : { "Name" : "Bank of Ireland", "HO": "Dublin", 
 
							"held": [ { "ts" : "20170101", "ex" : "ise" , "number" : 2000, "cost": 14000.00,  
			                 "pps" : 7 , "cpps" : 8.50, "nowValue": 0, "gainloss" :0, "sellingcosts" : 0},
							 
							  { "ts" : "20170102", "ex" : "ise" , "number" : 3000, "cost": 24000.00,  
			                 "pps" : 8 , "cpps" : 8.50, "nowValue": 0, "gainloss" :0, "sellingcosts" : 0}
							]
							}			 
			 
	}; // stocks	
  
  
  
  	function sumQuantityOfEachStock(allStocks) {  // refactor of 603 sumQuantity() in demo1.js 
			// for each stock holding, sum the total number of shares remaining
			
			// we have to access each stock and then process any of its held records and then store the total
			// back on the relevant portion of the structure, Object.keys will give a list of the keys = symbols.
			
			var stockSymbols = Object.keys(allStocks );
			
			// iterate each stock 
			var tempStock;
			stockSymbols.forEach(aStockSymbol =>
			{
				console.log(aStockSymbol)
				// get the data of aStockSymbol
				tempStock = allStocks[aStockSymbol]; // copy to tempStock so we can work on it a bit easier
				var i;
				var qtyTotal = 0;
				for (i = 0; i < tempStock.held.length; i++)
				{
					// generate a value to go on each row for a stock entry
					// tempStock.held[i].nowValue =  WORK THIS OUT YOU HAVE CLUES IN SOME PROVIDED EXAMPLES
					// generate a cumulative total to be used at the end of all the stock lines
					qtyTotal = qtyTotal + tempStock.held[i].number;  // for the total row
				}
				// store the total back on the object to access in the html
				allStocks[aStockSymbol].totalQuantity = qtyTotal;
				console.log(tempStock);
			});	
		}
  
  
 
	function requeryShares(_id) {    
	        var deferred = $q.defer();
            var URL;
			
            if (_id)    
				URL = routePrefix + '/' + _id;   
			else
				URL = routePrefix  
		
			$http.get(URL).then( Result => {
							currentStocksDocument = Result.data;  // result from the cloud
							// can do any post processing calculations here
							// if complex, factor this code to a function
							
							// as proof of concept we will total the number of shares of each stocks
							sumQuantityOfEachStock(currentStocksDocument.stocks);
	 
							deferred.resolve(currentStocksDocument);
						  })
						  .catch ( error => {
							  currentStocksDocument = {};
							  deferred.reject({});
						  });
	
			return deferred.promise;
			}
		

		
	function resetShares() {  //overwrite the existing shares to reset the data to the static values above
			var deferred = $q.defer();
			
			var stocksDocument = { "stocks" : stocks }; // use the static stocks from above
 			
			currentStocksDocument = currentStocksDocument || {};  // as it may be empty at startup
			if (currentStocksDocument._id) stocksDocument._id = currentStocksDocument._id;//  to force an update rather than create by detecting the _id later
			
			$http.post(routePrefix    , stocksDocument) 	// call the server which calls mongoDB	, body contains the stocks
						.then( Result => {
			 				currentStocksDocument = Result.data;
							sumQuantityOfEachStock(currentStocksDocument.stocks);
							deferred.resolve(currentStocksDocument);
						  })
						  .catch ( error => {
							  currentStocksDocument = {};
							  deferred.reject({});
						  });
			return deferred.promise;			  
			}
		

		
	function saveShares() {  // save the current stocks that have been downloaded and possibly modified by the user
			var deferred = $q.defer();	
			$http.post(routePrefix    , currentStocksDocument)	// call the server which calls mongoDB	, body is the currentStocksDocument
						.then( Result => {
			 				currentStocksDocument = Result.data;
							deferred.resolve(currentStocksDocument);
						  })
						  .catch ( error => {
							  currentStocksDocument = {};
							  deferred.reject({});
						  });
			return deferred.promise;			  
			}		
			
			 
	return { // expose the methods / functions of this service
			 flash 			: flash,
	         resetShares 	: resetShares,
	         saveShares 	: saveShares,
			 requeryShares  : requeryShares 
			} 						
}]); // srvShares		
		
		
		