testreg.factory("DownloadTemplateService", function($window, $timeout, EntityService, CurrentUserService){
    return {
    
    	loadEntities: function(clientData) {
    		var entitiesValues = new Array();
    		angular.forEach(EntityService.loadAllowedUploadableEntities(clientData), function(entity){
    			entitiesValues.push({entityName: entity.entityName, code: false});
    		});
    	    return entitiesValues;   
    	},
    	loadFileTypes: function() {
    		return [
    		        {name: "CSV", code: false, extn: 'csv'},
    		        {name: "XLSX", code: false, extn: 'xlsx'},
    		        {name: "TAB", code: false, extn: 'txt'},
    		        {name: "XLS", code: false, extn: 'xls'}
    		];
    	},
    	
        fileUrl: function(entityName, extn) {
        	return baseUrl+'template/'+ entityName + '.' +extn;
        }
    	
    };
});