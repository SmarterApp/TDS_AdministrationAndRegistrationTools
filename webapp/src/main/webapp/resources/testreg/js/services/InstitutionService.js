testreg.factory("InstitutionService", function($http) {
	
	
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
		
    	searchInstitutionsByMultiParentType : function(params, entities){
    		var url = baseUrl + 'institution' + '/?_=' + Math.random();
    		var entitiesParam = '';   		
			angular.forEach(entities, function(entity, index){
				entitiesParam += "parentEntityType=" + entity;
				  if (index != entities.length -1){
					  entitiesParam += "&";
				  }
			});
			if (entitiesParam.length > 0) {
				url = baseUrl + 'institution' + '/?_=' + Math.random() + "&" + entitiesParam;
			}    		
    	    return  $http({
                method: 'GET',
                url: url,
                params: params
    	    }).then(this.successHandler, this.errorHandler);
    	},

	    loadInstitution : function(id) {
    		var url = baseUrl + 'institution/'+ id + '/?_=' + Math.random();
				return $http.get(url).then(this.successHandler, this.errorHandler);
	    },

	    deleteInstitution : function(institutionId){
	    	var method = 'DELETE';
	    	var url = baseUrl + 'institution' + '/' + institutionId;
	    	return $http({
				method: method,
				url: url
			}).then(this.successHandler, this.errorHandler);
	    },
	    

	    saveInstitution : function(institutiontData){
	    	var method = 'POST';
	    	var url = baseUrl + 'institution';
			if(institutiontData.id){
				method = 'PUT';
				url += '/' + institutiontData.id;
			}
	    	return $http({
				method: method,
				url: url,
				data: institutiontData
			}).then(this.successHandler, this.errorHandler);
	    },

	    
	    findInstitutionsByStateAndDistrict : function(searchVal,stateId,districtId,pageSize) {
        	var params = {
        		    entityId: searchVal,
        		    stateAbbreviation: stateId,
        		    parentEntityId: districtId,
        		    pageSize: pageSize,
        		    sortKey: "entityId",
        		    sortDir: "asc"
        	};
	    	return $http({
	            method: 'GET',
	            url: baseUrl + 'institution',
	            params:params
	   	    }).then(this.successHandler, this.errorHandler);
	    },
	    
	    findInstitutionsByState : function(searchVal,stateId,pageSize) {
        	var params = {
        		    entityId: searchVal,
        		    stateAbbreviation: stateId,
        		    pageSize: pageSize,
        		    sortKey: "entityId",
        		    sortDir: "asc"
        	};
	    	return $http({
	            method: 'GET',
	            url: baseUrl + 'institution',
	            params:params
	   	    }).then(this.successHandler, this.errorHandler);
	    },
	    
	    findAllGroupOfInstitutionsParentByState : function(searchVal,stateId,pageSize) {
        	var params = {
        		    entityId: searchVal,
        		    stateAbbreviation: stateId,
        		    parentEntityType: "GROUPOFINSTITUTIONS",
        		    pageSize: pageSize,
        		    sortKey: "entityId",
        		    sortDir: "asc"
        	};
	    	return $http({
	            method: 'GET',
	            url: baseUrl + 'institution',
	            params:params
	   	    }).then(this.successHandler, this.errorHandler);
	    },
	    
	    findInstitutionByEntityId : function(entityId) {
        	var params = {
        		    entityId: entityId,
        		    sortKey: "entityId",
        		    sortDir: "asc"
        	};
	    	return $http({
	            method: 'GET',
	            url: baseUrl + 'institution',
	            params:params
	   	    }).then(this.successHandler, this.errorHandler);
	    },
	    findAllInstitution : function(searchVal,stateId,districtId,pageSize) {
        	var params = {
        		    entityId: searchVal,
        		    stateAbbreviation: stateId,
        		    parentEntityId: districtId,
        		    pageSize: pageSize,
        		    sortKey: "entityId",
        		    sortDir: "asc"
        	};
	    	return $http({
	            method: 'GET',
	            url: baseUrl + 'institutions/parentInstitutions',
	            params:params
	   	    }).then(this.successHandler, this.errorHandler);
	    },
	    	    
	    findInstitutionBySearchVal : function(searchVal,stateId,pageSize,searchById) {
	    	//If flag tell
	    	var params = null;

	    	if(searchById){
	    		params = { entityId: searchVal, stateAbbreviation:stateId,pageSize: pageSize, sortKey: "entityId",sortDir: "asc"};
	    	}else{
	        	params = { entityName: searchVal, stateAbbreviation:stateId, pageSize: pageSize, sortKey: "entityName", sortDir: "asc"};
	    	}
	    	return $http({
	            method: 'GET',
	            url: baseUrl + 'institution',
	            params:params
	   	    }).then(this.successHandler, this.errorHandler);
	    },	    		    
	};
});