testreg.controller('FacilitySearchController', ['$scope', '$state','$window', 'FacilityService', 'StateService', 
    function ($scope, $state,$window, FacilityService, StateService) {

	$scope.domain = "facility";
	$scope.states=[];
	
	if(!$state.current.searchParams) {
			$scope.searchParams = {"facilityName":"", "institutionIdentifier":"", "stateAbbreviation":"", "locaiton":"","sortKey":"facilityName", "sortDir":"asc", "currentPage": 1};
		}else{
			$scope.searchParams = $state.current.searchParams;
		}
  		$scope.searchResponse = {};

  		$scope.formatInstitutionLabel = function(institution){
  			if (institution) {
  				return institution.entityId;	
  			} 			
  		};
  		
    	StateService.loadStates().then(function(loadedData) {
    		$scope.states = loadedData.data;
    	});
    	
  		$scope.changeInstitutionId = function(institutionId){
  			$scope.searchParams.institutionIdentifier = institutionId;
  		};
  		  
  		$scope.changeInstitution = function(selectedItem){
  			$scope.searchParams.institutionIdentifier = selectedItem.institution.entityId;
  		};
  		
  		$scope.xwalk   = function(label) {
			return $scope.safewalk('Institution', label);
		};
		
  		$scope.createNew = function(){
  			$state.transitionTo("editFacility",{"facilityId":""});
  		};
  		
  		$scope.edit = function(facility) {
  			$state.transitionTo("editFacility", {facilityId:facility.id});
  		};
	
  		$scope.deleteItem = function(facilityId) {
  			FacilityService.remove(facilityId).then(function(response){
				$scope.errors = response.errors;
				if($scope.errors.length == 0){
					$state.current.searchParams = '';
					$window.location.reload();
				}
			});
  		};
  		
  		$scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){ 
            $state.current.searchParams = $scope.searchParams;
  		});
     }
]);