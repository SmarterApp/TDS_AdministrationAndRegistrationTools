testreg.factory("TestStatusService", function($http, $timeout) {
	return {
		errorHandler : function(response) {
			var returnVal = {
				data : {},
				errors : []
			};
			for ( var field in response.data.messages) {
				for ( var messages in response.data.messages[field]) {
					returnVal.errors
							.push(response.data.messages[field][messages]);
				}
			}
			return returnVal;
		},
	    
		successHandler : function(response) {
			return {
				data : response.data,
				errors : []
			};
		},
		search : function(params){
    		var url = baseUrl + 'testStatus' + '/?_=' + Math.random();
		    return  $http({
	            method: 'GET',
	            url: url,
	            params: params
		    }).then(this.successHandler, this.errorHandler);
		},
	    save : function(data){
	    	var method = 'POST';
	    	var url = baseUrl + 'testStatus';
			if(data.id){
				method = 'PUT';
				url += '/' + data.id;
			}
	    	return $http({
				method: method,
				url: url,
				data: data
			}).then(this.successHandler, this.errorHandler);
	    },
	};
});