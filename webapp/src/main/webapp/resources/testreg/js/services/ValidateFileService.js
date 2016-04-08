testreg.factory("ValidateFileService", function($http){
    return {
    	errorHandler : function (response) {
    		var returnVal = {
    				data : {},
    				errors : []
    		};
    		for(var field in response.data.messages){
             	for(var messages in response.data.messages[field]) {
             		returnVal.errors.push(response.data.messages[field][messages]);
             	}
     		}
    		return returnVal;
    	},
    	
    	successHandler: function(response) {
    		return  {
    				data : response.data,
    				errors : []
    		};
        },
	    
	    validateFile : function(fileId) {
	    		var url = baseUrl + 'validateFile/'+ fileId + '/?_=' + Math.random();
   				return $http.get(url, {timeout:300000}).then(this.successHandler, this.errorHandler);
	    }
    };
});
