testadmin.factory("TestPlatFormService", function($http){
	var service = {
		getResource : function() {
			return 'testplatform';
		},
		getSearchResource : function() {
			return 'testplatforms';
		},		
		getHttp : function() {
			return $http;
		},
		
		getBaseUrl : function() {
			return baseUrl;
		},
		getAll : function() {
			return this.getHttp().get(this.getBaseUrl()+ '/testplatforms?_=' + Math.random()).then(this.successHandler, this.errorHandler);
		}
    };
	return angular.extend(service, BaseService);
});