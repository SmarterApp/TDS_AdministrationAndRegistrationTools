testadmin.factory("AccessibilityService", function($http){
	var service = {
		getResource : function() {
			return 'accessibilityEquipment';
		},
		getSearchResource: function() {
			return 'accessibilityEquipments';
		},	
		getHttp : function() {
			return $http;
		},
		
		getBaseUrl : function() {
			return baseUrl;
		},
	    loadEquipmentTypes: function() {
	    	return [{id: 'SOFTWARE', name: 'Software'},
	    	        {id: 'HARDWARE', name: 'Hardware'}
	    	        ];
	    },		
		getAll : function() {
			return this.getHttp().get(this.getBaseUrl()+ '/accessibilityEquipments?_=' + Math.random()).then(this.successHandler, this.errorHandler);
		}
    };
	return angular.extend(service, BaseService);
});