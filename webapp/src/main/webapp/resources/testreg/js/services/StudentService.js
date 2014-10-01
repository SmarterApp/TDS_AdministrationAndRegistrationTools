testreg.factory("StudentService", function($http, $filter){
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
        
    	searchStudents : function(params){
    		var url = baseUrl + 'student' + '/?_=' + Math.random();
    	    return  $http({
                method: 'GET',
                url: url,
                params: params
    	    }).then(this.successHandler, this.errorHandler);
    	},
    	
    	searchStudentsWithMultiGrades : function(params, grades){
    		var url = baseUrl + 'student' + '/?_=' + Math.random();
    		var gradesParam = '';   		
			angular.forEach(grades, function(grade, index){
				gradesParam += "gradeLevelWhenAssessed=" + grade;
				  if (index != grades.length -1){
					  gradesParam += "&";
				  }
			});
			if (gradesParam.length > 0) {
				url = baseUrl + 'student' + '/?_=' + Math.random() + "&" + gradesParam;
			}    		
    	    return  $http({
                method: 'GET',
                url: url,
                params: params
    	    }).then(this.successHandler, this.errorHandler);
    	},

        saveStudent : function(student){
	    	var method = 'POST';
	    	var url = baseUrl + 'student';
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
	    
    	
	    deleteStudent : function(studentId){
	    	var method = 'DELETE';
	    	var url = baseUrl + 'student' + '/' + studentId;
	    	return $http({
				method: method,
				url: url
			}).then(this.successHandler, this.errorHandler);
	    },
	    
	    loadStudent : function(id) {
	    		var url = baseUrl + 'student/'+ id + '/?_=' + Math.random();
   				return $http.get(url).then(this.successHandler, this.errorHandler);
	    },
	    
	    loadStudentEligibleAssessments : function(id) {
    		var url = baseUrl + 'student/'+ id + '/eligibleAssessments/?_=' + Math.random();
				return $http.get(url).then(this.successHandler, this.errorHandler);
	    },
	    
	    loadGrades : function() {
			var url = baseUrl + 'student/gradeLevel/?_=' + Math.random();
			return $http.get(url).then(this.successHandler, this.errorHandler).then(function (response){
				var grades= new Array();
				var gradeLevelMap= response.data;
		        for (gradeKey in gradeLevelMap) {
		        	if (gradeLevelMap.hasOwnProperty(gradeKey)) {
		        		grades.push({id : gradeLevelMap[gradeKey], text : gradeLevelMap[gradeKey]+" - "+gradeKey });
					}
				}
		        return grades;
			});
	    	
	    }, 
	    
	    section504Status : function() {
			return  [
			         	{name:"YES",description:"YES"},
			         	{name:"NO",description:"NO"},
			         	{name:"UNKNOWN/CANNOT PROVIDE",description:"UNKNOWN/CANNOT PROVIDE"}
					];
	    },
	        
	    yesOrNo : function() {
			return  [
			         	{name:"YES",description:"YES"},
			         	{name:"NO",description:"NO"},
					];
	    },

	    title3ProgramType : function() {
			return  [
			         	{name:"DUALLANGUAGE",description:"Dual Language"},
			         	{name:"TWOWAYIMMERSION",description:"Two-Way Immersion"},
			         	{name:"TRANSITIONALBILINGUAL",description:"Transitional Bilingual"},
			         	{name:"DEVELOPMENTALBILINGUAL",description:"Developmental Bilingual"},
			         	{name:"HERITAGELANGUAGE",description:"Heritage Language"},
			         	{name:"SHELTEREDENGLISHINSTRUCTION",description:"Sheltered English Instruction"},
			         	{name:"STRUCTUREDENGLISHIMMERSION",description:"Structured English Immersion"},
			         	{name:"SDAIE",description:"SDAIE"},
			         	{name:"CONTENTBASEDESL",description:"Content Based ESL"},	
			         	{name:"PULLOUTESL",description:"Pull Out ESL"},
			         	{name:"OTHER",description:"Other"},				         	
					];
	    },
	    
	    getLanguageCodes: function(){
    		var url = baseUrl + 'student/languages/?_=' + Math.random();
				return $http.get(url).then(this.successHandler, this.errorHandler);
	    },

	    primaryDisabilityType : function() {
			return  [
			         	{name:"AUT",description:"AUT"},
			         	{name:"DB",description:"DB"},
			         	{name:"DD",description:"DD"},
			         	{name:"EMN",description:"EMN"},
			         	{name:"HI",description:"HI"},
			         	{name:"ID",description:"ID"},
			         	{name:"MD",description:"MD"},
			         	{name:"OI",description:"OI"},
			         	{name:"OHI",description:"OHI"},
			         	{name:"SLD",description:"SLD"},
			         	{name:"SLI",description:"SLI"},
			         	{name:"TBI",description:"TBI"},
			         	{name:"VI",description:"VI"},
					];
	    },
	    
	    getFormattedDate : function (date) {
	    	if (date) {
	    		return date.split("T")[0];
	    	} else {
	    		return date;
	    	}
	    }
    };
});