testreg.factory("DistrictService", function($http){
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
		search : function(params){
    		var url = baseUrl + 'district' + '/?_=' + Math.random();
		    return  $http({
	            method: 'GET',
	            url: url,
	            params: params
		    }).then(this.successHandler, this.errorHandler);
		},
		
    	searchDistrictsByMultiParentType : function(params, entities){
    		var url = baseUrl + 'district' + '/?_=' + Math.random();
    		var entitiesParam = '';   		
			angular.forEach(entities, function(entity, index){
				entitiesParam += "parentEntityType=" + entity;
				  if (index != entities.length -1){
					  entitiesParam += "&";
				  }
			});
			if (entitiesParam.length > 0) {
				url = baseUrl + 'district' + '/?_=' + Math.random() + "&" + entitiesParam;
			}    		
    	    return  $http({
                method: 'GET',
                url: url,
                params: params
    	    }).then(this.successHandler, this.errorHandler);
    	},
    	
	    saveDistrict : function(districtData){
	    	var method = 'POST';
	    	var url = baseUrl + 'district';
			if(districtData.id){
				method = 'PUT';
				url += '/' + districtData.id;
			}
	    	return $http({
				method: method,
				url: url,
				data: districtData
			}).then(this.successHandler, this.errorHandler);
	    },
	    
    	
	    deleteDistrict : function(districtId){
	    	var method = 'DELETE';
	    	var url = baseUrl + 'district' + '/' + districtId;
	    	return $http({
				method: method,
				url: url
			}).then(this.successHandler, this.errorHandler);
	    },
	    
	    loadDistrict : function(id) {
	    		var url = baseUrl + 'district/'+ id + '/?_=' + Math.random();
   				return $http.get(url).then(this.successHandler, this.errorHandler);
	    },
	    findDistrictsBySearchValAndState : function(searchVal,stateId,pageSize) {
        	var params = {
        		    entityId: searchVal,
        		    stateAbbreviation:stateId,
        		    pageSize: pageSize,
        		    sortKey: "entityId",
        		    sortDir: "asc"
        	};
  	    	return $http({
   	            method: 'GET',
   	            url: baseUrl + 'district',
   	            params:params
   	   	    }).then(this.successHandler, this.errorHandler);
  	    },	        
	    findDistrictsBySearchVal : function(searchVal,stateId,pageSize,searchById) {
	    	//If flag tell
	    	var params = null;

	    	if(searchById){
	    		params = { entityId: searchVal,  stateAbbreviation:stateId,pageSize: pageSize, sortKey: "entityId",sortDir: "asc"};
	    	}else{
	        	params = { entityName: searchVal, stateAbbreviation:stateId, pageSize: pageSize, sortKey: "entityName", sortDir: "asc"};
	    	}
	    	return $http({
	            method: 'GET',
	            url: baseUrl + 'district',
	            params:params
	   	    }).then(this.successHandler, this.errorHandler);
	    },
    
	    findDistrictByEntityId : function(entityId) {
        	var params = {
        		    entityId: entityId,
        		    sortKey: "entityId",
        		    sortDir: "asc"
        	};
	    	return $http({
	            method: 'GET',
	            url: baseUrl + 'district',
	            params:params
	   	    }).then(this.successHandler, this.errorHandler);
	    },
	    findDistrictByEntityName : function(entityName) {
        	var params = {
        			entityName: entityName,
        		    sortKey: "entityName",
        		    sortDir: "asc"
        	};
	    	return $http({
	            method: 'GET',
	            url: baseUrl + 'district',
	            params:params
	   	    }).then(this.successHandler, this.errorHandler);
	    },	    
    };
});