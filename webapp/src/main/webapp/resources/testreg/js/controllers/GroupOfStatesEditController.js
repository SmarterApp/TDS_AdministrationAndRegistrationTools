
testreg.controller('GroupOfStatesEditController',['$scope','$state', 'loadedData', 'GroupOfStatesService', 'EntityService', 'inputData',
    function($scope, $state, loadedData, GroupOfStatesService, EntityService, inputData) {
		$scope.savingIndicator = false;
		$scope.errors = loadedData.errors;
		$scope.groupOfStates = loadedData.data;
		$scope.actionButton = '';
		$scope.formAction = 'Add';
		
		if($scope.groupOfStates && $scope.groupOfStates.id){
			$scope.formAction = 'Edit';
			EntityService.getEntity($scope.groupOfStates.parentEntityType, $scope.groupOfStates.parentId).then(function(response){
				$scope.groupOfStates.parentEntityId = response.data.entityId;
			});			
		} else {
			if(inputData) {
				$scope.groupOfStates.entityId = inputData.entityId;
				$scope.groupOfStates.entityName = inputData.entityName;
			}
		}
		$scope.entities = EntityService.loadGroupOfStatesParentEntities();
		
		$scope.xwalk   = function(label) {
			return $scope.safewalk('GroupOfStates', label);
		};
		
		$scope.resetParent = function() {
			$scope.groupOfStates.parentEntityId = '';
		};
		
		$scope.save = function(groupOfStates){
			$scope.savingIndicator = true;
			GroupOfStatesService.saveGroupOfStates(groupOfStates).then(function(response){
				$scope.savingIndicator = false;
				$scope.errors = response.errors;
				if($scope.errors.length == 0){
					$scope.groupOfStatesForm.$setPristine();
					$scope.groupOfStates = response.data;
					$state.transitionTo("entities.searchGroupOfStates");
				}
			});
		};
    
		$scope.cancel = function() {
			$scope.actionButton = 'cancel';
			$state.transitionTo("entities.searchGroupOfStates");
		};
		
  		$scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){ 
    		if ($scope.groupOfStatesForm.$dirty) {
    			if(!confirm("You have unsaved changes. Are you sure you want to leave this page?")){
    				event.preventDefault();
    			}    	
	    	}
  		});
	}
]);

