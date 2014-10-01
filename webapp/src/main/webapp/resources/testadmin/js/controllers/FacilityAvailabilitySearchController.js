testreg.controller('FacilityAvailabilitySearchController', ['$scope', '$state','$window', 'FacilityAvailabilityService', 
     function ($scope, $state,$window, FacilityAvailabilityService) {

	$scope.domain = "facilityAvailability";
	
	if(!$state.current.searchParams) {
			$scope.searchParams = {"facilityName":"", "institutionIdentifier":"", "sortKey":"facilityName", "sortDir":"asc", "currentPage": 1};
		}else{
			$scope.searchParams = $state.current.searchParams;
		}
  		$scope.searchResponse = {};

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
  		};

  		$scope.createNew = function(){
  			$state.transitionTo("editFacilityAvailability",{"facilityAvailabilityId":""});
  		};
  		
  		$scope.edit = function(facilityAvailability) {
  			$state.transitionTo("editFacilityAvailability", {facilityAvailabilityId:facilityAvailability.id});
  		};
  		
  		$scope.xwalk   = function(label) {
			return $scope.safewalk('Institution', label);
		};
	
  		$scope.deleteItem = function(facilityAvailabilityId) {
  			FacilityAvailabilityService.remove(facilityAvailabilityId).then(function(response){
				$scope.errors = response.errors;
				if($scope.errors.length == 0){
					$state.current.searchParams = '';
					$window.location.reload();
				}
			});
  		};
  		
  		$scope.formatDate = function (date) {
  			if (date) {
  				return date.split("T")[0];
  			} else {
  				return date;
  			}
  		};
  		
  		$scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){ 
            $state.current.searchParams = $scope.searchParams;
  		});
     }
]);