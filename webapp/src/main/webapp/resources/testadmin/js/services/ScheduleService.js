testadmin.factory("ScheduleService", function($http){
	var service = {
		getResource : function() {
			return 'schedule';
		},
		
		getHttp : function() {
			return $http;
		},
		
		getBaseUrl : function() {
			return baseUrl;
		},
	    loadSubjects : function() {
			return  [
			         	{subjectCode:"MATH",subjectName:"MATHEMATICS"},
			         	{subjectCode:"SCI",subjectName:"SCIENCE"},	
			         	{subjectCode:"ENG",subjectName:"ENGLISH"},
					];
	    },   	        
	    getFormattedDate : function (date) {
	    	if (date) {
	    		return date.split("T")[0];
	    	} else {
	    		return date;
	    	}
	    },
	    
	    loadAffinityTypes: function() {
	    	return [{id: 'ASSESSMENT', name: 'Assessment'},
	    	        {id: 'SUBJECT', name: 'Subject'},
	    	        {id: 'GRADE', name: 'Grade'},
	    	        {id: 'STUDENTGROUP', name: 'StudentGroup'}
	    	        ];
	    }
    };
	
	return angular.extend(service, BaseService);
});