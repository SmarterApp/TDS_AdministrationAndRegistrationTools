testreg.factory("ProctorService", function($http, $filter, AssessmentService){
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
		getApprovedSubectsList: function() {
			return [
			        	{text: 'ELA', id: 'ela'},
			        	{text: 'MATH', id: 'math'}
			        ];
		},
		
		getAssessments: function() {
			
			return AssessmentService.findAssessmentBySearchVal('', 20,'subjectCode').then(
                    function(loadedData) {
                    	if(loadedData.data.searchResults)
                    	var map = $.map( loadedData.data.searchResults, function(assessment) { 
                    		return { "id":assessment.id, "text":assessment.testName }; 
                    	});
                    	
                    	return map;
                        //return loadedData.data.searchResults;
                    }
                );
			return [];
		},
		
		getAssessmentTypes: function() {
			var url = baseUrl + 'assessment/types';
    	    return  $http.get(url).then(this.successHandler, this.errorHandler);
		},
		
		getGrades : function() {
			return  [
			         	{text:"Infant/Toddler",id:"IT"},
			         	{text:"Preschool",id:"PR"},
			         	{text:"Prekindergarten",id:"PK"},
			         	{text:"Transitional Kindergarten",id:"TK"},
			         	{text:"Kindergarten",id:"KG"},
			         	{text:"First Grade",id:"01"},
			         	{text:"Second Grade",id:"02"},
			         	{text:"Third Grade",id:"03"},
			         	{text:"Fourth Grade",id:"04"},
			         	{text:"Fifth Grade",id:"05"},
			         	{text:"Sixth Grade",id:"06"},
			         	{text:"Seventh Grade",id:"07"},
			         	{text:"Eighth Grade",id:"08"},
			         	{text:"Ninth Grade",id:"09"},
			         	{text:"Tenth Grade",id:"10"},
			         	{text:"Eleventh Grade",id:"11"},
			         	{text:"Twelfth Grade",id:"12"},
			         	{text:"Grade 13",id:"13"},
			         	{text:"Postsecondary",id:"PS"},
			         	{text:"Ungraded",id:"UG"}		         	
					];
	    },
	    
	    save : function(proctor){
	    	var method = 'POST';
	    	var url = baseUrl + 'proctor';
			if(proctor.id){
				method = 'PUT';
				url += '/' + proctor.id;
			}
	    	return $http({
				method: method,
				url: url,
				data: proctor
			}).then(this.successHandler, this.errorHandler);
	    },
	    
	    getRoleNames: function(user) {
	    	var roleNames = [];
	    	angular.forEach(user.roleAssociations, function(roleAssociation){
	    		roleNames.push(roleAssociation.role);
	    	});
	    	return roleNames;
	    },
	    
	    loadProctor: function(userId) {
	    	var url = baseUrl + 'proctor/'+ userId + '/?_=' + Math.random();
			return $http.get(url).then(this.successHandler, this.errorHandler);
	    },
	    
	    getProctorsForInstitution: function(institutionMongoId) {
	    	var url = baseUrl + 'proctor/institution/' + institutionMongoId;
	    	return $http.get(url).then(this.successHandler, this.errorHandler);
	    },
	    
	    getSeperatedValues: function(values, delimiter) {
	    	
	    	var separatedValues = "";
	    	angular.forEach(values, function(value, index){
	    		separatedValues = separatedValues + delimiter + value;
	    	});
	    	return separatedValues.substring(1); //strip leading delimiter
	    },
	    
	    getProctorRoles: function(roleNames) {
	    	var url = baseUrl + 'proctorRole';
	    	var predefinedSeparator = "$"; //Separator defined in sync with backend
	    	var params = {name: this.getSeperatedValues(roleNames, predefinedSeparator)};
	    	return $http.get(url, {params: params}).then(this.successHandler, this.errorHandler);
	    },
	    
	    loadAvailabilityChoices: function() {
	    	return [{id: 'AVAILABLE', name: 'Available'},
	    	        {id: 'NOTAVAILABLE', name: 'Not Available'}
	    	        ];
	    },
	    loadAffinityTypes: function() {
	    	return [{id: 'ASSESSMENT', name: 'Assessment'},
	    	        {id: 'SUBJECT', name: 'Subject'},
	    	        {id: 'GRADE', name: 'Grade'}
	    	        ];
	    },
	    getFormattedDate: function(date, format){
	    	return $filter('date')(date, format);
	    },
	    
	    getMergedDate: function(dateComponent, timeComponent) {
	    	if(dateComponent == null || timeComponent == null) {
	    		return "";
	    	}
	    	
	    	var dateTime = new Date();
	    	var monthOffset = 1; //JS months are 0 based
	    	dateTime.setFullYear(this.getFormattedDate(dateComponent, "yyyy"));
	    	dateTime.setMonth(parseInt(this.getFormattedDate(dateComponent, "MM"))-monthOffset);
	    	dateTime.setDate(this.getFormattedDate(dateComponent, "dd"));
	    	dateTime.setHours(this.getFormattedDate(timeComponent, "H"));
	    	dateTime.setMinutes(this.getFormattedDate(timeComponent, "mm"));
	    	dateTime.setSeconds(0);
	    	if(Date.parse(dateTime))
	    		return this.getFormattedDate(dateTime, "yyyy-MM-ddTHH:mm:ss.000Z");
	    	else
	    		return "";
	    }
    };
});