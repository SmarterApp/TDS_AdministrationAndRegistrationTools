testreg.controller('StateSearchController', ['$scope', '$state',  '$window','StateService','CurrentUserService','filterFilter',
    function ($scope, $state,$window, StateService, CurrentUserService, filterFilter) {

	StateService.loadStates().then(function(loadedData) {
		$scope.states = loadedData.data;	
	});
	
	if(!$state.current.searchParams) {
		$scope.searchParams = {"entityId":"", "entityName":"", "sortKey":"entityId", "sortDir":"asc", "currentPage": 1};
	}else{
		$scope.searchParams = $state.current.searchParams;
	}
	
	$scope.searchResponse = {};
	
	$scope.selectState = function(id) {
		$scope.searchParams.entityName = StateService.getStateName(id,$scope.states);
	};
	$scope.xwalk   = function(label) {
		return $scope.safewalk('State', label);
	};
	$scope.createNewState = function(){
		
		$state.transitionTo("entities.editState",{"stateId":"", "entityId":$scope.searchParams.entityId,"entityName":$scope.searchParams.entityName});
	};
	$scope.edit = function(state) {

		$state.transitionTo("entities.editState", {stateId:state.id});
	};
	$scope.deleteItem = function(stateId) {
		
		StateService.deleteState(stateId).then(function(response){
			$scope.errors = response.errors;
			if($scope.errors.length == 0){
				$state.current.searchParams = $scope.searchParams;
				for (var i=$scope.searchResponse.searchResults.length; i--; ) {
				   if ($scope.searchResponse.searchResults[i].id === stateId) {
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