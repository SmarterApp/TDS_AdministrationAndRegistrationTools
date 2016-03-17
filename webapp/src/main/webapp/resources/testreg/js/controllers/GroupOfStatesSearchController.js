testreg.controller('GroupOfStatesSearchController', ['$scope', '$state','$window', 'GroupOfStatesService', 
     function ($scope, $state, $window, GroupOfStatesService ) {
		if(!$state.current.searchParams) {
			$scope.searchParams = {"entityId":"", "entityName":"", "sortKey":"entityId", "sortDir":"asc", "currentPage": 1};
		}else{
			$scope.searchParams = $state.current.searchParams;
		}
  		$scope.searchResponse = {};
  		
  		$scope.xwalk   = function(label) {
			return $scope.safewalk('GroupOfStates', label);
		};
  		$scope.changeGroupofStatesId = function(selectedItem){
  			$scope.searchParams.entityId = selectedItem.entityId;
		};
  		$scope.changeGroupofStatesName = function(selectedItem){
  			$scope.searchParams.entityName = selectedItem.entityName;
		};		
  		$scope.formatGroupofStatesLabelName = function(district) {
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
  		$scope.formatGroupofStatesLabelId = function(groupOfStates) {
  			if(groupOfStates) {
  	  			return groupOfStates.entityId; 				
  			}else{
  				return $scope.searchParams.entityId;
  			}
  		};     		
  		$scope.createNew = function(){
  			$state.transitionTo("entities.editGroupOfStates",{"groupOfStatesId":""});
  		};
  		
  		$scope.edit = function(groupOfStates) {
  			$state.transitionTo("entities.editGroupOfStates", {groupOfStatesId:groupOfStates.id});
  		};
  		
  		$scope.deleteItem = function(groupOfStatesId) {
  			GroupOfStatesService.deleteGroupOfStates(groupOfStatesId).then(function(response){
				$scope.errors = response.errors;
				if($scope.errors.length == 0){
					$state.current.searchParams = $scope.searchParams;
					for (var i=$scope.searchResponse.searchResults.length; i--; ) {
					   if ($scope.searchResponse.searchResults[i].id === groupOfStatesId) {
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