testreg.factory("GroupOfDistrictsService", function($http){
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
    	
    	searchGODByMultiParentType : function(params, entities){
    		var url = baseUrl + 'groupofdistrict' + '/?_=' + Math.random();
    		var entitiesParam = '';   		
			angular.forEach(entities, function(entity, index){
				entitiesParam += "parentEntityType=" + entity;
				  if (index != entities.length -1){
					  entitiesParam += "&";
				  }
			});
			if (entitiesParam.length > 0) {
				url = baseUrl + 'groupofdistrict' + '/?_=' + Math.random() + "&" + entitiesParam;
			}    		
    	    return  $http({
                method: 'GET',
                url: url,
                params: params                
    	    }).then(this.successHandler, this.errorHandler);
    	},
    	
	    saveGroupOfDistricts : function(groupOfDistricts){
	    	var method = 'POST';
	    	var url = baseUrl + 'groupofdistricts';
			if(groupOfDistricts.id){
				method = 'PUT';
				url += '/' + groupOfDistricts.id;
			}
	    	return $http({
				method: method,
				url: url,
				data: groupOfDistricts
			}).then(this.successHandler, this.errorHandler);
	    },
	    
    	
	    deleteGroupOfDistricts : function(groupOfDistrictsId){
	    	var method = 'DELETE';
	    	var url = baseUrl + 'groupofdistricts' + '/' + groupOfDistrictsId;
	    	return $http({
				method: method,
				url: url
			}).then(this.successHandler, this.errorHandler);
	    },
	    
	    loadGroupOfDistricts : function(id) {
	    		var url = baseUrl + 'groupofdistricts/'+ id + '/?_=' + Math.random();
   				return $http.get(url).then(this.successHandler, this.errorHandler);
	    },
	    findGroupOfDistrictsBySearchVal : function(searchVal,stateId,pageSize,searchById) {
	    	//If flag tell
	    	var params = null;

	    	if(searchById){
	    		params = { entityId: searchVal, stateAbbreviation:stateId,pageSize: pageSize, sortKey: "entityId",sortDir: "asc"};
	    	}else{
	        	params = { entityName: searchVal, stateAbbreviation:stateId, pageSize: pageSize, sortKey: "entityName", sortDir: "asc"};
	    	}
	    	return $http({
	            method: 'GET',
	            url: baseUrl + 'groupofdistrict',
	            params:params
	   	    }).then(this.successHandler, this.errorHandler);
	    },	    	    
    };
});