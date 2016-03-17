testreg.controller('AccessibilitySearchController', ['$scope', '$state','$window','$location','AccessibilityService', 
     function ($scope, $state,$window,$location, AccessibilityService) {
	
	if(!$state.current.searchParams) {
			$scope.searchParams = {"name":"","sortKey":"name", "sortDir":"asc", "currentPage": 1};
		}else{
			$scope.searchParams = $state.current.searchParams;
		}
  		$scope.searchResponse = {};
		
  		$scope.createNew = function(){
  			$state.transitionTo("editAccessibilityEquipment",{"accessibilityEquipmentId":""});
  		};
  		
  		$scope.edit = function(accessibilityEquipment) {
  			$state.transitionTo("editAccessibilityEquipment", {accessibilityEquipmentId:accessibilityEquipment.id});
  		};
	
  		$scope.deleteItem = function(accessibilityEquipmentId) {
  			AccessibilityService.remove(accessibilityEquipmentId).then(function(response){
				$scope.errors = response.errors;
				if($scope.errors.length == 0){
					$state.current.searchParams = $scope.searchParams;
					for (var i=$scope.searchResponse.searchResults.length; i--; ) {
					   if ($scope.searchResponse.searchResults[i].id === accessibilityEquipmentId) {
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