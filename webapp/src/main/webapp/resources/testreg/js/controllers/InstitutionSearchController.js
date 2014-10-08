testreg.controller('InstitutionSearchController', ['$scope', '$state','$window', '$location', 'InstitutionService','StateService', 'EntityService',
    function ($scope, $state,$window, $location, InstitutionService, StateService, EntityService ) {

	if(!$state.current.searchParams) {

		$scope.searchParams = {"entityId":"", "stateAbbreviation":"", "sortKey":"entityId", "sortDir":"asc", "currentPage": 1};
	}else{

		$scope.searchParams = $state.current.searchParams;
	}

		$scope.searchResponse = {};
		StateService.loadStates().then(function(loadedData) {
			$scope.states = loadedData.data;
		});

		$scope.changeInstitutionsId = function(selectedItem){
  			$scope.searchParams.entityId = selectedItem.entityId;
		};
  		$scope.changeInstitutionsName = function(selectedItem){
  			$scope.searchParams.entityName = selectedItem.entityName;
		};		
  		$scope.formatInstitutionsLabelName = function(institutions) {
  			if(institutions) {
  	  			return institutions.entityName; 				
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
  		$scope.formatInstitutionsLabelId = function(institutions) {
  			if(institutions) {
  	  			return institutions.entityId; 				
  			}else{
  				return $scope.searchParams.entityId ;
  			}
  		};	
	$scope.xwalk   = function(label) {
		return $scope.safewalk('Institution', label);
	};
	
	$scope.addInstitution = function(){
		
		$state.transitionTo("entities.editInstitution",{"institutionId":""});
	};
	$scope.edit = function(institution) {
		$state.transitionTo("entities.editInstitution", {institutionId:institution.id});
	};
	$scope.deleteItem = function(institutionId) {
		InstitutionService.deleteInstitution(institutionId).then(function(response){
			$scope.errors = response.errors;
			if($scope.errors.length == 0){
				$state.current.searchParams = '';
				window.location.reload();
			}
		});
	};

	$scope.$on('$stateChangeStart', function(event, toinstitution, toParams, frominstitution, fromParams){ 
    $state.current.searchParams = $scope.searchParams;
	});
 }
]);