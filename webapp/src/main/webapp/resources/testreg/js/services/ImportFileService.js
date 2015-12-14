testreg.factory("ImportFileService", function($http){
	
	var lookup = {"StudentGroups": "STUDENTGROUP", "ExplicitEligibility": "EXPLICITELIGIBILITY"};

 //Placeholder for import file service
	return {
		isAnUpload: function(uploadName) {			
			return (uploadName.indexOf('upload') == 0);
		},
		
		getEntity: function(uploadName) {
			return lookup[uploadName.split('upload')[1]];
		},
		
		isAllEntityUpload: function(uploadName) {
			if(uploadName == 'uploadFile') {
				return true;
			}
			return false;
		},
	};
	
});