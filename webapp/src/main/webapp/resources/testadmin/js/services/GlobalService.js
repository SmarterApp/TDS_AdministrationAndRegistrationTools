testreg.factory("$global", function($http, $filter) {
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
        
        request: function(urlAndParamAndMethod) {
        	return $http(urlAndParamAndMethod).then(this.successHandler, this.errorHandler);
        }
    };
});