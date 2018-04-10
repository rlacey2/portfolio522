var angularnodeApp = angular.module("angularnodeApp");
  
angularnodeApp.controller('SharesCtrl', ['$scope' ,  'srvShares',  
	function($scope, srvShares ) {
 
		$scope.formData = {};
		$scope.formMeta = {};
 	
		$scope.requeryShares = function() {
			srvShares.requeryShares()  
				.then( stocks => {
					$scope.formData  = stocks; // extract the array of Shares
				 
					srvShares.flash({msg:"Shares Requeried", duration: 4000, type : "info" });
				})
				.catch( error => {
					$scope.formData.shares = {}; // assume no data
					srvShares.flash({msg:"Error Requerying Shares", duration: 4000, type : "danger" });
				});	
		}		
 	
		$scope.resetShares = function() {
			srvShares.resetShares()  
				.then( stocks => {
					$scope.formData  = stocks; // extract the array of Shares
					srvShares.flash({msg:"Shares Reset", duration: 4000, type : "info" });
				})
				.catch( error => {
					$scope.formData.shares = {}; // assume no data
					srvShares.flash({msg:"Error Resetting Shares", duration: 4000, type : "danger" });
				});	
		}
		
		$scope.saveShares = function() {
			srvShares.saveShares()  
				.then( stocks => {
					$scope.formData  = stocks; // extract the array of Shares
					srvShares.flash({msg:"Shares Saved", duration: 4000, type : "info" });
				})
				.catch( error => {
					$scope.formData.shares = {}; // assume no data
					srvShares.flash({msg:"Error Saving Shares", duration: 4000, type : "warning" });
				});				
		}		
 	

		$scope.deleteShares = function(index,id) {
			srvShares.delete(id)
				.then( () => $scope.Shares.splice(index, 1))
				.catch( error => {
					// do some feedback
				});					
		}	
 
		// init
		$scope.requeryShares();  // 
  			
}]); // SharesCtrl	
	 
	 
	 
	
 		
 
	
		