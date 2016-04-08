testadmin.factory("FacilityService", function($http){
	var service = {
		getResource : function() {
			return 'facility';
		},
		
		getHttp : function() {
			return $http;
		},
		
		getBaseUrl : function() {
			return baseUrl;
		},
    };
	return angular.extend(service, BaseService);
});