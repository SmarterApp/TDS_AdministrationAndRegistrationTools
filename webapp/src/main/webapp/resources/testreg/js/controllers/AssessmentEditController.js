testreg.controller('AssessmentEditController',['$scope','$state', '$filter', 'loadedData', 'AssessmentService', 'StudentService', 'AccommodationService','StateService', 'inputData','$window','tsbNav','prevActiveLink','SubjectService',
    function($scope, $state, $filter, loadedData, AssessmentService, StudentService, AccommodationService, StateService,inputData,$window,tsbNav,prevActiveLink,SubjectService) {
	$scope.activeLink = prevActiveLink;
	 $state.$current.self.name = prevActiveLink;
	 $scope.languages = [];
	 $scope.subjects =[];
	 $scope.accommodationResourceData = [];
	 $scope.masterAccommodations = [];

	 $scope.isActiveLink = function(link){
			return  $scope.activeLink.indexOf(link) == 0; 
		 };
		 $scope.savingIndicator = false;
		$scope.errors = loadedData.errors;
		$scope.assessment = loadedData.data;
		$scope.actionButton = '';
		$scope.formAction = 'Add';
		$scope.tsbFlag = tsbNav;
		
		$scope.dateTimeFields   = AssessmentService.loadDateTimeFields(); //Used just below
		$scope.formatDateFieldsEdit = function(flag, assessment) {
			if (flag) {
				
				for (var i = 0; i < assessment.implicitEligibilityRules.length; i ++) {
					if ($scope.dateTimeFields.indexOf(assessment.implicitEligibilityRules[i].field) > -1 ) {
						assessment.implicitEligibilityRules[i].value = StudentService.getFormattedDate(assessment.implicitEligibilityRules[i].value);
					}
				} 
			}
		};
		
		$scope.formatDateFields = function(flag, assessment) {
			if (flag) {
				
				for (var i = 0; i < assessment.implicitEligibilityRules.length; i ++) {
					if ($scope.dateTimeFields.indexOf(assessment.implicitEligibilityRules[i].field) > -1 && $scope.assessmentForm['implicitEligibilityRulesEntry.value'].$dirty) {
						assessment.implicitEligibilityRules[i].value = $filter('date')(assessment.implicitEligibilityRules[i].value, $scope.format);
					}
				} 
			}
		};
		
		$scope.formatOperators = function(assessment) {
			if(assessment.implicitEligibilityRules){
				for (var i = 0; i < assessment.implicitEligibilityRules.length; i ++) {
					if (assessment.implicitEligibilityRules[i].operatorType == "LESS_THAN_EQUALS") {
						assessment.implicitEligibilityRules[i].operatorType = "<=";
					}else if (assessment.implicitEligibilityRules[i].operatorType == "LESS_THAN") {
						assessment.implicitEligibilityRules[i].operatorType = "<";
					}else if (assessment.implicitEligibilityRules[i].operatorType == "GREATER_THAN_EQUALS") {
						assessment.implicitEligibilityRules[i].operatorType = ">=";
					}else if (assessment.implicitEligibilityRules[i].operatorType == "GREATER_THAN") {
						assessment.implicitEligibilityRules[i].operatorType = ">";
					}else if (assessment.implicitEligibilityRules[i].operatorType == "EQUALS"){
						assessment.implicitEligibilityRules[i].operatorType = "=";
					}
				}
			}
		};
		StateService.loadStates().then(function(loadedData) {
			$scope.states = loadedData.data;	
		});		
		
		$scope.publishTestWindowDateWatchers = function(rowIndex) {
			var beginWindowModel = 'assessment.testWindow['+rowIndex+'].beginWindow';
			var endWindowModel   = 'assessment.testWindow['+rowIndex+'].endWindow';
			var splitExp = function(property) {
				return property+'Opened';
			};
						
			$scope.addDateWatchers([beginWindowModel, endWindowModel], splitExp, $scope, function(flag) {
				if(flag) {
					$scope.assessmentForm.$dirty = true;
					$scope.formatDateFields(true, $scope.assessment);
				}	
			});
		};
		
		if($scope.assessment && $scope.assessment.id){
			
			$scope.formAction = 'Edit';
			
			if($scope.assessment.testWindow) {
				angular.forEach($scope.assessment.testWindow, function(testWindow, index) {
					$scope.publishTestWindowDateWatchers(index);
					
					if ($scope.assessment.implicitEligibilityRules.length > 0) {
						$scope.formatOperators($scope.assessment);
						$scope.formatDateFieldsEdit(true, $scope.assessment);
						
					}
				});
			}
			
		} else {
			//set the Default Value
			$scope.assessment.numGlobalOpportunities="3";
			if(inputData) {

				$scope.assessment.entityId = inputData.entityId;
				$scope.assessment.testName = inputData.testName;
				
			}
		}

		$scope.xwalk   = function(label) {
			return $scope.safewalk('Assessment', label);
		};
		
		$scope.eligibilityTypes = AssessmentService.loadEligibilityTypes();
		
		
		$scope.save = function(assessment) {
			$scope.savingIndicator = true;
			if(assessment.eligibilityType == "EXPLICIT" && assessment.implicitEligibilityRules.length > 0){
				if($window.confirm("All Implicit Eligibility Rules will get deleted. Click 'OK' to Delete")){
					assessment.implicitEligibilityRules.length = 0;
				}else{
					$scope.savingIndicator = false;
					return;
				}
				
			}
			
			if (assessment.eligibilityType == "IMPLICIT" && assessment.implicitEligibilityRules.length > 0) {
				$scope.formatDateFields(true, assessment);
			}
			AssessmentService.saveAssessment(assessment).then(function(response){
				$scope.savingIndicator = false;
				$scope.errors = response.errors;
				if($scope.errors.length == 0){
					$scope.assessmentForm.$setPristine();
					$scope.assessment = response.data;
					if($scope.tsbFlag == true){
						$state.transitionTo("searchTSBAssessment");
					}else{
						$state.transitionTo("searchAssessment");
					}
					
				}
			});
		};
		
		$scope.addTestWindow = function() {
			if(!$scope.assessment.testWindow) {
				$scope.assessment.testWindow = [];
			}
			$scope.assessment.testWindow.push({"beginWindow":"", "endWindow":"", "numOpportunities":$scope.assessment.numGlobalOpportunities});
			$scope.assessmentForm.$dirty = true;
			
			
			var index = $scope.assessment.testWindow.length-1; //0 based
			$scope.publishTestWindowDateWatchers(index);			
		};		
		
		$scope.deleteTestWindow = function(index) {
			$scope.assessment.testWindow.splice(index, 1);
            if($scope.assessment.testWindow.length == 1){
                $scope.assessment.testWindow[0].numOpportunities = "";
            }
			$scope.assessmentForm.$dirty = true;
		};
		
		$scope.fields    = AssessmentService.loadRuleFields();
		$scope.emptyTheValueField = function(implicitEligibilityRulesEntry){
			implicitEligibilityRulesEntry.value = "";
			implicitEligibilityRulesEntry.operatorType = 'EQUALS';
		};
		
		StudentService.getLanguageCodes().then(function (response){
			var languageMap= response.data;
	        for (languageKey in languageMap) {
	        	if (languageMap.hasOwnProperty(languageKey)) {
	    			$scope.languages.push({id : languageKey, text : languageMap[languageKey] + ' (' + languageKey.toUpperCase() + ')'});
				}
			}

		});		
		$scope.grades = StudentService.loadGrades();
		//DatePicker format
		$scope.format = "yyyy-MM-dd";
		
		$scope.ruleTypes 		= AssessmentService.loadRuleTypes();
		$scope.operatorTypes 	= AssessmentService.loadDateOperatorTypes();
		$scope.yesOrNoTypes 	= AssessmentService.loadYesOrNoTypes();
		$scope.yesOrNoFields 	= AssessmentService.loadYesOrNoFields();
		$scope.textFields 		= AssessmentService.loadTextFields();
		$scope.genders 			= AssessmentService.loadGenders();
		
		$scope.loadSingleSelectFields = [];
		$scope.loadEditFields = [];
		
		//Student based dropdowns
		$scope.section504Status 		= StudentService.section504Status();
		$scope.title3ProgramType 		= StudentService.title3ProgramType();
		$scope.primaryDisabilityType 	= StudentService.primaryDisabilityType();
		
		SubjectService.findAll().then(function(response){
			$scope.subjects = response.data;
		});
		
		//getting all options from masterResourceAccommodation
		AccommodationService.findAll().then(function(response){
			$scope.accommodationResourceData = response.data;
			var accommodationFamily = $scope.accommodationResourceData;
    		if(accommodationFamily !=null){
				for(var i=0;i<accommodationFamily.length;i++){
					$scope.tempOptionArray = [];
						for(var j = 0; j < accommodationFamily[i].options.length;j++){
							for(var k = 0; k < accommodationFamily[i].options[j].text.length;k++){
								if(accommodationFamily[i].options[j].text[k].language == 'eng'){
									//preparing Json the format we need to display the options 
									$scope.tempOptionArray.push({"name": accommodationFamily[i].options[j].code,"description": accommodationFamily[i].options[j].text[k].label });
								}
							}
						}
						
						for(var l = 0;l< accommodationFamily[i].header.length;l++){
							if(accommodationFamily[i].header[l].language == 'eng'){
								$scope.fields.push({fieldId: accommodationFamily[i].header[l].label, fieldValue: $scope.lowerCaseFirstLetter(accommodationFamily[i].code), segment: "Accommodation"});
							}
						}
						if(accommodationFamily[i].resourceType == 'SingleSelectResource' || accommodationFamily[i].resourceType == 'MultiSelectResource'){
						$scope.loadSingleSelectFields.push($scope.lowerCaseFirstLetter(accommodationFamily[i].code));
						}else if(accommodationFamily[i].resourceType == 'EditResource'){
							$scope.loadEditFields.push($scope.lowerCaseFirstLetter(accommodationFamily[i].code));
						}
						$scope.masterAccommodations[$scope.lowerCaseFirstLetter(accommodationFamily[i].code)] = $scope.tempOptionArray;
				}
    		}
		});
		
		$scope.lowerCaseFirstLetter = function(value){
			return value.charAt(0).toLowerCase() + value.slice(1);
		};
		
		$scope.defaultOperatorType = "=";
		$scope.operatorTypeMuted = true;
		
		$scope.addImplicitEligibilityRule = function() {
			if(!$scope.assessment.implicitEligibilityRules) {
				$scope.assessment.implicitEligibilityRules = [];
			}
			
			$scope.assessment.implicitEligibilityRules.push({"field":"", "value":"", "operatorType":"=", "ruleType":""});
			$scope.assessmentForm.$dirty = true;
		};
		
		$scope.deleteImplicitEligibilityRule = function(index) {
			$scope.assessment.implicitEligibilityRules.splice(index, 1);
			$scope.assessmentForm.$dirty = true;
		};
    
		$scope.cancel = function() {
			$scope.actionButton = 'cancel';
			if($scope.tsbFlag == true){
				$state.transitionTo("searchTSBAssessment");
			}else{
				$state.transitionTo("searchAssessment");
			}	
		};
		
  		$scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){ 
    		if ($scope.assessmentForm.$dirty) {
    			if(!confirm("You have unsaved changes. Are you sure you want to leave this page?")){
    				event.preventDefault();
    			}    	
	    	}
  		});
	}
]);

