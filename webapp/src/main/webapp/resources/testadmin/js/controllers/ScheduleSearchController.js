testreg.controller('ScheduleSearchController', ['$scope', '$state','$window', '$timeout', 'ScheduleService', 'AssessmentService', 'StateService',
    function ($scope, $state,$window, $timeout, ScheduleService, AssessmentService, StateService) {

	$scope.domain = "schedule";
	$scope.states=[];
	$scope.assessments=[];
	
	StateService.loadStates().then(function(loadedData) {
		$scope.states = loadedData.data;
	});
	
	if(!$state.current.searchParams) {
			$scope.searchParams = {"scheduleName":"", "institutionIdentifier":"", "sortKey":"scheduleName", "sortDir":"asc", "currentPage": 1};
		}else{
			$scope.searchParams = $state.current.searchParams;
		}
  		$scope.searchResponse = {};

  		$scope.formatDate = function(date) {
  			return ScheduleService.getFormattedDate(date);
  		};
		AssessmentService.findAllImportedAssessments().then(function(response){
			$scope.assessments = response.data;
		});
  		$scope.getRule = function(rule) {
  			if(rule === "STRICT") {
  				return "Yes";
  			} else if (rule === "NONSTRICT"){
  				return "No";
  			} 
  			return "";
  			
  		};
  		$scope.getValue = function(affinity) {
  			if(affinity) {
	  			var value = affinity.value;
	  			if(affinity.type === "ASSESSMENT") {
	  				for(var i=0; i < $scope.assessments.length; i++) {
	  	  				if($scope.assessments[i].id === affinity.value) { 					
	  	  					value = $scope.assessments[i].testName;
	  	  					break;
	  	  				}					
	  				}
	  			} 
	  			return value;
  			}else{
  				return "";
  			}
  		};
  		$scope.formatInstitutionLabel = function(institution){
  			if (institution) {
  				return institution.entityId;	
  			} 			
  		};
  		
  		$scope.changeInstitutionId = function(institutionId){
  			$scope.searchParams.institutionIdentifier = institutionId;
  		};
  		  
  		$scope.changeInstitution = function(selectedItem){
  			$scope.searchParams.institutionIdentifier = selectedItem.institution.entityId;
  			$scope.searchParams.institutionId = selectedItem.institution.id;
  		};
  		
  		$scope.xwalk   = function(label) {
			return $scope.safewalk('Institution', label);
		};
		
  		$scope.createNew = function(){
  			$state.transitionTo("editSchedule",{"scheduleId":""});
  		};
  		
  		$scope.edit = function(schedule) {
  			$state.transitionTo("editSchedule", {scheduleId:schedule.id});
  		};
	
  		$scope.viewSummary = function(schedule) {
  			$state.transitionTo("viewSchedule", {scheduleId:schedule.id});
  		};
  		
  		$scope.deleteItem = function(scheduleId) {
  			ScheduleService.remove(scheduleId).then(function(response){
				$scope.errors = response.errors;
				if($scope.errors.length == 0){
					$state.current.searchParams = $scope.searchParams;
					for (var i=$scope.searchResponse.searchResults.length; i--; ) {
					   if ($scope.searchResponse.searchResults[i].id === scheduleId) {
						   $scope.searchResponse.searchResults.splice(i, 1);
						   return;
					   }
					}
				}
			});
  		};
  		
  		$scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){ 
            $state.current.searchParams = $scope.searchParams;
  		});
     }
]);