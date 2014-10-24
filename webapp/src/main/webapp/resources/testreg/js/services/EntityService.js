testreg.factory("EntityService", function($http, $rootScope, CurrentUserService){
	
	var endpoints = {"CLIENT":"clients", "STATE":"states", "GROUPOFSTATES":"groupofstates", "DISTRICT":"districts", 
					"GROUPOFDISTRICTS":"groupofdistricts", "INSTITUTION":"institutions", "GROUPOFINSTITUTIONS":"groupofinstitutions"};
	
	var endpointsForQueryById = {"CLIENT":"clients","STATE":"state", "GROUPOFSTATES":"groupofstates", "DISTRICT":"district", 
			"GROUPOFDISTRICTS":"groupofdistricts", "INSTITUTION":"institution", "GROUPOFINSTITUTIONS":"groupofinstitutions"};
	
    return {
    	getExportLimit : function(){
    		var url= baseUrl + "client/exportConfig";
			return $http.get(url, {cache: true}).then(this.successHandler, this.errorHandler).then(function(loadedData) {
				return loadedData.data;
			});
    	},
    	loadParentEntities : function(entityType) {
    		   	var url = baseUrl + endpoints[entityType] + '/?pageSize=999999&_=' + Math.random();
		    	return $http.get(url, {headers: {'Accept': 'text/html'}}).then(this.successHandler, this.errorHandler).then(function(loadedData) {
						return loadedData.data;
				});
    	},
        loadEntitiesMatchingParent : function(entityType, parentId) {
            var url = baseUrl + endpoints[entityType] + '/?pageSize=999999&parentId=' + parentId + '&_=' + Math.random();
            return $http.get(url, {headers: {'Accept': 'text/html'}}).then(this.successHandler, this.errorHandler).then(function(loadedData) {
                return loadedData.data;
            });
        },
        loadTheRealParentEntities : function(parentType) {
            var url = baseUrl + endpoints[parentType] + '/parents/?pageSize=999999&_=' + Math.random();
            return $http.get(url).then(this.successHandler, this.errorHandler).then(function(loadedData) {
                return loadedData.data;
            });
        },
    	loadClientConfig : function(){
	    		var url =  baseUrl + 'client'+ '/?_=' + Math.random();
	    		return $http.get(url).then(this.successHandler, this.errorHandler);
    
    	},
    	getByName:function(parentType) {  	
		   	return endpoints[parentType];
    	},
    	getById:function(parentType) {  	
		   	return endpointsForQueryById[parentType];
    	},    	
    	getEntity : function(parentType, id) {  	
		    	var url = baseUrl + endpointsForQueryById[parentType] + "/" + id + '/?_=' + Math.random();
		    	return $http.get(url).then(this.successHandler, this.errorHandler);
			
    	},

    	loadAllowedEntitiesByTenant : function() {
	    	var tenantType = CurrentUserService.getTenantType();
	    	allowedEntities = [];
	    	if (tenantType == 'CLIENT') {
	    		allowedEntities.push("CLIENT");
	    		allowedEntities.push("GROUPOFSTATES");
	    		allowedEntities.push("STATE");
	    		allowedEntities.push("GROUPOFDISTRICTS");
	    		allowedEntities.push("DISTRICT");
	    		allowedEntities.push("GROUPOFINSTITUTIONS");
	    		allowedEntities.push("INSTITUTION");
	    	} else if (tenantType == 'GROUPOFSTATES') {
	    		allowedEntities.push("GROUPOFSTATES");
	    		allowedEntities.push("STATE");
	    		allowedEntities.push("GROUPOFDISTRICTS");
	    		allowedEntities.push("DISTRICT");
	    		allowedEntities.push("GROUPOFINSTITUTIONS");
	    		allowedEntities.push("INSTITUTION");
	    	} else if (tenantType == 'STATE') {
	    		allowedEntities.push("STATE");
	    		allowedEntities.push("GROUPOFDISTRICTS");
	    		allowedEntities.push("DISTRICT");
	    		allowedEntities.push("GROUPOFINSTITUTIONS");
	    		allowedEntities.push("INSTITUTION");
	    	} else if (tenantType == 'GROUPOFDISTRICTS') {
	    		allowedEntities.push("GROUPOFDISTRICTS");
	    		allowedEntities.push("DISTRICT");
	    		allowedEntities.push("GROUPOFINSTITUTIONS");
	    		allowedEntities.push("INSTITUTION");
	    	} else if (tenantType == 'DISTRICT') {
	    		allowedEntities.push("DISTRICT");
	    		allowedEntities.push("GROUPOFINSTITUTIONS");
	    		allowedEntities.push("INSTITUTION");
	    	} else if (tenantType == 'GROUPOFINSTITUTIONS') {
	    		allowedEntities.push("GROUPOFINSTITUTIONS");
	    		allowedEntities.push("INSTITUTION");
	    	} else if (tenantType == 'INSTITUTION') {
	    		allowedEntities.push("INSTITUTION");
	    	}
	    	return allowedEntities;	    	
	    },
	    
	    isEntityAllowed : function (entity) {
	    	allowedEntities = this.loadAllowedEntitiesByTenant();
	    	if (allowedEntities.indexOf(entity) != -1 ) {
	    		return true;
	    	} else {
	    		return false;
	    	}
	    },
    	loadStateParentEntities : function(clientData) {
	    	var stateParents = new Array();
	    	if(this.isEntityAllowed('CLIENT')) {
	    		stateParents.push({entityId:"CLIENT",entityName:$rootScope.entityNameLabels['Client']});
	    	}
	    	if(! clientData.groupOfStates){
	    		if(this.isEntityAllowed('GROUPOFSTATES')) {
	    			stateParents.push({entityId:"GROUPOFSTATES",entityName:$rootScope.entityNameLabels['GroupOfStates']});
	    		}
	    	}
	    	return stateParents;
	    }, 
	    
	    loadDistrictParentEntities : function(clientData) {
	    	var districtParents = new Array();
	    		if(this.isEntityAllowed('CLIENT')) {
	    			districtParents.push({entityId:"CLIENT",entityName:$rootScope.entityNameLabels['Client']});
	    		}
	         	if(! clientData.groupOfStates){
	         		if(this.isEntityAllowed('GROUPOFSTATES')) {
	         			districtParents.push({entityId:"GROUPOFSTATES",entityName:$rootScope.entityNameLabels['GroupOfStates']});
	         		}
	         	}
	         	if(this.isEntityAllowed('STATE')) {
	         		districtParents.push({entityId:"STATE",entityName:$rootScope.entityNameLabels['State']});
	         	}
	         	if(! clientData.groupOfDistricts){
	         		if(this.isEntityAllowed('GROUPOFDISTRICTS')) {
	         			districtParents.push({entityId:"GROUPOFDISTRICTS",entityName:$rootScope.entityNameLabels['GroupOfDistricts']});
	         		}
	         	}
	         	return districtParents;

	    }, 
	    
	    loadInstitutionParentEntities : function(clientData) {
	    	var institutionParents = new Array();
	    		if(this.isEntityAllowed('CLIENT')) {
	    			institutionParents.push({entityId:"CLIENT",entityName:$rootScope.entityNameLabels['Client']});
	    		}
		    	if(! clientData.groupOfStates){
		    		if(this.isEntityAllowed('GROUPOFSTATES')) {
		    			institutionParents.push({entityId:"GROUPOFSTATES",entityName:$rootScope.entityNameLabels['GroupOfStates']});
		    		}
		    	}
		    	if(this.isEntityAllowed('STATE')) {
		    		institutionParents.push({entityId:"STATE",entityName:$rootScope.entityNameLabels['State']});
		    	}
		    	if(! clientData.groupOfDistricts){
		    		if(this.isEntityAllowed('GROUPOFDISTRICTS')) {
		    			institutionParents.push({entityId:"GROUPOFDISTRICTS",entityName:$rootScope.entityNameLabels['GroupOfDistricts']});
		    		}
		    	}
		    	if(this.isEntityAllowed('DISTRICT')) {
		    		institutionParents.push({entityId:"DISTRICT",entityName:$rootScope.entityNameLabels['District']});
		    	}
		    	if(! clientData.groupOfInstitutions){
		    		if(this.isEntityAllowed('GROUPOFINSTITUTIONS')) {
		    			institutionParents.push({entityId:"GROUPOFINSTITUTIONS",entityName:$rootScope.entityNameLabels['GroupOfInstitutions']});
		    		}
		    	}
		    	return institutionParents;
		
	    }, 
	    loadReportEntities:function(clientData) {
	    	
	    	var reportEntities = new Array();
	    	if(this.isEntityAllowed('CLIENT')) {
	    		reportEntities.push({entityId:"CLIENT",entityName:"Client"});
	    	}
         	if(! clientData.groupOfStates){
         		if(this.isEntityAllowed('GROUPOFSTATES')) {
         			reportEntities.push({entityId:"GROUPOFSTATES",entityName:"GroupOfStates"});
         		}
         	}
         	if(this.isEntityAllowed('STATE')) {
         		reportEntities.push({entityId:"STATE",entityName:"State"});
         	}
         	if(! clientData.groupOfDistricts){
         		if(this.isEntityAllowed('GROUPOFDISTRICTS')) {
         			reportEntities.push({entityId:"GROUPOFDISTRICTS",entityName:"GroupOfDistricts"});
         		}
         	}
         	if(this.isEntityAllowed('DISTRICT')) {
         		reportEntities.push({entityId:"DISTRICT",entityName:"District"});
         	}
			if(! clientData.groupOfInstitutions){
				if(this.isEntityAllowed('GROUPOFINSTITUTIONS')) {
					reportEntities.push({entityId:"GROUPOFINSTITUTIONS",entityName:"GroupOfInstitutions"});
				}
			}
			if(this.isEntityAllowed('INSTITUTION')) {
				reportEntities.push({entityId:"INSTITUTION",entityName:"Institution"});
			}
         	return reportEntities;

	    }, 	   	
	
	    loadUserAssociateEntities : function(clientData) {
	    	var userAssociateEntities = new Array();

	    	if(this.isEntityAllowed('CLIENT')) {
	    		userAssociateEntities.push({entityId:"CLIENT",entityName:$rootScope.entityNameLabels['Client']});
	    	}
         	if(! clientData.groupOfStates){
         		if(this.isEntityAllowed('GROUPOFSTATES')) {
         			userAssociateEntities.push({entityId:"GROUPOFSTATES",entityName:$rootScope.entityNameLabels['GroupOfStates']});
         		}
         	}
         	if(this.isEntityAllowed('STATE')) {
         		userAssociateEntities.push({entityId:"STATE",entityName:$rootScope.entityNameLabels['State']});
         	}
         	if(! clientData.groupOfDistricts){
         		if(this.isEntityAllowed('GROUPOFDISTRICTS')) {
         			userAssociateEntities.push({entityId:"GROUPOFDISTRICTS",entityName:$rootScope.entityNameLabels['GroupOfDistricts']});
         		}
         	}
         	if(this.isEntityAllowed('DISTRICT')) {
         		userAssociateEntities.push({entityId:"DISTRICT",entityName:$rootScope.entityNameLabels['District']});
         	}
			if(! clientData.groupOfInstitutions){
				if(this.isEntityAllowed('GROUPOFINSTITUTIONS')) {
					userAssociateEntities.push({entityId:"GROUPOFINSTITUTIONS",entityName:$rootScope.entityNameLabels['GroupOfInstitutions']});
				}
			}
			if(this.isEntityAllowed('INSTITUTION')) {
				userAssociateEntities.push({entityId:"INSTITUTION",entityName:$rootScope.entityNameLabels['Institution']});
			}
         	return userAssociateEntities;

	    }, 	    
	    loadGroupOfStatesParentEntities : function() {
	    	if(this.isEntityAllowed('CLIENT')) {
				return  [
				         	{entityId:"CLIENT",entityName:$rootScope.entityNameLabels['Client']},
						];
	    	} else {
	    		 return;
	    	}
	    },
	    
	    loadGroupOfDistrictsParentEntities : function(clientData) {
	    	var groupOfDistrictsParent = new Array();
	    	if(this.isEntityAllowed('CLIENT')) {
	    		groupOfDistrictsParent.push({entityId:"CLIENT",entityName:$rootScope.entityNameLabels['Client']});
	    	}
         	if(! clientData.groupOfStates){
         		if(this.isEntityAllowed('GROUPOFSTATES')) {
         			groupOfDistrictsParent.push({entityId:"GROUPOFSTATES",entityName:$rootScope.entityNameLabels['GroupOfStates']});
         		}
         	}
         	if(this.isEntityAllowed('STATE')) {
         		groupOfDistrictsParent.push({entityId:"STATE",entityName:$rootScope.entityNameLabels['State']});
         	}
         	return groupOfDistrictsParent;

	    },
	    
	    loadGroupOfInstitutionsParentEntities : function(clientData) {
	    	var groupOfInstitutionsParent = new Array();
	    	if(this.isEntityAllowed('CLIENT')) {
	    		groupOfInstitutionsParent.push({entityId:"CLIENT",entityName:$rootScope.entityNameLabels['Client']});
	    	}
         	if(! clientData.groupOfStates){
         		if(this.isEntityAllowed('GROUPOFSTATES')) {
         			groupOfInstitutionsParent.push({entityId:"GROUPOFSTATES",entityName:$rootScope.entityNameLabels['GroupOfStates']});
         		}
         	}
         	if(this.isEntityAllowed('STATE')) {
         		groupOfInstitutionsParent.push({entityId:"STATE",entityName:$rootScope.entityNameLabels['State']});
         	}
         	if(! clientData.groupOfDistricts){
         		if(this.isEntityAllowed('GROUPOFDISTRICTS')) {
         			groupOfInstitutionsParent.push({entityId:"GROUPOFDISTRICTS",entityName:$rootScope.entityNameLabels['GroupOfDistricts']});
         		}
         	}
         	if(this.isEntityAllowed('DISTRICT')) {
         		groupOfInstitutionsParent.push({entityId:"DISTRICT",entityName:$rootScope.entityNameLabels['District']});
         	}
         	return groupOfInstitutionsParent;

	    },
	    
	    loadAllowedUploadableEntities: function(clientData) {
    		var entitiesValues = new Array();
    		tenantType = CurrentUserService.getTenantType();   		
    		if(this.isEntityAllowed('STATE')) {
    				entitiesValues.push({entityName: "State"});
    		}
    		
         	if(! clientData.groupOfStates){
         		if(this.isEntityAllowed('GROUPOFSTATES')) {
         			entitiesValues.push({entityName: "GroupOfStates"});	
         		}
         	}
         	if(this.isEntityAllowed('DISTRICT')) {
	         		entitiesValues.push({entityName: "District"});
	        }
         	if(! clientData.groupOfDistricts){
         		if(this.isEntityAllowed('GROUPOFDISTRICTS')) {
         			entitiesValues.push({entityName: "GroupOfDistricts"});	
         		}
         	}    	         	
         	if(this.isEntityAllowed('INSTITUTION')) {
         		entitiesValues.push({entityName: "Institution"});
         	}
         	if(! clientData.groupOfInstitutions){
         		if(this.isEntityAllowed('GROUPOFINSTITUTIONS')) {
         			entitiesValues.push({entityName: "GroupOfInstitutions"});
         		}
         	}       	         	
         	 //splice the actual tenant type
	   		if(tenantType == 'GROUPOFSTATES') {
	   			entitiesValues.splice(allowedEntities.indexOf("GROUPOFSTATES"), 1);
			}else if(tenantType == 'STATE') {
				 entitiesValues.splice(allowedEntities.indexOf("STATE"), 1);
			}else if(tenantType == 'DISTRICT') {
				 entitiesValues.splice(allowedEntities.indexOf("DISTRICT"), 1);
			}else if(tenantType == 'GROUPOFDISTRICTS') {
				 entitiesValues.splice(allowedEntities.indexOf("GROUPOFDISTRICTS"), 1);
			}else if(tenantType == 'INSTITUTION') {
				 entitiesValues.splice(allowedEntities.indexOf("INSTITUTION"), 1);
			}else if(tenantType == 'GROUPOFINSTITUTIONS') {
				 entitiesValues.splice(allowedEntities.indexOf("GROUPOFINSTITUTIONS"), 1);
			}
         	entitiesValues.push({entityName: "Student"});
         	entitiesValues.push({entityName: "StudentGroup"});
         	entitiesValues.push({entityName: "User"});
         	entitiesValues.push({entityName: "Accommodations"});
         	entitiesValues.push({entityName: "ExplicitEligibility"});
    	    return entitiesValues;
	    },
	    
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

	    loadEntityPage : function(){
	    	var entityType = CurrentUserService.getTenantType();
	    	 var transitionPage=null;
		    	 if(entityType == 'CLIENT') {
		    		 transitionPage = "entities.searchState";
		    	 }else if(entityType == 'GROUPOFSTATES') {
					 transitionPage = "entities.searchState";
				 }else if(entityType == 'STATE') {
					 transitionPage = "entities.searchDistrict";
				 }else if(entityType == 'DISTRICT') {
					 transitionPage = "entities.searchInstitution";
				 }else if(entityType == 'GROUPOFDISTRICTS') {
					 transitionPage = "entities.searchDistrict";
				 }else if(entityType == 'GROUPOFINSTITUTIONS') {
					 transitionPage = "entities.searchInstitution";
				 }
		    	
				 
			 return transitionPage;
	   },    
	    	    
    	successHandler: function(response) {
    		return  {
    				data : response.data,
    				errors : []
    		};
        },
    };
});
