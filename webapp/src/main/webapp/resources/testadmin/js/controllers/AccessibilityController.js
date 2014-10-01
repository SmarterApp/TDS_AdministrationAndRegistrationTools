testadmin.controller('AccessibilityController',['$scope','$state','$window','loadedData','AccessibilityService', 'AssessmentService', 'StudentService', 'AccommodationService',
		function($scope, $state, $window, loadedData,AccessibilityService, AssessmentService, StudentService, AccommodationService ) {
			$scope.savingIndicator = false;
		    $scope.accessibilityEquipment = loadedData.data;
		    $scope.errors = loadedData.errors;
			$scope.actionButton = '';
			$scope.formAction = 'Add';
			$scope.languages =[];

			if($scope.accessibilityEquipment && $scope.accessibilityEquipment.id){
				$scope.formAction = 'Edit';					
			} 
			$scope.equipmentTypes = AccessibilityService.loadEquipmentTypes();
			/**************Rules Editor ****************************************************************/
			$scope.dateTimeFields   = AssessmentService.loadDateTimeFields(); //Used just below
			$scope.formatDateFields = function(flag, assessment) {
				if (flag) {
					
					for (var i = 0; i < assessment.implicitEligibilityRules.length; i ++) {
						if ($scope.dateTimeFields.indexOf(assessment.implicitEligibilityRules[i].field) > -1) {
							assessment.implicitEligibilityRules[i].value = $filter('date')(assessment.implicitEligibilityRules[i].value, $scope.format);
						}
					} 
				}
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

			});		//DatePicker format
			$scope.format = "yyyy-MM-dd";
			
			$scope.ruleTypes 		= AssessmentService.loadRuleTypes();
			$scope.operatorTypes 	= AssessmentService.loadDateOperatorTypes();
			$scope.yesOrNoTypes 	= AssessmentService.loadYesOrNoTypes();
			$scope.yesOrNoFields 	= AssessmentService.loadYesOrNoFields();
			$scope.textFields 		= AssessmentService.loadTextFields();
			$scope.genders 			= AssessmentService.loadGenders();
			
			//Student based dropdowns
			$scope.section504Status 		= StudentService.section504Status();
			$scope.grades 					= StudentService.loadGrades();
			$scope.title3ProgramType 		= StudentService.title3ProgramType();
			$scope.primaryDisabilityType 	= StudentService.primaryDisabilityType();

			$scope.subjects 						= AccommodationService.subjects();
			$scope.americanSignLanguage 			= AccommodationService.americanSignLanguage();
			$scope.colorContrast 					= AccommodationService.colorContrast();
			$scope.closedCaptioning 				= AccommodationService.closedCaptioning();
			$scope.language 						= AccommodationService.language();
			$scope.masking 							= AccommodationService.masking();
			$scope.permissiveMode			 		= AccommodationService.permissiveMode();
			$scope.printOnDemand 					= AccommodationService.printOnDemand();
			$scope.printSize 						= AccommodationService.printSize();
			$scope.streamlinedInterface 			= AccommodationService.streamlinedInterface();
			$scope.textToSpeech 					= AccommodationService.textToSpeech();
			$scope.translation 						= AccommodationService.translation();
			$scope.nonEmbeddedDesignatedSupports 	= AccommodationService.nonEmbeddedDesignatedSupports();
			$scope.nonEmbeddedAccommodations 		= AccommodationService.nonEmbeddedAccommodations();
			
			$scope.defaultOperatorType = "=";
			$scope.operatorTypeMuted = true;			
			$scope.addRule = function() {
				if(!$scope.accessibilityEquipment.rules) {
					$scope.accessibilityEquipment.rules = [];
				}
				
				$scope.accessibilityEquipment.rules.push({"field":"", "value":"", "operatorType":"=", "ruleType":"ENABLER"});
				$scope.accessibilityEquipmentForm.$dirty = true;
			};
			
			$scope.deleteRule = function(index) {
				$scope.accessibilityEquipment.rules.splice(index, 1);
				$scope.accessibilityEquipmentForm.$dirty = true;
			};			
			
			/**************End Rules Editor ***********************************************************/
			$scope.cancel = function() {
				$scope.actionButton = 'cancel';
				$state.transitionTo("searchAccessibilityEquipment");
			};
		
			$scope.save = function(accessibilityEquipment) {
				$scope.savingIndicator = true;
				AccessibilityService.save(accessibilityEquipment).then(
					function(response) {
						$scope.savingIndicator = false;
						$scope.errors = response.errors;
						if ($scope.errors.length == 0) {
							$scope.accessibilityEquipmentForm.$setPristine();
							$scope.accessibilityEquipment = response.data;
							$state.transitionTo("searchAccessibilityEquipment");
						}
					});
			};
		
			$scope.$on('$stateChangeStart',
			function(event, toState, toParams, fromState, fromParams) {
				if ($scope.accessibilityEquipmentForm.$dirty && $scope.actionButton != 'cancel') {
					if (!confirm("You have unsaved changes. Are you sure you want to leave this page?")) {
						event.preventDefault();
					}
				}
			});
} ]);
