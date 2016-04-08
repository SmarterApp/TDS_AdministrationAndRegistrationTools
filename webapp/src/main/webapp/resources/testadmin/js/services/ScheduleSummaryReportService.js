testadmin.factory("ScheduleSummaryReportService", function($http,$filter,EntityService, StudentService, FacilityService){
	var service = {
		getResource : function() {
			return 'participateReport';
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
	    
	    loadAggregateLevels: function() {
	    	return [
	    	        	{id: 'PROCTOR', name: 'PROCTOR'},
	    	        	{id: 'STUDENT', name: 'STUDENT'}
	    	       ];
	    },
	    
		findAllEntities : function(){
			return ["CLIENT", "GROUPOFSTATES", "STATE", "GROUPOFDISTRICTS", "DISTRICT", "GROUPOFINSTITUTIONS", "INSTITUTION" ];
		},
		
		getEntityName: function(entityType) {
			if(entityType == "STUDENT") {
				return "students";
			} else if(entityType == "FACILITY") {
				return "facilities";
			}
			else {
				return EntityService.getByName(entityType);
			}
		},
		
	    loadChildHierarchy : function(tenantType) {
	    	var childArray = new Array();
	    		if(tenantType == 'CLIENT'){
		    		childArray.push("GROUPOFSTATES");
		    		childArray.push("STATE");
		    		childArray.push("GROUPOFDISTRICTS");
		    		childArray.push("DISTRICT");
		    		childArray.push("GROUPOFINSTITUTIONS");
		    		childArray.push("INSTITUTION");
		    	} else if (tenantType == 'GROUPOFSTATES') {
		    		childArray.push("STATE");
		    		childArray.push("GROUPOFDISTRICTS");
		    		childArray.push("DISTRICT");
		    		childArray.push("GROUPOFINSTITUTIONS");
		    		childArray.push("INSTITUTION");
		    	} else if (tenantType == 'STATE') {
		    		childArray.push("GROUPOFDISTRICTS");
		    		childArray.push("DISTRICT");
		    		childArray.push("GROUPOFINSTITUTIONS");
		    		childArray.push("INSTITUTION");
		    	} else if (tenantType == 'GROUPOFDISTRICTS') {
		    		childArray.push("DISTRICT");
		    		childArray.push("GROUPOFINSTITUTIONS");
		    		childArray.push("INSTITUTION");
		    	} else if (tenantType == 'DISTRICT') {
		    		childArray.push("GROUPOFINSTITUTIONS");
		    		childArray.push("INSTITUTION");
		    	} else if (tenantType == 'GROUPOFINSTITUTIONS') {
		    		childArray.push("INSTITUTION");
		    	} else if (tenantType == 'INSTITUTION') {
		    		childArray.push("FACILITY");
		    		childArray.push("STUDENT");
		    	}

		    	return childArray;
	    },
	    isEntityAllowed : function (entity) {
	    	allowedEntities = this.loadChildHierarchy();
	    	if (allowedEntities.indexOf(entity) == 1 ) {
	    		return false;
	    	} else {
	    		return true;
	    	}
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
	    loadParents : function(entityType, params) {
	    	var MAX_NUM = 9999999; //Some MAX Number

	    	if(!params.pageSize) {
	    		params.pageSize = MAX_NUM;
	    	}
	    	if(!params.sortKey) {
	    		params.sortKey = "entityName";
	    	}
	    	if(!params.sortDir) {
	    		params.sortDir = "asc";
	    	}
	    	params.currentPage= 0; //Always
	    	
	    	if(entityType == "STUDENT") {
	    		return this.loadStudents(params);
	    	} else if(entityType == "FACILITY") {
	    		return this.loadFacility(params);
	    	}	    	
	    	return $http({
	            method: 'GET',
	            url: baseUrl + EntityService.getByName(entityType),
	            params:params
	   	    }).then(this.successHandler, this.errorHandler);
	    },
	    loadStudents: function(params) {
	    	params.sortKey = "firstName";
	    	if(params.parentEntityType) {
	    		delete params.parentEntityType;
	    	}
	    	return StudentService.searchStudents(params);
	    },
	    loadFacility: function(params) {
	    	params.institutionId = params.institutionEntityMongoId;
	    	delete params.institutionEntityMongoId;
	    	if(params.parentEntityId) {
	    		delete params.parentEntityId;
	    	}
	    	if(params.parentEntityType) {
	    		delete params.parentEntityType;
	    	}
	    	params.sortKey = 'institutionIdentifier';
	    	return FacilityService.search(params);
	    },
	    getStateAbbreviation:function(states, statePk) {
	    	if(!statePk) {
	    		return states[0].entityId;
	    	}
	    	
	    	var stateAbbreviation = "";
	    	angular.forEach(states, function(state){
	    		if(state.id == statePk) {
	    			stateAbbreviation =  state.entityId;
	    		};
	    	});
	    	return stateAbbreviation;
	    },
	    searchSchedule: null,
	    
    };
	return angular.extend(service, BaseService);
});