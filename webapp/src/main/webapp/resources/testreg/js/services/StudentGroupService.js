testreg.factory("StudentGroupService", function($http){
    return {
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
    	
    	successHandler: function(response) {
    		return  {
    				data : response.data,
    				errors : []
    		};
        },
        saveStudentGroup : function(student){
	    	var method = 'POST';
	    	var url = baseUrl + 'studentGroup';
			if(student.id){
				method = 'PUT';
				url += '/' + student.id;
			}
	    	return $http({
				method: method,
				url: url,
				data: student
			}).then(this.successHandler, this.errorHandler);
	    },
	    
    	
	    deleteStudentGroup : function(studentId){
	    	var method = 'DELETE';
	    	var url = baseUrl + 'studentGroup' + '/' + studentId;
	    	return $http({
				method: method,
				url: url
			}).then(this.successHandler, this.errorHandler);
	    },
	    
	    loadStudentGroup : function(id) {
	    		var url = baseUrl + 'studentGroup/'+ id + '/?_=' + Math.random();
   				return $http.get(url).then(this.successHandler, this.errorHandler);
	    },	    
        
    	searchStudentGroups : function(params){
    		var url = baseUrl + 'studentGroups' + '/?_=' + Math.random();
    	    return  $http({
                method: 'GET',
                url: url,
                params: params
    	    }).then(this.successHandler, this.errorHandler);
    	},	    
    };
});