testreg.factory("EntityNameService", function($http, $rootScope, CurrentUserService){

	return {
		loadEntityNameLabels: function() {
			$rootScope.entityRefData = {CLIENT:"Client",GROUPOFSTATES:"GroupOfStates",STATE:"State",GROUPOFDISTRICTS:"GroupOfDistricts",DISTRICT:"District",GROUPOFINSTITUTIONS:"GroupOfInstitutions",INSTITUTION:"Institution"};
			var url = baseUrl + "entityNames/tenant/" + CurrentUserService.getTenantId();
			return $http.get(url, {cache: true}).then(this.successHandler, this.errorHandler).then(function(loadedData) {
				if(loadedData.data) {
					$rootScope.entityNameLabels = loadedData.data;
				}
				return;
			});
		} ,
		entityHierarchyData : function(){
			$rootScope.entityHierarchyRef = JSON.parse(JSON.stringify({CLIENT:"Client",GROUPOFSTATES:"GroupOfStates",STATE:"State",GROUPOFDISTRICTS:"GroupOfDistricts",DISTRICT:"District",GROUPOFINSTITUTIONS:"GroupOfInstitutions",INSTITUTION:"Institution"}));
		}
		
	};
});
