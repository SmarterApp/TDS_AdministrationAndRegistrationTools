testadmin.factory("ProctorRoleService", function($http, AssessmentService, EntityService, UserService){
	var service = {
		getResource : function() {
			return 'proctorRole';
		},
		getSearchResource: function() {
			return 'proctorRoles';
		},	
		getHttp : function() {
			return $http;
		},
		
		getBaseUrl : function() {
			return baseUrl;
		},
		getAll : function(pageSize) {
			if(pageSize) {
				return this.getHttp().get(this.getBaseUrl()+ '/proctorRole?_=' + Math.random() + '&pageSize='+pageSize).then(this.successHandler, this.errorHandler);
			} else {
				return this.getHttp().get(this.getBaseUrl()+ '/proctorRole?_=' + Math.random()).then(this.successHandler, this.errorHandler);
			}
		},
		getAssessmentTypes: function() {
    	    return  AssessmentService.getAssessmentTypes();
		},
		getAssessments: function(type) {
			return  AssessmentService.findAssessmentBySearchVal(type, '10', 'type');
		},
		loadEntityHierarchy: function() {
			var entities = [];
			angular.forEach(EntityService.loadAllowedEntitiesByTenant(), function(level){
				entities.push({id: level, text: level});
			});
			return entities;
		},
		loadUserRoles: function() {
			return UserService.loadRoles();
		},
		getEntities: function(roles, roleName, callBack) {
			var entitiesTemp = [];
			for (var i=0; i < roles.length; i++) {
				if (roles[i].role == roleName) {
					entitiesTemp.push(roles[i].allowableEntities);
					break;
				}
			}
			
			var entities = [];
			angular.forEach(entitiesTemp[0], function(entityVal){
				entities.push(entityVal.entity);
			});
			callBack(entities);
		},
    	searchProctorRoles : function(params){
    		var url = baseUrl + 'proctorRole' + '/?_=' + Math.random();
    	    return  $http({
                method: 'GET',
                url: url,
                params: params
    	    }).then(this.successHandler, this.errorHandler);
    	},
		
    };
	return angular.extend(service, BaseService);
});