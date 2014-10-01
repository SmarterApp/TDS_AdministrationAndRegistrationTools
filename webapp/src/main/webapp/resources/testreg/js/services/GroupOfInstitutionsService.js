testreg.factory("GroupOfInstitutionsService", function($http) {
	
	
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
    	
    	searchGOIByMultiParentType : function(params, entities){
    		var url = baseUrl + 'groupofinstitution' + '/?_=' + Math.random();
    		var entitiesParam = '';   		
			angular.forEach(entities, function(entity, index){
				entitiesParam += "parentEntityType=" + entity;
				  if (index != entities.length -1){
					  entitiesParam += "&";
				  }
			});
			if (entitiesParam.length > 0) {
				url = baseUrl + 'groupofinstitution' + '/?_=' + Math.random() + "&" + entitiesParam;
			}    		
    	    return  $http({
                method: 'GET',
                url: url,
                params: params
    	    }).then(this.successHandler, this.errorHandler);
    	},
	    loadGroupOfInstitutions : function(id) {
    		var url = baseUrl + 'groupofinstitutions/'+ id + '/?_=' + Math.random();
				return $http.get(url).then(this.successHandler, this.errorHandler);
	    },

	    deleteGroupOfInstitutions : function(groupofinstitutionsId){
	
	    	var method = 'DELETE';
	    	var url = baseUrl + 'groupofinstitutions' + '/' + groupofinstitutionsId;
	    	return $http({
				method: method,
				url: url
			}).then(this.successHandler, this.errorHandler);
	    },
	    

	    saveGroupOfInstitutions : function(groupOfInstitutions){
	    	
	    	var method = 'POST';
	    	var url = baseUrl + 'groupofinstitutions';
			if(groupOfInstitutions.id){
				method = 'PUT';
				url += '/' + groupOfInstitutions.id;
			}
	    	return $http({
				method: method,
				url: url,
				data: groupOfInstitutions
			}).then(this.successHandler, this.errorHandler);
	    },
	    
	    findAllByDistrict : function(districtId,pageSize) {
        	var params = {
        		    parentEntityId: districtId,
        		    pageSize: pageSize,
        		    sortKey: "entityId",
        		    sortDir: "asc"
        	};
	    	return $http({
	            method: 'GET',
	            url: baseUrl + 'groupofinstitution',
	            params:params
	   	    }).then(this.successHandler, this.errorHandler);
	    },
	    findGroupOfInstitutionsBySearchVal: function(searchVal,stateId,pageSize,searchById) {
	    	//If flag tell
	    	var params = null;

	    	if(searchById){
	    		params = { entityId: searchVal, stateAbbreviation:stateId,pageSize: pageSize, sortKey: "entityId",sortDir: "asc"};
	    	}else{
	        	params = { entityName: searchVal, stateAbbreviation:stateId, pageSize: pageSize, sortKey: "entityName", sortDir: "asc"};
	    	}
	    	return $http({
	            method: 'GET',
	            url: baseUrl + 'groupofinstitution',
	            params:params
	   	    }).then(this.successHandler, this.errorHandler);
	    },	    	
	};
});