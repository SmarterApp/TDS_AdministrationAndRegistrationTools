testreg.controller('GroupOfDistrictsSearchController', ['$scope', '$state','$window', 'GroupOfDistrictsService', 'StateService','EntityNameService','$rootScope','EntityService',
     function ($scope, $state,$window, GroupOfDistrictsService, StateService,EntityNameService,$rootScope,EntityService) {
		if(!$state.current.searchParams) {
			$scope.searchParams = {"entityId":"", "entityName":"", "stateAbbreviation":"", "sortKey":"entityId", "sortDir":"asc", "currentPage": 1};
		}else{
			$scope.searchParams = $state.current.searchParams;
		}
  		$scope.searchResponse = {};
		
  		$scope.xwalk   = function(label) {
			return $scope.safewalk('GroupOfDistricts', label);
		};
  		$scope.changeGroupofDistrictsId = function(selectedItem){
  			$scope.searchParams.entityId = selectedItem.entityId;
		};
  		$scope.changeGroupofDistrictsName = function(selectedItem){
  			$scope.searchParams.entityName = selectedItem.entityName;
		};	

  		$scope.formatGroupofDistrictsLabelName = function(groupOfDistricts) {
  			if(groupOfDistricts) {
  	  			return groupOfDistricts.entityName; 				
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
  		$scope.formatGroupofDistrictsLabelId = function(groupOfDistricts) {
  			if(groupOfDistricts) {
  	  			return groupOfDistricts.entityId; 				
  			}else{
  				return $scope.searchParams.entityId ;
  			}
  		};  		
  		StateService.loadStates().then(function(loadedData) {
  			$scope.states = loadedData.data;
  		});
  		
  		$scope.createNew = function(){
  			$state.transitionTo("entities.editGroupOfDistricts",{"groupOfDistrictsId":""});
  		};
  		
  		$scope.edit = function(groupOfDistricts) {
  			$state.transitionTo("entities.editGroupOfDistricts", {groupOfDistrictsId:groupOfDistricts.id});
  		};	
	
  		$scope.deleteItem = function(groupOfDistrictsId) {
  			GroupOfDistrictsService.deleteGroupOfDistricts(groupOfDistrictsId).then(function(response){
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