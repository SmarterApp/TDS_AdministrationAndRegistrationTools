testreg.factory("AssessmentService", function($http, CurrentUserService){
	
	return {
    	assessmentData : [],
    	
    	clearAssessmentData : function(){
    		this.assessmentData.splice(0, this.assessmentData.length);
    	},
    	
    	pushAssessmentData : function(response) {
    		this.assessmentData.push({"data":response.data.searchResults[0]});
    	},
    	
    	addAssessmentData : function(assessmentInfo){
    		this.clearAssessmentData();
    		// get assessment package by id, but for now just use standard search
    		// purpose=REGISTRATION&tenantId=524af61ae4b0b02763aa0fe0&name=SBAC-arc-3-TESTADMIN-S-1&version=2.1&includeXml=true
    		
    		return this.assessmentSearch(assessmentInfo);

    	},
    	
    	assessmentSearch : function(assessmentInfo) {
    		return $http.get(baseUrl + 'tsbassessments/tenant/' + assessmentInfo.tenantId,
    				{params: 
					{"purpose":"REGISTRATION",
					"name":assessmentInfo.testName,
					"version":assessmentInfo.version,
					"includeXml":"true"}
				}).then(this.successHandler, this.errorHandler);
    	},
	    
		getAssessmentData : function(){
			return	this.assessmentData[0];
    	},
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
        
		loadEligibilityTypes: function() {
			//Just return Hard coded values
			return [
			        {entityId: "EXPLICIT", entityName: "EXPLICIT"},
			        {entityId: "IMPLICIT", entityname:"IMPLICIT"}
			];
		},
		
		loadYesOrNoTypes: function() {
			//Just return Hard coded values
			return [
			        {entityId: "YES", entityName: "YES"},
			        {entityId: "NO", entityname:"NO"}
			];
		},
	
		loadRuleFields: function() {
			return[
			       {fieldId: "State Abbreviation", fieldValue: "stateAbbreviation", segment: "Student"},
			       {fieldId: "Student Identifier", fieldValue: "entityId", segment: "Student"},
			       {fieldId: "Responsible Institution Identifier", fieldValue: "institutionIdentifier", segment: "Student"},
			       {fieldId: "Responsible District Identifier", fieldValue: "districtIdentifier", segment: "Student"},
			       {fieldId: "External SSID", fieldValue: "externalSsid", segment: "Student"},
			       {fieldId: "Grade Level When Assessed", fieldValue: "gradeLevelWhenAssessed", segment: "Student"},
			       {fieldId: "Gender", fieldValue: "gender", segment: "Student"},
			       {fieldId: "Hispanic Or Latino Ethnicity", fieldValue: "hispanicOrLatino", segment: "Student"},
			       {fieldId: "American Indian Or Alaska Native", fieldValue: "americanIndianOrAlaskaNative", segment: "Student"},
			       {fieldId: "Asian", fieldValue: "asian", segment: "Student"},
			       {fieldId: "Black Or African American", fieldValue: "blackOrAfricanAmerican", segment: "Student"},
			       {fieldId: "Two Or More Races", fieldValue: "twoOrMoreRaces", segment: "Student"},
			       {fieldId: "White", fieldValue: "white", segment: "Student"},
			       {fieldId: "Native Hawaiian Or Other PacificIslander", fieldValue: "nativeHawaiianOrPacificIsland", segment: "Student"},
			       {fieldId: "IDEA Indicator", fieldValue: "iDEAIndicator", segment: "Student"},
			       {fieldId: "LEP Status", fieldValue: "lepStatus", segment: "Student"},
			       {fieldId: "Section 504 Status", fieldValue: "section504Status", segment: "Student"},
			       {fieldId: "Economic Disadvantage Status", fieldValue: "disadvantageStatus", segment: "Student"},
			       {fieldId: "Language Code", fieldValue: "languageCode", segment: "Student"},
			       {fieldId: "English Language Proficiency Level", fieldValue: "title3ProgressStatus", segment: "Student"},
			       {fieldId: "Migrant Status", fieldValue: "migrantStatus", segment: "Student"},
			       {fieldId: "First EntryDate Into US School", fieldValue: "firstEntryDateIntoUsSchool", segment: "Student"},
			       {fieldId: "Limited English Proficiency EntryDate", fieldValue: "lepEntryDate", segment: "Student"},
			       {fieldId: "LEP ExitDate", fieldValue: "lepExitDate", segment: "Student"},
			       {fieldId: "TitleIII Language Instruction Program Type", fieldValue: "title3ProgramType", segment: "Student"},
			       {fieldId: "Primary Disability Type", fieldValue: "primaryDisabilityType", segment: "Student"}
			];
		},
		
		loadYesOrNoFields: function() {
			return ["hispanicOrLatino", "migrantStatus", "americanIndianOrAlaskaNative", "asian", "blackOrAfricanAmerican", "nativeHawaiianOrPacificIsland",
			        "white", "twoOrMoreRaces", "iDEAIndicator", "lepStatus", "disadvantageStatus", "migrantStatus"];
		},
		
		loadDateTimeFields: function() {
			return ["lepEntryDate", "lepExitDate", "firstEntryDateIntoUsSchool"];
		},
		
		loadTextFields: function() {
			return [ "entityId", "institutionIdentifier", "districtIdentifier", "confirmationCode", 
			        "externalSsid","title3ProgressStatus"];
		},
		
		loadRuleTypes: function() {
			//return these values until we take a decision how to get them
			return [
			        {ruleId: "ENABLER",  ruleName: "ENABLER"},
			        {ruleId: "DISABLER", ruleName: "DISABLER"}
			];
		},
		
		loadGenders: function() {
			return [
			        {genderId:"Male", genderName:"Male"},
			        {genderId:"Female", genderName:"Female"}
			];
		},
		
		loadDateOperatorTypes: function() {
			return [
			        {operatorId: "=", operatorName: "EQUALS", order: "3"},
			        {operatorId: ">", operatorName: "GREATER_THAN", order: "5"},
			        {operatorId: "<", operatorName: "LESS_THAN", order: "1"},
			        {operatorId: ">=", operatorName: "GREATER_THAN_EQUALS", order: "4"},
			        {operatorId: "<=", operatorName: "LESS_THAN_EQUALS", order: "2"}
			];
		},
		
		loadAssessment: function(id) {
			var url = baseUrl + 'assessment/'+ id + '/?_=' + Math.random();
			return $http.get(url).then(this.successHandler, this.errorHandler);
		},
		
		deleteAssessment : function(assessmentId){
	    	var method = 'DELETE';
	    	var url = baseUrl + 'assessment' + '/' + assessmentId;
	    	return $http({
				method: method,
				url: url
			}).then(this.successHandler, this.errorHandler);
	    },
		
		saveAssessment: function(assessment){
			var method = 'POST';
	    	var url = baseUrl + 'assessment';
			if(assessment.id){
				method = 'PUT';
				url += '/' + assessment.id;
			}
	    	return $http({
				method: method,
				url: url,
				data: assessment
			}).then(this.successHandler, this.errorHandler);
		},
		updateAssessment: function(assessment){
				var url = baseUrl + 'tsbassessment';
				method = 'PUT';
		    	return $http({
					method: method,
					url: url,
					data: assessment
				}).then(this.successHandler, this.errorHandler);
		},   
	    findAssessmentBySearchVal : function(searchVal,pageSize,searchBy) {

	    	var params = JSON.parse( '{ "'+searchBy+'": "'+searchVal+'", "pageSize":"'+pageSize+'", "sortKey": "'+ searchBy +'","sortDir":"asc","currentPage":"0" }' );
	    
	    	return $http({
	            method: 'GET',
	            url: baseUrl + 'assessment',
	            params:params,
	   	    }).then(this.successHandler, this.errorHandler);
	    },	 
	    findAssessmentBySearchValAndTenantId : function(searchVal,pageSize,searchBy) {
	    	var tenantId = CurrentUserService.getTenantId();
	    	var params = JSON.parse( '{ "'+searchBy+'": "'+searchVal+'","tenantId": "'+tenantId+'", "pageSize":"'+pageSize+'", "sortKey": "'+ searchBy +'","sortDir":"asc","currentPage":"0" }' );
	    
	    	return $http({
	            method: 'GET',
	            url: baseUrl + 'assessment',
	            params:params,
	   	    }).then(this.successHandler, this.errorHandler);
	    },
	    findAssessmentByTenantId : function(searchVal,pageSize,searchBy) {
	    	var params = JSON.parse( '{ "'+searchBy+'": "'+searchVal+'", "pageSize":"'+pageSize+'", "sortKey": "'+ searchBy +'","sortDir":"asc","currentPage":"0" }' );
	    	return $http({
	            method: 'GET',
	            url: baseUrl + 'assessments',
	            params:params,
	   	    }).then(this.successHandler, this.errorHandler);
	    },	 
	    loadAssessmentsByTenantId: function(tenantId) {
	    	var url = baseUrl + 'assessmentsByTenantId/'+ tenantId + '/?_=' + Math.random();
			return $http.get(url).then(this.successHandler, this.errorHandler);
	    },
	    findAllImportedAssessments : function() { 	
		   	var url = baseUrl + "assessments" + '/?pageSize=9999&_=' + Math.random();
	    	return $http.get(url, {headers: {'Accept': 'text/html'}}).then(this.successHandler, this.errorHandler);
	    },
	    
	    getAssessmentTypes: function() {
	    	var url = baseUrl + 'assessment/types';
	    	return $http({
	    		url: url,
	    		method: 'GET'
	    	}).then(this.successHandler, this.errorHandler);
 	    }
	};
});