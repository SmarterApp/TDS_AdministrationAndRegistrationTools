testreg.factory("StateService", function($http) {
	
	var staticStates=[];
	
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

	    loadStates : function() {
	    	//this function loads all the states from the db
    		var url = baseUrl + 'states/?_=' + Math.random() + '&pageSize=9999';
				return $http.get(url).then(this.successHandler, this.errorHandler);
	    },
	    
	    loadAllStates : function(){
            //this function loads all the states from the db (including all states even if no entities in those states exist)
    		var url = baseUrl + 'states/lookup/?_=' + Math.random() + '&static=true';
    		return $http.get(url).then(this.successHandler, this.errorHandler);
	    },
	    
		successHandler : function(response) {
			return {
				data : response.data,
				errors : []
			};
		},
		search : function(params){
    		var url = baseUrl + 'state' + '/?_=' + Math.random();
		    return  $http({
	            method: 'GET',
	            url: url,
	            params: params
		    }).then(this.successHandler, this.errorHandler);
		},
	    loadState : function(id) {
    		var url = baseUrl + 'state/'+ id + '/?_=' + Math.random();
				return $http.get(url).then(this.successHandler, this.errorHandler);
	    },
	    deleteState : function(stateId) {    	
	    	var method = 'DELETE';
	    	var url = baseUrl + 'state' + '/' + stateId;
	    	return $http({
				method: method,
				url: url
			}).then(this.successHandler, this.errorHandler);
	    },
	    saveState : function(statetData){
	    	var method = 'POST';
	    	var url = baseUrl + 'state';
			if(statetData.id){
				method = 'PUT';
				url += '/' + statetData.id;
			}
	    	return $http({
				method: method,
				url: url,
				data: statetData
			}).then(this.successHandler, this.errorHandler);
	    },
		getStateName : function(id,states) {
			var name;
			angular.forEach(states, function(value, index){
				if(id === value.entityId && !name) {
					name = value.entityName;
				}
			});
			return name;
	    }

	};
});