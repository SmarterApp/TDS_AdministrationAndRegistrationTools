testreg.controller('DistrictSearchController', ['$scope', '$state','$window', 'DistrictService', 'StateService','EntityService','filterFilter',
     function ($scope, $state,$window, DistrictService, StateService,EntityService,filterFilter ) {

	if(!$state.current.searchParams) {
			$scope.searchParams = {"entityId":"", "entityName":"", "stateAbbreviation":"","sortKey":"entityId", "sortDir":"asc", "currentPage": 1};
		}else{
			$scope.searchParams = $state.current.searchParams;
		}
  		$scope.searchResponse = {};
  		
  		StateService.loadAllStates().then(function(loadedData) {
  			$scope.states = loadedData.data;
  		});

  		$scope.changeDistrictId = function(selectedItem){
  			$scope.searchParams.entityId = selectedItem.entityId;
		};
  		$scope.changeDistrictName = function(selectedItem){
  			$scope.searchParams.entityName = selectedItem.entityName;
		};		
  		$scope.formatDistrictLabelName = function(district) {
  			if(district) {
  	  			return district.entityName; 				
  			}else{
  				return $scope.searchParams.entityName;
  			}
  		};  
		$scope.changeEntityId = function(entityId){
  			$scope.searchParams.entityId = entityId;
  		}; 
		$scope.changeEntityName = function(entityName){
  			$scope.searchParams.entityName = entityName;
  		};    		
  		$scope.formatDistrictLabelId = function(district) {
  			if(district) {
  	  			return district.entityId; 				
  			}else{
  				return $scope.searchParams.entityId;
  			}
  		};  	  		
  		$scope.xwalk   = function(label) {
			return $scope.safewalk('District', label);
		};
		
  		$scope.createNew = function(){
  			$state.transitionTo("entities.editDistrict",{"districtId":""});
  		};
  		
  		$scope.edit = function(district) {
  			$state.transitionTo("entities.editDistrict", {districtId:district.id});
  		};
	
  		$scope.deleteItem = function(districtId) {
  			DistrictService.deleteDistrict(districtId).then(function(response){
				$scope.errors = response.errors;
				if($scope.errors.length == 0){
					$state.current.searchParams = $scope.searchParams;
					for (var i=$scope.searchResponse.searchResults.length; i--; ) {
					   if ($scope.searchResponse.searchResults[i].id === districtId) {
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