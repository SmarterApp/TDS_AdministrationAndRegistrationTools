
testreg.controller('ScheduleController',['$scope','$state', '$window','$timeout','loadedData', 'ScheduleService', 'AssessmentService', 
                                         'SubjectService', 'StudentGroupService','StudentService', 'StateService', 'CurrentUserService',
    function($scope, $state, $window, $timeout, loadedData, ScheduleService, AssessmentService, SubjectService, StudentGroupService,StudentService, StateService, CurrentUserService) {
		$scope.domain = "schedule";
		$scope.savingIndicator = false;
		$scope.errors = [];
		$scope.actionButton = '';
		$scope.formAction = 'Add';
		$scope.subjects = [];
		$scope.affinities=[];
		$scope.grades=[];
		$scope.schedule = {"affinities" : $scope.affinities};
		$scope.affinityValues =[];
		$scope.schedule = loadedData.data;
		$scope.studentGroups = [];
		$scope.states=[];

		$scope.weekends = [
			         	{name:"NO",description:"NO"},
			         	{name:"YES",description:"YES"},
			         	];
		
    	StateService.loadStates().then(function(loadedData) {
    		$scope.states = loadedData.data;
    	});
    	
  		$scope.formatDate = function(date) {
  			return ScheduleService.getFormattedDate(date);
  		};
		StudentService.loadGrades().then(function(response){
			$scope.grades = response;
		});	
		$scope.affinityTypes = ScheduleService.loadAffinityTypes();
		
		$scope.searchStudentGroupParams = function(institutionId) {
			params =  {"institutionEntityMongoId":institutionId,"currentPage": '0', "pageSize":"10000"};
		    StudentGroupService.searchStudentGroups(params).then(function(response){
	    		if(response.data){
	    			$scope.studentGroups = response.data.searchResults;
	    		}
		    });
        };
		
		var assessmentSearchValue = "";
	   	 if(CurrentUserService.getTenantType() == "STATE"){
	   		 assessmentSearchValue = CurrentUserService.getTenantId();
	   	 }
	   		
	   	 if(CurrentUserService.getTenantType() == "STATE" || CurrentUserService.getTenantType() == "CLIENT"){
	   		 AssessmentService.findAssessmentByTenantId(assessmentSearchValue,'9999','tenantId').then(function(response){
	   			 $scope.assessments=response.data;
	   		 });
	   	 }else {
    		 AssessmentService.loadAssessmentsByTenantId(CurrentUserService.getTenantId()).then(function(response){
    			 $scope.assessments=response.data; 
    		 });
    	 }
		
		SubjectService.findAll().then(function(loadedData) {
			$scope.subjects = loadedData.data;
		});
        $scope.convertAssessmentsToAffinityValue = function(assessments) {
            return $.map( assessments, function(assessment) { return { "id":assessment.id, "name":assessment.testName }; });
        };
		
        $scope.convertSubjectsToAffinityValue = function(subjects) {
            return $.map( subjects, function(subject) { return { "id":subject, "name":subject }; });
        };	
        
        $scope.convertGradesToAffinityValue = function(grades) {
            return $.map( grades, function(grade) { return { "id":grade.id, "name":grade.text }; });
        };
        
        $scope.convertStudentGroupToAffinityValue = function(studentGroups) {
            return $.map(studentGroups, function(studentGroup) { return { "id":studentGroup.id, "name":studentGroup.studentGroupName }; });
        };
        
		if($scope.schedule && $scope.schedule.id){
			$scope.formAction = 'Edit';					
			if($scope.schedule.doNotScheduleWeekends === true) {
				$scope.schedule.doNotScheduleWeekends = "NO";
			}else{
				$scope.schedule.doNotScheduleWeekends = "YES";
			}
		}  else {
			$scope.schedule.doNotScheduleWeekends = "NO";
		}
		
		
		$scope.xwalk   = function(label) {
			return $scope.safewalk('Institution', label);
		};
        
		$scope.setAffinities = function (index, type) {
			if (type === "ASSESSMENT") {
				$scope.affinityValues[index] = $scope.convertAssessmentsToAffinityValue($scope.assessments);
			} else if (type === "SUBJECT") {
				$scope.affinityValues[index] = $scope.convertSubjectsToAffinityValue($scope.subjects);
			} else if (type === "GRADE") {
				$scope.affinityValues[index] =$scope.convertGradesToAffinityValue($scope.grades);
			} else if (type === "STUDENTGROUP") {
				$scope.affinityValues[index] = $scope.convertStudentGroupToAffinityValue($scope.studentGroups);
			} else {
				$scope.affinityValues[index] =[];
			}

		};
		$scope.addAffinity = function (schedule) {
			if($scope.schedule && !$scope.schedule.affinities) {
				$scope.schedule.affinities =[];
			}
			$scope.schedule.affinities.push({type:null,rule:"NONSTRICT",value:""});
        	$scope.scheduleForm.$dirty = true;
		};
		
		$scope.removeAffinity = function (index, schedule) {
        	$scope.scheduleForm.$dirty = true;
        	$scope.schedule.affinities.splice(index, 1);
		};

	    
		$scope.cancel = function() {
			$scope.actionButton = 'cancel';
			$state.transitionTo("searchSchedule");
		};
				
		$scope.saveSchedule = function(schedule){
			$scope.schedule.tenantId = CurrentUserService.getTenantId();
			$scope.savingIndicator = true;
			ScheduleService.save(schedule).then(
				function(response) {
					$scope.savingIndicator = false;
					$scope.errors = response.errors;
					if ($scope.errors.length == 0) {
						$scope.scheduleForm.$setPristine();
						$scope.schedule = response.data;
						$state.transitionTo("searchSchedule");
					}
			});
		};
    
		
  		$scope.formatInstitutionLabel = function(institution){
  			if (institution) {
  				$scope.schedule.institutionId = institution.id; 
  				$scope.searchStudentGroupParams(institution.id);
  				return institution.entityId;	
  			}			
  		};
  		
  		$scope.changeInstitutionId = function(institutionId){
  			$scope.schedule.institutionIdentifier = institutionId;
  		};
  		  		
  		$scope.changeInstitution = function(selectedItem){
  			$scope.schedule.institutionIdentifier = selectedItem.institution.entityId;
  		};		
  		
		//DatePicker format
		$scope.format = "yyyy-MM-dd";
				
		var splitExp = function(property) {
			var tokens =  property.split('schedule.')[1];
			return tokens+'.opened';
		};
		
		$scope.addDateWatchers(['schedule.startDate', 'schedule.endDate'], splitExp, $scope, function(flag) {
			if(flag) {
				$scope.scheduleForm.$dirty = true;
			}		
		});
		
  		$scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){ 
    		if ($scope.scheduleForm.$dirty) {
    			if(!confirm("You have unsaved changes. Are you sure you want to leave this page?")){
    				event.preventDefault();
    			}    	
	    	}
  		});
	}
]);

