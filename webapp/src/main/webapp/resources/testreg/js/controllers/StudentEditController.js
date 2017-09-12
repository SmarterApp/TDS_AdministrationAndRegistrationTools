
testreg.controller('StudentEditController',['$scope','$state', '$filter', '$timeout', 'loadedData', 'StudentService','StateService', 'EntityService', 'inputData','prevActiveLink','AccommodationService','TestStatusService',
    function($scope, $state, $filter, $timeout,loadedData, StudentService, StateService, EntityService, inputData,prevActiveLink,AccommodationService, TestStatusService) {
	 $scope.activeLink = prevActiveLink;
	 $state.$current.self.name = prevActiveLink;
	 $scope.languages = [];
	 $scope.grades =[];
	 $scope.testStatuses = [];
	 $scope.studentTestStatuses =[];
	 $scope.headerNames = [];
	 $scope.selectedOptions = [];
	 $scope.MultiSelectCodes = [];
		
	 $scope.isActiveLink = function(link){
		return  $scope.activeLink.indexOf(link) == 0; 
	 };
	 
	 //to dynamically generate header names
	 AccommodationService.getHeaderNames().then(function (response){
		 $scope.headerNames = response.data;	
	});
	 
	 //getting multi-select code values
	 AccommodationService.getMultiSelectCodes().then(function (response){
		 $scope.MultiSelectCodes = response.data;
	});
	 
	$scope.hasStatus = function (assessmentId) {
		found = false;
		angular.forEach($scope.testStatuses, function(testStatus){
			if(testStatus.assessmentId === assessmentId) {
				if(testStatus.statusValue == "NON PARTICIPANT" || testStatus.statusValue == "NOT STARTED")
						found = false;
					else 
						found = true;
					return;
			}
		});
		return found;
	};
	
	$scope.getStatus = function(assessmentId, testStatuses){
		var status = "";
		angular.forEach(testStatuses, function(testStatus){
			if(testStatus.assessmentId === assessmentId) {
				status = testStatus.status;
				return;
			}
		});
		return status;
	};
	
	$scope.savingIndicator = false;
		$scope.errors = loadedData.errors;
		$scope.student = loadedData.data;
		$scope.actionButton = '';
		$scope.formAction = 'Add';
		$scope.xwalk   = function(label) {
			return $scope.safewalk('Student', label);
		};
		$scope.accommodationXwalk   = function(label) {
			return $scope.safewalk('Accommodations', label);
		};
		//Default value to NO for migrantStatus
		if(!$scope.student.id){
			$scope.student.migrantStatus ="NO";
		}
		StudentService.getLanguageCodes().then(function (response){
			var languageMap= response.data;
	        for (languageKey in languageMap) {
	        	if (languageMap.hasOwnProperty(languageKey)) {
	    			$scope.languages.push({id : languageKey, text : languageMap[languageKey] + ' (' + languageKey.toUpperCase() + ')'});
				}
			}

		});
		$scope.grades = StudentService.loadGrades();

		if($scope.student && $scope.student.id){
			$scope.formAction = 'Edit';		
			$scope.student.birthDate = StudentService.getFormattedDate($scope.student.birthDate);
			$scope.student.firstEntryDateIntoUsSchool = StudentService.getFormattedDate($scope.student.firstEntryDateIntoUsSchool);
			$scope.student.lepEntryDate = StudentService.getFormattedDate($scope.student.lepEntryDate);
			$scope.student.lepExitDate = StudentService.getFormattedDate($scope.student.lepExitDate); 

			//modify some of the enum values to match with drop down values
			if ($scope.student.section504Status == "CANNOTPROVIDE") {
				$scope.student.section504Status = "CANNOT PROVIDE";
			}
			
			StudentService.loadStudentEligibleAssessments($scope.student.id).then(function(loadedData) {
	  			$scope.eligibleAssessments = loadedData.data;
	  			
	  			angular.forEach($scope.eligibleAssessments, function(assessment){
					params = {"studentId":$scope.student.entityId,"stateAbbreviation":$scope.student.stateAbbreviation,"assessmentId":assessment.id,"currentPage": '0', "pageSize":"1000000","sortKey":"opportunity", "sortDir":"asc"};
					TestStatusService.search(params).then(function(response) {
						if (response.data.searchResults && response.data.searchResults.length > 0) {
							teststatus =  response.data.searchResults.pop();
						    $scope.testStatuses.push(teststatus);
						}	
					});
	  			});
	  		});
		} else {
			$scope.student.birthDate = null;
			$scope.student.firstEntryDateIntoUsSchool = null;
			$scope.student.lepEntryDate = null;
			$scope.student.lepExitDate = null;
			$scope.student.americanIndianOrAlaskaNative = "NO";
			$scope.student.hispanicOrLatino = "NO";		
			$scope.student.asian = "NO";
			$scope.student.blackOrAfricanAmerican = "NO";
			$scope.student.white = "NO";
			$scope.student.nativeHawaiianOrPacificIsland = "NO";
			$scope.student.twoOrMoreRaces = "NO";
		}
		
		$scope.section504Status = StudentService.section504Status();
		$scope.title3ProgramType = StudentService.title3ProgramType();
		$scope.primaryDisabilityType = StudentService.primaryDisabilityType();
		$scope.migrantStatus = StudentService.yesOrNo();
		$scope.disadvantageStatus = StudentService.yesOrNo();
		$scope.lepStatus = StudentService.yesOrNo();
		$scope.iDEAIndicator = StudentService.yesOrNo();
  		$scope.formatDistrictLabel = function(district) {
  			if(district) {
  				$scope.student.districtEntityMongoId = district.id;  
  	  			return district.entityId; 				
  			}
  		};

  		$scope.formatInstitutionLabel = function(institution){
  			if (institution) {
  				$scope.student.institutionEntityMongoId = institution.id; 
  				return institution.entityId;	
  			}			
  		};
  		
  		$scope.changeDistrictId = function(districtId){
  			$scope.student.districtIdentifier = districtId;
  		};
  		$scope.changeInstitutionId = function(institutionId){
  			$scope.student.institutionIdentifier = institutionId;
  		};
  		  		
  		$scope.changeDistrict = function(selectedItem){
  			$scope.student.districtIdentifier = selectedItem.district.entityId;
  		};
  		$scope.changeInstitution = function(selectedItem){
  			$scope.student.institutionIdentifier = selectedItem.institution.entityId;
  		};
		StateService.loadStates().then(function(loadedData) {
			$scope.states = loadedData.data;
		});
		
		$scope.grdStudent = $scope.student.gradeLevelWhenAssessed;
		
		$scope.resetAccommodationEntities = function(student) {
			
			if($scope.grdStudent !=null && student.accommodations.length > 0){
				if(!confirm("Changing the student's grade will cause their accommodations to be deleted. Are you sure you want to continue?")){
					$scope.student.gradeLevelWhenAssessed = $scope.grdStudent;
				}else{
					$scope.grdStudent = $scope.student.gradeLevelWhenAssessed;
					if(student.accommodations.length > 0){
						student.accommodations.splice(0,student.accommodations.length);
					}
				}
			}else{
				$scope.grdStudent = $scope.student.gradeLevelWhenAssessed;
			}
		};
		
		//DatePicker format
		$scope.format = "yyyy-MM-dd";
		$scope.formatDateFields = function(flag) {
			if(flag) {
				if ($scope.studentForm['student.birthDate'].$dirty) {
					$scope.student.birthDate = $filter('date')($scope.student.birthDate, $scope.format);
				}
				if ($scope.studentForm['student.firstEntryDateIntoUsSchool'].$dirty) {
					$scope.student.firstEntryDateIntoUsSchool = $filter('date')($scope.student.firstEntryDateIntoUsSchool, $scope.format);
				}	
				if ($scope.studentForm['student.lepEntryDate'].$dirty) {
					$scope.student.lepEntryDate = $filter('date')($scope.student.lepEntryDate, $scope.format);
				}
				if ($scope.studentForm['student.lepExitDate'].$dirty) {
					$scope.student.lepExitDate = $filter('date')($scope.student.lepExitDate, $scope.format);
				}				
				
			}
		};
			
		$scope.save = function(student) {
			$scope.errors =[];
			$scope.savingIndicator = true;
			
			//if date is undefined then it means the entered date is not a valid date
			if (student.birthDate === undefined) {
				$scope.errors.push("The Birthdate is invalid: the valid format is YYYY-MM-DD");
				$scope.savingIndicator = false;
			}
			if (student.firstEntryDateIntoUsSchool === undefined) {
				$scope.errors.push("Invalid date or invalid date format for First Entry Date Into US School. Valid format is YYYY-MM-DD");
				$scope.savingIndicator = false;
			}
			if (student.lepEntryDate === undefined) {
				$scope.errors.push("Invalid date or invalid date format for Limited English Proficiency Entry Date. Valid format is YYYY-MM-DD");
				$scope.savingIndicator = false;
			}
			if (student.lepExitDate === undefined) {
				$scope.errors.push("Invalid date or invalid date format for LEP Exit Date. Valid format is YYYY-MM-DD");
				$scope.savingIndicator = false;
			}
			if(student.accommodations){
				
				for(var i=0; i<student.accommodations.length; i++){
					
					if(student.accommodations[i].studentId == '' || student.accommodations[i].studentId == null && student.entityId  != null){
						student.accommodations[i].studentId = student.entityId;
					}
					
					if(student.accommodations[i].stateAbbreviation == '' || student.accommodations[i].stateAbbreviation == null && student.stateAbbreviation  != null){
						student.accommodations[i].stateAbbreviation = student.stateAbbreviation;
					}
				}
			}
			$scope.formatDateFields(true);
			if ($scope.errors.length == 0) {
				StudentService.saveStudent(student).then(function(response) {
					$scope.savingIndicator = false;
					$scope.errors = response.errors;
					if($scope.errors.length == 0){
						angular.forEach($scope.eligibleAssessments, function(assessment){
							status = $scope.studentTestStatuses[assessment.id];
							for(var i=0;i<$scope.testStatuses.length;i++){
								if(status && status == "OPTED_OUT" && $scope.testStatuses[i].assessmentId == assessment.id) {
									testStatus = {"id": $scope.testStatuses[i].id, "studentId" : student.entityId, "stateAbbreviation" : student.stateAbbreviation, "assessmentId":assessment.id, "status" : status, "opportunity" :1};
									TestStatusService.save(testStatus);
									break;
								}else if(status == "SCHEDULED" && $scope.testStatuses[i].assessmentId == assessment.id){
									testStatus = {"id": $scope.testStatuses[i].id, "studentId" : student.entityId, "stateAbbreviation" : student.stateAbbreviation, "assessmentId":assessment.id, "status" : status, "opportunity" :1};
									TestStatusService.save(testStatus);
									break;
								}
							}
							status='';
						});
						$scope.studentForm.$setPristine();
						$scope.student = response.data;
						$state.transitionTo("searchStudent");
					}
				});
			}
		};
    
		$scope.cancel = function() {
			$scope.actionButton = 'cancel';
			$state.transitionTo("searchStudent");
		};
		
  		$scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){ 
    		if ($scope.studentForm.$dirty) {
    			if(!confirm("You have unsaved changes. Are you sure you want to leave this page?")){
    				event.preventDefault();
    			}    	
	    	}
  		});
	}
]);

