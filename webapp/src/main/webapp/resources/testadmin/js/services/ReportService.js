testadmin.factory("ReportService", function($http,$filter,EntityService){
	var service = {
		getResource : function() {
			return 'Report';
		},
		
		getHttp : function() {
			return $http;
		},
		
		getBaseUrl : function() {
			return baseUrl;
		},
		getFormattedDate: function(date, format){
	    	return $filter('date')(date, format);
	    },
	    	 		
		loadTestStatus : function(){
			var status = new Array();
			status.push({id:'SCHEDULED',name:'NOT_STARTED'});
			status.push({id:'STARTED',name:'STARTED'});
			status.push({id:'COMPLETED',name:'COMPLETED'});
			status.push({id:'OPTED_OUT',name:'NON_PARTICIPANT'});
		    return status;
		    
		},
	    loadChildHierarchy : function(tenantType,clientData) {
	    		 var childArray = new Array();
	    		if(tenantType == 'CLIENT'){
	    	    	if(! clientData.groupOfStates){
	    	      	    childArray.push("GROUPOFSTATES");
	    	    	}
		    		childArray.push("STATE");
	    	    	if(! clientData.groupOfDistricts){
	    	      	    childArray.push("GROUPOFDISTRICTS");
	    	    	}
		    		childArray.push("DISTRICT");
		        	if(! clientData.groupOfInstitutions){
	    	      	    childArray.push("GROUPOFINSTITUTIONS");
	    	    	}		    		
		       		childArray.push("INSTITUTION");
		    	} else if (tenantType == 'GROUPOFSTATES') {
		    		childArray.push("STATE");
	    	    	if(! clientData.groupOfDistricts){
	    	      	    childArray.push("GROUPOFDISTRICTS");
	    	    	}
		    		childArray.push("DISTRICT");
		        	if(! clientData.groupOfInstitutions){
	    	      	    childArray.push("GROUPOFINSTITUTIONS");
	    	    	}		
		    		childArray.push("INSTITUTION");
		    	} else if (tenantType == 'STATE') {
	    	    	if(! clientData.groupOfDistricts){
	    	      	    childArray.push("GROUPOFDISTRICTS");
	    	    	}
		    		childArray.push("DISTRICT");
		        	if(! clientData.groupOfInstitutions){
	    	      	    childArray.push("GROUPOFINSTITUTIONS");
	    	    	}		
		    		childArray.push("INSTITUTION");
		    	} else if (tenantType == 'GROUPOFDISTRICTS') {
		    		childArray.push("DISTRICT");
		        	if(! clientData.groupOfInstitutions){
	    	      	    childArray.push("GROUPOFINSTITUTIONS");
	    	    	}		
		    		childArray.push("INSTITUTION");
		    	} else if (tenantType == 'DISTRICT') {
		        	if(! clientData.groupOfInstitutions){
	    	      	    childArray.push("GROUPOFINSTITUTIONS");
	    	    	}		
		    		childArray.push("INSTITUTION");
		    	} else if (tenantType == 'GROUPOFINSTITUTIONS') {
		    		childArray.push("INSTITUTION");
		    	} else if (tenantType == 'INSTITUTION') {
		    	
		    	}

		    	return childArray;
	
	    },
		
		findAllEntities : function(){
			return ["CLIENT", "GROUPOFSTATES", "STATE", "GROUPOFDISTRICTS", "DISTRICT", "GROUPOFINSTITUTIONS", "INSTITUTION" ];
		},

 
	    findEntityById : function(searchVal,parentType) {
	    	//If flag tell
	    	var params = null;
	    	params = { entityId: searchVal,  pageSize: 10, sortKey: "entityId",sortDir: "asc", currentPage:0};
	    	
	    	return $http({
	            method: 'GET',
	            url: baseUrl +EntityService.getByName(parentType),
	            params:params
	   	    }).then(this.successHandler, this.errorHandler);
	    },  
	    loadReport : function(params,serviceName) {
	    
	    	return $http({
	            method: 'POST',
	            url: baseUrl +serviceName,
	            data:params
	   	    }).then(this.successHandler, this.errorHandler);
	    },	    
	    loadParentByIdAndType : function(parentIdVal,parentType,entityType) {
	    	//If flag tell
	    	var params = null;
	    	var pageSize = 9999;

	    	params = {parentId:parentIdVal,parentEntityType:parentType,pageSize: pageSize, sortKey: "entityName",sortDir: "asc", currentPage:0};
	    	
	    	return $http({
	            method: 'GET',
	            url: baseUrl + EntityService.getByName(entityType),
	            params:params
	   	    }).then(this.successHandler, this.errorHandler);
	    },
	    loadOpportunities : function() {
		    
	    	return $http({
	            method: 'GET',
	            url: baseUrl +"/assessment/maxOpportunities",
	   	    }).then(this.successHandler, this.errorHandler);
	    },		    
	    	    
    };
	return angular.extend(service, BaseService);
});