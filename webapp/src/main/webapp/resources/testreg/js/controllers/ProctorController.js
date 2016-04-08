testreg.controller('ProctorController',['$scope','$state', '$window', '$timeout','loadedData', 'AssessmentService', 'inputData', 'ProctorService', 'SubjectService','StudentService',
    function($scope, $state, $window, $timeout,loadedData, AssessmentService, inputData, ProctorService, SubjectService,StudentService) {
		$scope.savingIndicator = false;
		$scope.errors = loadedData.errors;
		$scope.actionButton = '';
		$scope.formAction = 'Add';
		$scope.proctorSubjects = [];
		$scope.studentSubjects = [];
		$scope.grades = [];
		$scope.assessments =[];

		$scope.affinityValues =[];
		$scope.affinityTypes = ProctorService.loadAffinityTypes();
		StudentService.loadGrades().then(function(response){
			$scope.grades = response;
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
        
		$scope.setAffinities = function (index, type) {
			if (type === "ASSESSMENT") {
				$scope.affinityValues[index] = $scope.convertAssessmentsToAffinityValue($scope.assessments);
			} else if (type === "SUBJECT") {
				$scope.affinityValues[index] = $scope.convertSubjectsToAffinityValue($scope.proctorSubjects);
			} else if (type === "GRADE") {
				$scope.affinityValues[index] = $scope.convertGradesToAffinityValue($scope.grades);
			} else {
				$scope.affinityValues[index] =[];
			}

		};
		$scope.addAffinity = function () {
        	if(!$scope.proctor || !$scope.proctor.affinities) {
        		$scope.proctor.affinities=[];
        	}
        	$scope.proctor.affinities.push({type:null,rule:"NONSTRICT",value:""});
        	$scope.proctorForm.$dirty = true;
		};
		
		$scope.removeAffinity = function (index) {
        	$scope.proctorForm.$dirty = true;
        	$scope.proctor.affinities.splice(index, 1);
		};
		SubjectService.findAll().then(function(loadedData) {
			$scope.proctorSubjects = loadedData.data;
		});
		
		$scope.fetchProctorRoles = function(roles) {
			ProctorService.getProctorRoles(roles).then(function(responseData){
				$scope.userProctorRoles = responseData.data.searchResults; //Proctor Roles that this user has
			});
		};
		
		$scope.getEligibleAssessmentTypesForUser = function() {
			var assessmentTypes = [];
			angular.forEach($scope.userProctorRoles, function(proctorRole) {
				angular.forEach(proctorRole.assessmentTypes, function(assessmentType){
					assessmentTypes.push(assessmentType);
				});
			});
			return assessmentTypes;
		};
		
		AssessmentService.findAssessmentBySearchVal
		(ProctorService.getSeperatedValues($scope.getEligibleAssessmentTypesForUser(), ","), "1000000", "type").then(function(response){
			if (response.data) {
				$scope.assessments = response.data.searchResults;
			}
		});
		
		if($scope.proctor && $scope.proctor.id) {
			$scope.formAction = 'Edit';	
		}
		
		$scope.proctor  		= loadedData.data;
		if(!loadedData.data) {
			$scope.proctor = {};
			$scope.proctor = {user: inputData.data};
			$scope.fetchProctorRoles(ProctorService.getRoleNames(inputData.data));
		} else {
			$timeout(function() {
				if ($scope.proctor.affinities) {
					angular.forEach($scope.proctor.affinities, function(affinity, index) {
						if (affinity.type === "ASSESSMENT") {
							$scope.affinityValues[index] = $scope.convertAssessmentsToAffinityValue($scope.assessments);
						} else if (affinity.type === "SUBJECT") {
							$scope.affinityValues[index] = $scope.convertSubjectsToAffinityValue($scope.proctorSubjects);
						} else if (affinity.type === "GRADE") {
							$scope.affinityValues[index] = $scope.convertGradesToAffinityValue($scope.grades);
						} else {
							$scope.affinityValues[index] =[];
						}
					});
				}
			}, 300);
			$scope.fetchProctorRoles(ProctorService.getRoleNames(loadedData.data.user));
		}
			
		ProctorService.getAssessmentTypes().then(function(response){
			  $scope.assessmentTypes = response.data;
		});
				
		//Availability Window Functions ****STARTS HERE**********
		$scope.format = "yyyy-MM-dd";
		
		$scope.availabilityChoices = ProctorService.loadAvailabilityChoices();
				
		$scope.publishAvailabilityWindowDateWatchers = function(rowIndex) {
			var startDateModel = 'proctor.availabilityWindow['+rowIndex+'].startDateComponent';
			var endDateModel   = 'proctor.availabilityWindow['+rowIndex+'].endDateComponent';
			var splitExp = function(property) {
				return property+'Opened';
			};
						
			$scope.addDateWatchers([startDateModel, endDateModel], splitExp, $scope, function(flag) {
				if(flag) {
					$scope.proctorForm.$dirty = true;
				}	
			});
		};
		
		if($scope.proctor && $scope.proctor.id) {//This is 'Edit' case. So add watchers to existing availability windows
			angular.forEach($scope.proctor.availabilityWindow, function(availabilityWindow, index){
				$scope.publishAvailabilityWindowDateWatchers(index);
			});
		}
		
		$scope.addAvailabilityWindow = function() {
			if(!$scope.proctor.availabilityWindow) {
				$scope.proctor.availabilityWindow = [];
			}
			$scope.proctor.availabilityWindow.push({"startDateComponent":"", "endDateComponent":"", "startTimeComponent":"", "endTimeComponent": ""});
			$scope.proctorForm.$dirty = true;
			
			
			var index = $scope.proctor.availabilityWindow.length-1; //0 based
			$scope.publishAvailabilityWindowDateWatchers(index);			
		};	
		
		$scope.removeAvailabilityWindow = function(index){
			$scope.proctor.availabilityWindow.splice(index, 1);
			$scope.proctorForm.$dirty = true;
		};
		
		$scope.getFormattedDate = function(date, format) {
			return new Date($filter('date')(date, format));
		};
		
		$scope.mergeDateAndTime= function() {
			var mergedDate = ProctorService.getMergedDate;
			angular.forEach($scope.proctor.availabilityWindow, function(availabilityWindow) {
				availabilityWindow.startDateTime = ProctorService.getMergedDate(availabilityWindow.startDateComponent, availabilityWindow.startTimeComponent);
				availabilityWindow.endDateTime   = ProctorService.getMergedDate(availabilityWindow.endDateComponent, availabilityWindow.endTimeComponent);
			});		
		};
		
		$scope.getDateComponent = function(date) {
			var dateComponent = new Date();
			dateComponent.setFullYear(ProctorService.getFormattedDate(date, "yyyy"));
			dateComponent.setMonth(parseInt(ProctorService.getFormattedDate(date, "MM"))-1);
			dateComponent.setDate(ProctorService.getFormattedDate(date, "dd"));
	    	return dateComponent;
		};
		
		$scope.getTimeComponent = function(date) {
			var timeComponent = new Date();		
			timeComponent.setHours(ProctorService.getFormattedDate(date, "H"));
			timeComponent.setMinutes(ProctorService.getFormattedDate(date, "mm"));
			return timeComponent;
		};
		
		$scope.setDateTimeComponents = function() {
			angular.forEach($scope.proctor.availabilityWindow, function(availabilityWindow) {
				if(availabilityWindow.startDateTime){
					availabilityWindow.startDateComponent = $scope.getDateComponent(availabilityWindow.startDateTime);
					availabilityWindow.startTimeComponent = $scope.getTimeComponent(availabilityWindow.startDateTime);
				}
				
				if(availabilityWindow.endDateTime) {
					availabilityWindow.endDateComponent = $scope.getDateComponent(availabilityWindow.endDateTime);
					availabilityWindow.endTimeComponent = $scope.getTimeComponent(availabilityWindow.endDateTime);
				}
			});
		};
	
		$scope.setDateTimeComponents(); //set Date & Time component values;
		//**********ENDS HERE*********
		
		$scope.cancel = function() {
            $state.transitionTo("searchUser");
        };
        
        $scope.$on('$stateChangeStart',
				function(event, toState, toParams,
						fromState, fromParams) {
					if ($scope.proctorForm.$dirty
							&& $scope.actionButton != 'cancel') {
						if (!confirm("You have unsaved changes. Are you sure you want to leave this page?")) {
							event.preventDefault();
						}
					}
				});
        
		$scope.save = function(proctor) {
			$scope.savingIndicator = true;
			$scope.mergeDateAndTime();
			ProctorService.save(proctor).then(
				function(response) {
					$scope.savingIndicator = false;
					$scope.errors = response.errors;
					if ($scope.errors.length == 0) {
						$scope.proctorForm.$setPristine();
						$scope.proctor = response.data;
						$state.transitionTo("searchUser");
					}
				});
		};
	}
]);

