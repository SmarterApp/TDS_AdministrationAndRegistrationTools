testreg.factory("GroupOfStatesService", function($http){
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
    	
	    saveGroupOfStates : function(groupOfStates){
	    	var method = 'POST';
	    	var url = baseUrl + 'groupofstates';
			if(groupOfStates.id){
				method = 'PUT';
				url += '/' + groupOfStates.id;
			}
	    	return $http({
				method: method,
				url: url,
				data: groupOfStates
			}).then(this.successHandler, this.errorHandler);
	    },
	    
    	
	    deleteGroupOfStates : function(groupOfStatesId){
	    	var method = 'DELETE';
	    	var url = baseUrl + 'groupofstates' + '/' + groupOfStatesId;
	    	return $http({
				method: method,
				url: url
			}).then(this.successHandler, this.errorHandler);
	    },
	    
	    loadGroupOfStates : function(id) {
	    		var url = baseUrl + 'groupofstates/'+ id + '/?_=' + Math.random();
   				return $http.get(url).then(this.successHandler, this.errorHandler);
	    },
	    findGroupofStatesByEntityId : function(entityId) {
        	var params = {
        		    entityId: entityId,
        		    sortKey: "entityId",
        		    sortDir: "asc"
        	};
	    	return $http({
	            method: 'GET',
	            url: baseUrl + 'groupofstate',
	            params:params
	   	    }).then(this.successHandler, this.errorHandler);
	    },	  
	    findGroupOfStatesBySearchValAndState : function(searchVal,pageSize,searchById) {
	    	//If flag tell
	    	var params = null;

	    	if(searchById){
	    		params = { entityId: searchVal, pageSize: pageSize, sortKey: "entityId",sortDir: "asc"};
	    	}else{
	        	params = { entityName: searchVal,  pageSize: pageSize, sortKey: "entityName", sortDir: "asc"};
	    	}

	    	return $http({
	            method: 'GET',
	            url: baseUrl + 'groupofstate',
	            params:params
	   	    }).then(this.successHandler, this.errorHandler);
	    },	    
    };
});