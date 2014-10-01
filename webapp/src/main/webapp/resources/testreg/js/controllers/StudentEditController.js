
testreg.controller('StudentEditController',['$scope','$state', '$filter', '$timeout', 'loadedData', 'StudentService','StateService', 'EntityService', 'inputData','prevActiveLink','AccommodationService','TestStatusService',
    function($scope, $state, $filter, $timeout,loadedData, StudentService, StateService, EntityService, inputData,prevActiveLink,AccommodationService, TestStatusService) {
	 $scope.activeLink = prevActiveLink;
	 $state.$current.self.name = prevActiveLink;
	 $scope.languages = [];
	 $scope.grades =[];
	 $scope.testStatuses = [];
	 $scope.studentTestStatuses =[];
	 $scope.isActiveLink = function(link){
		return  $scope.activeLink.indexOf(link) == 0; 
	 };

	$scope.hasStatus = function (assessmentId) {
		found = false;
		angular.forEach($scope.testStatuses, function(testStatus){
			if(testStatus.assessmentId === assessmentId) {
				found = true;
				return;
			}
		});
		return found;
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
			if ($scope.student.accommodations) {
				for (var i = 0; i < $scope.student.accommodations.length; i++) {
					if ($scope.student.accommodations[i].textToSpeech == "TDS_TTS_StimAndTDS_TTS_Item") {
						$scope.student.accommodations[i].textToSpeech = "TDS_TTS_Stim&TDS_TTS_Item";
					}
					if ($scope.student.accommodations[i].language == "ENUBraille") {
						$scope.student.accommodations[i].language = "ENU-Braille";
					}
					if ($scope.student.accommodations[i].translation !=null 
							&& $scope.student.accommodations[i].translation.indexOf("And") > 0) {
						var andIdx = $scope.student.accommodations[i].translation.indexOf("And");
						var newVal = $scope.student.accommodations[i].translation.substring(0, andIdx);
						newVal += "&";
						newVal += $scope.student.accommodations[i].translation.substring(andIdx + 3);
						$scope.student.accommodations[i].translation = newVal;
					}
				}
			}
			
			StudentService.loadStudentEligibleAssessments($scope.student.id).then(function(loadedData) {
	  			$scope.eligibleAssessments = loadedData.data;				
	  			angular.forEach($scope.eligibleAssessments, function(assessment){
					params = {"studentId":$scope.student.id,"stateAbbreviation":$scope.student.stateAbbreviation,"assessmentId":assessment.id,"currentPage": '0', "pageSize":"1000000","sortKey":"opportunity", "sortDir":"asc"};
					TestStatusService.search(params).then(function(response) {
						if (response.data.searchResults && response.data.searchResults.length > 0) {
							teststatus =  response.data.searchResults.pop();
							$scope.testStatuses.push(teststatus);
						}
						
					});
	  			});
	  		});
		} else {

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
		
		
		var splitExp = function(property) {
			var tokens =  property.split('student.')[1];
			return tokens+'.opened';
		};
		
		$scope.addDateWatchers(['student.birthDate', 'student.firstEntryDateIntoUsSchool', 
		                        'student.lepEntryDate', 'student.lepExitDate'], splitExp, $scope, function(flag) {
			if(flag) {
				$scope.formatDateFields(true);
				$scope.studentForm.$dirty = true;
			}		
		});
		
		//DatePicker format
		$scope.format = "yyyy-MM-dd";
		$scope.formatDateFields = function(flag) {
			if(flag) {
				$scope.student.birthDate = $filter('date')($scope.student.birthDate, $scope.format);
				$scope.student.firstEntryDateIntoUsSchool = $filter('date')($scope.student.firstEntryDateIntoUsSchool, $scope.format);
				$scope.student.lepEntryDate = $filter('date')($scope.student.lepEntryDate, $scope.format);
				$scope.student.lepExitDate = $filter('date')($scope.student.lepExitDate, $scope.format);
			}
		};
			
		$scope.save = function(student) {
			$scope.savingIndicator = true;
			$scope.formatDateFields(true);
			StudentService.saveStudent(student).then(function(response) {
				$scope.savingIndicator = false;
				$scope.errors = response.errors;
				if($scope.errors.length == 0){
					//save optout test statuses if any
					angular.forEach($scope.eligibleAssessments, function(assessment){
						status = $scope.studentTestStatuses[assessment.id];
						if(status && status === "OPTED_OUT") {
							testStatus = {"studentId" : student.id, "stateAbbreviation" : student.stateAbbreviation, "assessmentId":assessment.id, "status" : "OPTED_OUT", "opportunity" :0};
							TestStatusService.save(testStatus);
						}
					});
					$scope.studentForm.$setPristine();
					$scope.student = response.data;
					$state.transitionTo("searchStudent");
				}
			});
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

