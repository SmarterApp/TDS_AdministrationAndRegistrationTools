testreg.factory("UserService", function($http) {
	
	
	return {
		errorHandler : function(response) {
			var returnVal = {
				data : {},
				errors : []
			};
			for ( var field in response.data.messages) {
				for ( var messages in response.data.messages[field]) {
					returnVal.errors
							.push(response.data.messages[field][messages]);
				}
			}
			return returnVal;
		},

		successHandler : function(response) {
			return {
				data : response.data,
				errors : []
			};
		},

	    loadUser : function(id) {
    		var url = baseUrl + 'user/'+ id + '/?_=' + Math.random();
			return $http.get(url).then(this.successHandler, this.errorHandler);
	    },
	    loadProctorRoles: function() {
			var params = {"currentPage": '0', "pageSize":"10000"};
	    	var url = baseUrl + 'proctorRole?_='+'/?_=' + Math.random();
    	    return  $http({
                method: 'GET',
                url: url,
                params: params
    	    }).then(this.successHandler, this.errorHandler);
	    },
	    loadRoles : function() {
    		var url = baseUrl + 'user/role'+ '/?_=' + Math.random();
			return $http.get(url).then(this.successHandler, this.errorHandler);
	    },
	    
	    deleteUser : function(userId){
	    	var method = 'DELETE';
	    	var url = baseUrl + 'user' + '/' + userId;
	    	return $http({
				method: method,
				url: url
			}).then(this.successHandler, this.errorHandler);
	    },

	    saveUser : function(userData){
	    	var method = 'POST';
	    	var url = baseUrl + 'user';
			if(userData.id){
				method = 'PUT';
				url += '/' + userData.id;
			}
	    	return $http({
				method: method,
				url: url,
				data: userData
			}).then(this.successHandler, this.errorHandler);
	    },

        syncUser : function(userId){
            var method = 'POST';
            var url = baseUrl + 'user' + '/' + userId + '/sync';
            return $http({
                method: method,
                url: url
            }).then(this.successHandler, this.errorHandler);
        },

        resetPasswordUser : function(userId){
            var method = 'POST';
            var url = baseUrl + 'user' + '/' + userId + '/reset';
            return $http({
                method: method,
                url: url
            }).then(this.successHandler, this.errorHandler);
        },

        lockUser : function(userId){
            var method = 'POST';
            var url = baseUrl + 'user' + '/' + userId + '/lock';
            return $http({
                method: method,
                url: url
            }).then(this.successHandler, this.errorHandler);
        },

        unlockUser : function(userId){
            var method = 'POST';
            var url = baseUrl + 'user' + '/' + userId + '/unlock';
            return $http({
                method: method,
                url: url
            }).then(this.successHandler, this.errorHandler);
        },
	    
	    findUserBySearchVal : function(searchVal,stateId,pageSize,searchBy) {

	    	var params = JSON.parse( '{ "'+searchBy+'": "'+searchVal+'", "roleAssociations.stateAbbreviation":"'+stateId+'", "pageSize":"'+pageSize+'", "sortKey": "'+ searchBy +'","sortDir":"asc" }' );
	    	return $http({
	            method: 'GET',
	            url: baseUrl + 'user',
	            params:params,
	   	    }).then(this.successHandler, this.errorHandler);
	    },	 		    
    	searchUsers : function(params){
    		var url = baseUrl + 'user' + '/?_=' + Math.random();
    	    return  $http({
                method: 'GET',
                url: url,
                params: params
    	    }).then(this.successHandler, this.errorHandler);
    	},
	};
});
