testreg.factory("SubjectService", function($http) {
	
	
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

	    findAll : function() {
    		var url = baseUrl + 'subjects'+ '/?_=' + Math.random();
				return $http.get(url).then(this.successHandler, this.errorHandler);
	    },

	    
	    loadSubject : function(id) {
    		var url = baseUrl + 'subject/'+ id + '/?_=' + Math.random();
				return $http.get(url).then(this.successHandler, this.errorHandler);
	    },

	    deleteSubject : function(subjectId){
	    	var method = 'DELETE';
	    	var url = baseUrl + 'subject' + '/' + subjectId;
	    	return $http({
				method: method,
				url: url
			}).then(this.successHandler, this.errorHandler);
	    },
	    
	    mergeSubject : function(subject){
	    	var method = 'PUT';
	    	var url = baseUrl + 'subject' + '/' + subject.id + "/merge";
	    	return $http({
				method: method,
				url: url,
				data:subject
			}).then(this.successHandler, this.errorHandler);
	    },

	    saveSubject : function(subject){
	    	var method = 'POST';
	    	var url = baseUrl + 'subject';
			if(subject.id){
				method = 'PUT';
				url += '/' + subject.id;
			}
	    	return $http({
				method: method,
				url: url,
				data: subject
			}).then(this.successHandler, this.errorHandler);
	    },
    	searchSubjects : function(params){
    		var url = baseUrl + 'subject' + '/?_=' + Math.random();
    	    return  $http({
                method: 'GET',
                url: url,
                params: params
    	    }).then(this.successHandler, this.errorHandler);
    	},	    
	};
});