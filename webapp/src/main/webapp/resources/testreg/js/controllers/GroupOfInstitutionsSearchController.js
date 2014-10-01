testreg.controller('GroupOfInstitutionsSearchController', ['$scope', '$state','$window', 'GroupOfInstitutionsService','StateService', 'EntityService',
    function ($scope, $state,$window, GroupOfInstitutionsService, StateService, EntityService ) {

	if(!$state.current.searchParams) {

		$scope.searchParams = {"entityId":"", "entityName":"", "stateAbbreviation":"", "sortKey":"entityId", "sortDir":"asc", "currentPage": 1};
	}else{

		$scope.searchParams = $state.current.searchParams;
	}

		$scope.searchResponse = {};
		StateService.loadStates().then(function(loadedData) {
			$scope.states = loadedData.data;
		});
		
		$scope.xwalk   = function(label) {
			return $scope.safewalk('GroupOfInstitutions', label);
		};
		$scope.changeGroupOfInstitutionsId = function(selectedItem){
  			$scope.searchParams.entityId = selectedItem.entityId;
		};
  		$scope.changeGroupOfInstitutionsName = function(selectedItem){
  			$scope.searchParams.entityName = selectedItem.entityName;
		};		
  		$scope.formatGroupOfInstitutionsLabelName = function(groupOfInstitutions) {
  			if(groupOfInstitutions) {
  	  			return groupOfInstitutions.entityName; 				
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
  		$scope.formatGroupOfInstitutionsLabelId = function(groupOfInstitutions) {
  			if(groupOfInstitutions) {
  	  			return groupOfInstitutions.entityId; 				
  			}else{
  				return $scope.searchParams.entityId ;
  			}
  		};  	
	$scope.addGroupOfInstitutions = function(){
		
		$state.transitionTo("entities.editGroupOfInstitutions",{"groupofInstitutionsId":""});
	};
	$scope.edit = function(groupofInstitutions) {
		$state.transitionTo("entities.editGroupOfInstitutions", {groupofInstitutionsId:groupofInstitutions.id});
	};
	$scope.deleteItem = function(groupofInstitutionsId) {
		GroupOfInstitutionsService.deleteGroupOfInstitutions(groupofInstitutionsId).then(function(response){
			$scope.errors = response.errors;
			if($scope.errors.length == 0){
				window.location.reload();
			}
		});
	};

	$scope.$on('$stateChangeStart', function(event, toGroupofInstitutions, toParams, fromGroupofInstitutions, fromParams){ 
    $state.current.searchParams = $scope.searchParams;
	});
 }
]);