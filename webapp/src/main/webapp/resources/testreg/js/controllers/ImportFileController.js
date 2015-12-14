testreg.controller('ImportFileController',['$scope','$state', 'ImportFileService','fileUpload', 'EntityService',
    function($scope, $state, ImportFileService, fileUpload, EntityService) {
	 var S = $scope;
	 var _ = ImportFileService;
	 S.activeLink = $state.$current.self.name;

	 S.formatTypeDisabled = false;
	 
	 if(_.isAllEntityUpload(S.activeLink)) {
		 EntityService.loadClientConfig().then(function(response){
				var entities = EntityService.loadAllowedUploadableEntities(response.data);
				if(entities) {
					S.entities = entities;
				}
		 });		 
	 } else if(_.isAnUpload(S.activeLink)) {
		S.formatType = _.getEntity(S.activeLink);
		S.formatTypeDisabled  = true;
		
	 }

     S.savingIndicator = false;

	 S.isActiveLink = function(link){
		return  S.activeLink.indexOf(link) == 0; 
	 };
	 	
		S.errors = {};
		S.options = {
	                url: baseUrl + 'uploadFile',
	                add: function (e, data) {
	                	//reset queue since this is a single file upload
	                    data.scope().queue =[];
	                    fileUpload.defaults.add(e, data);
	                },
	                submit: function(e, data) {
	                	var formatType = data.scope().formatType;
	                	if(!formatType) {
                            S.savingIndicator = false;
	                		return false;
	                	} else {
                            S.savingIndicator = true;
	                		data.formData = {formatType: data.scope().formatType};
	                		return true;
	                	}
	                },
	                handleResponse: function (e, data) {
	                	if (data.errorThrown || data.textStatus === 'error') {
                            S.savingIndicator = false;
		            	   var message = data.result ? " - " + data.result.messages['applicationErrors'] : " upload error";  
		            	   S.errors[0] = (data.errorThrown || data.textStatus) + message;
	                	} else {
                            S.savingIndicator = true;
	                		S.fileUploadResponse = data.result;
	                		$state.transitionTo("previewFile", {fileId:S.fileUploadResponse.fileGridFsId});
                    	}
	                }
		};
		
		S.resetErrors = function() {
			S.errors = {};
		};
	}
]);

	