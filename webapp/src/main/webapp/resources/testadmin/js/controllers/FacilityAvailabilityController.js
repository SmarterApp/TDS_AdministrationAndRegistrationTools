testreg.controller('FacilityAvailabilityController',['$scope','$state', '$window', '$timeout', 'loadedData','FacilityAvailabilityService','FacilityService', 'AssessmentService', 'SubjectService', '$dialogs','StudentService',
    function($scope, $state, $window,$timeout,loadedData,FacilityAvailabilityService,FacilityService, AssessmentService, SubjectService, $dialogs,StudentService) {
		$scope.savingIndicator = false;
		$scope.errors = [];
		$scope.actionButton = '';
		$scope.formAction = 'Add';
		$scope.errors = loadedData.errors;
		$scope.facilityAvailability = loadedData.data;
		$scope.originalFA = angular.copy(loadedData.data);
		$scope.facilities = [];
		$scope.startHours = [];
		$scope.startMinutes = [];
		$scope.endHours = [];
		$scope.endMinutes = [];		
		$scope.seatConfigurations=[];
		$scope.selectedConfigurations=[];
		$scope.subjects = [];
		$scope.selectedAssessments = [];

		//DatePicker format
		$scope.format = "yyyy-MM-dd";
		$scope.domain = "facilityAvailability";
		$scope.affinityTypes = FacilityAvailabilityService.loadAffinityTypes();
		AssessmentService.findAllImportedAssessments().then(function(response){
			$scope.assessments = response.data;
		});
		
		SubjectService.findAll().then(function(loadedData) {
			$scope.subjects = loadedData.data;
		});
		
		StudentService.loadGrades().then(function(response){
			$scope.grades = response;
		});
		
		
		$scope.availabilityChoices = FacilityAvailabilityService.loadAvailabilityChoices();
		
		$scope.xwalk   = function(label) {
			return $scope.safewalk('Institution', label);
		};
		
		$scope.clearAvailabilities = function() {
			$scope.facilityAvailability.facilityTimes=[];
		};

		var splitExp = function(property) {
			var tokens =  property.split('facilityAvailability.')[1];
			return tokens+'.opened';
		};
		
		$scope.addDateWatchers(['facilityAvailability.fromDate', 'facilityAvailability.toDate'], splitExp, $scope, function(flag) {
			if(flag) {
				$scope.facilityAvailabilityForm.$dirty = true;
			}		
		});
		$scope.searchFacilities = function(institution) {
			params = {"institutionIdentifier":institution,"currentPage": '0', "pageSize":"10000"};
			FacilityService.search(params).then(function(response){
	    		if(response.data){
	    			$scope.facilities = response.data.searchResults;
	    		}
	        });
		};
		
		$scope.setFacility = function(facilityName) {
			if($scope.facilityAvailability.facilityTimes && $scope.facilityAvailability.facilityTimes.length >0) {
	   			if(!confirm('Changing facility will clear all testing slots for the existing facility. Are you sure you want to continue?')){
	   				event.preventDefault();
	   				$scope.facilityAvailability.facilityName = $scope.originalFA.facilityName;
	   				$scope.facilityAvailability.facilityId = $scope.originalFA.facilityId;
	   			}  else {
	   				$scope.facilityAvailability.facilityTimes = [];
	   				$scope.selectedConfigurations=[];
	   			}				
			}
			angular.forEach($scope.facilities, function(facility){
				if(facility.facilityName === facilityName){
					$scope.facilityAvailability.facilityId = facility.id;
					$scope.seatConfigurations = facility.seatConfigurations;
				}
			});
		};
		
		if($scope.facilityAvailability && $scope.facilityAvailability.id){
			$scope.formAction = 'Edit';				
			$scope.searchFacilities($scope.facilityAvailability.institutionIdentifier);		
			angular.forEach($scope.facilityAvailability.facilityTimes, function(facilityTime, index){
				//add selected seats
				$scope.selectedConfigurations[index] = facilityTime.seatConfigurations;
				//convert date to time. this needs to be re-factored later with a directive
				facilityTime.timeSlot.startTime = new Date(facilityTime.timeSlot.startTime);
				facilityTime.timeSlot.endTime = new Date(facilityTime.timeSlot.endTime);
			});
			
			
		} 
		
        $scope.addSeats = function (index) {
        	$scope.facilityAvailabilityForm.$dirty =true;
        	if($scope.seatConfigurations && $scope.seatConfigurations.length == 0) {
        		//get seatConfigurations for a facility
    			angular.forEach($scope.facilities, function(facility){
    				if(facility.facilityName === $scope.facilityAvailability.facilityName){
    					$scope.seatConfigurations = facility.seatConfigurations;
    				}
    			});
        	}
        	$scope.existingConfigurations = $scope.facilityAvailability.facilityTimes[index].seatConfigurations;
            dlg = $dialogs.create('resources/testadmin/partials/seat-selection.html','SeatDialogController',{seatConfigurations:$scope.seatConfigurations, existingConfigurations:$scope.existingConfigurations},{key: false,back: 'static'});
            dlg.result.then(function(selectedConfigurations){
              $scope.selectedConfigurations[index] = selectedConfigurations;
              $scope.facilityAvailability.facilityTimes[index].seatConfigurations = selectedConfigurations;
            },function(){
              //no selection made
            });
        };
        
        $scope.addAffinity = function (index) {
        	$scope.facilityAvailabilityForm.$dirty =true;
        	$scope.existingAffinities = $scope.facilityAvailability.facilityTimes[index].timeSlot.affinities;
            dlg = $dialogs.create('resources/testadmin/partials/affinity-selection.html','AffinityDialogController',
            		{affinities:$scope.existingAffinities,affinityTypes:$scope.affinityTypes,assessments:$scope.assessments,
            	subjects:$scope.subjects,grades:$scope.grades},{key: false,back: 'static'});
            dlg.result.then(function(affinities){
              $scope.facilityAvailability.facilityTimes[index].timeSlot.affinities = affinities;
            },function(){
              //no selection made
            });
        };
        
		$scope.addTimeSlot = function () {
			$scope.facilityAvailabilityForm.$dirty =true;
			var seatConfigurations =[];
			var affinities = [];
			var	timeSlot ={"startTime":"","endTime":"", "affinities":affinities};
			
        	if($scope.facilityAvailability && $scope.facilityAvailability.facilityTimes) {
        		$scope.facilityAvailability.facilityTimes.push({timeSlot:timeSlot,seatConfigurations:seatConfigurations});
        	} else {
        		$scope.facilityAvailability.facilityTimes=[];
        		$scope.facilityAvailability.facilityTimes.push({timeSlot:timeSlot,seatConfigurations:seatConfigurations});        		
        	}
		};
		
		$scope.removeTimeSlot = function (index) {
			$scope.facilityAvailabilityForm.$dirty =true;
			$scope.facilityAvailability.facilityTimes.splice(index, 1);
			$scope.selectedConfigurations.splice(index,1);
		};
		
		$scope.save = function(facilityAvailability){

			if($scope.errors.indexOf("Invalid start time") == -1 && $scope.errors.indexOf("Invalid end time")== -1){
				$scope.savingIndicator = true;
				FacilityAvailabilityService.save(facilityAvailability).then(function(response){
					$scope.savingIndicator = false;
					$scope.errors = response.errors;
					if($scope.errors.length == 0){
						$scope.facilityAvailabilityForm.$setPristine();
						$scope.facilityAvailability = response.data;
						$state.transitionTo("searchFacilityAvailability");
					}
			});
			}

		};
    
		$scope.cancel = function() {
			$scope.actionButton = 'cancel';
			$state.transitionTo("searchFacilityAvailability");
		};
		
  		$scope.formatInstitutionLabel = function(institution){
  			if (!$scope.instChanged) {
  				return $scope.originalFA.institutionIdentifier;
  			}
  			if (institution) {
  				$scope.facilityAvailability.institutionId = institution.id; 
  				return institution.entityId;	
  			}			
  		};
  		
  		$scope.changeInstitutionId = function(institutionId){
  			$scope.facilityAvailability.institutionIdentifier = institutionId;
  		};
  		  		
  		$scope.changeInstitution = function(selectedItem){
  			$scope.instChanged = true;
			if($scope.facilityAvailability.facilityTimes && $scope.facilityAvailability.facilityTimes.length >0) {
	   			if(!confirm('Changing institution identifier will clear all testing slots for the existing school and facility. Are you sure you want to continue?')){
	   				event.preventDefault();
	   				$scope.facilityAvailability.institutionIdentifier = $scope.originalFA.institutionIdentifier;
	   				$scope.facilityAvailability.institutionId = $scope.originalFA.institutionId;
	   				$scope.facilityAvailability.facilityName = $scope.originalFA.facilityName;
	   				$scope.facilityAvailability.facilityId = $scope.originalFA.facilityId;
	   				$scope.instChanged = false;
	   				return false;
	   			}  else {
	   				$scope.facilityAvailability.facilityTimes = [];
	   				$scope.selectedConfigurations=[];
	   	  			$scope.facilityAvailability.institutionIdentifier = selectedItem.institution.entityId;
	   			}	
			} else {
	  			$scope.facilityAvailability.facilityName = "";
	  			$scope.facilityAvailability.facilityId = "";
	  			$scope.facilityAvailability.institutionIdentifier = selectedItem.institution.entityId;
			}

  			$scope.searchFacilities($scope.facilityAvailability.institutionIdentifier);
  		};		
  		
   		$scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){ 
    		if ($scope.facilityAvailabilityForm.$dirty) {
    			if(!confirm("You have unsaved changes. Are you sure you want to leave this page?")){
    				event.preventDefault();
    			}    	
	    	}
  		});
  		
	}


]);

