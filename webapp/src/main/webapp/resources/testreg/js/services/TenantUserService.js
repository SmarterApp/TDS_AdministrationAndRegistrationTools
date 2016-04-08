testreg.factory("TenantUserService", function($http){
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
    	
		getAssets : function(tenantId){
			var url = baseUrl + 'user/assets';
		    return  $http.get(url,  {params:{'tenantId': tenantId, '_': Math.random()}}).then(this.successHandler, this.errorHandler);
    	},
    	getApplicableTenants : function(){
			var url = baseUrl + 'security/applicableTenants?_=' + Math.random();
		    return  $http.get(url,  {params:{}}).then(this.successHandler, this.errorHandler);
    	},
		getCurrentUser : function(){
			var url = baseUrl + 'security/currentUser';
		    return  $http.get(url).then(this.successHandler, this.errorHandler);
    	},
    };
});