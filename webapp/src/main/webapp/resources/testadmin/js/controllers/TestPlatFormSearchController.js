testadmin.controller('TestPlatFormSearchController', ['$scope', '$state','$window', 'TestPlatFormService',
    function ($scope, $state, $window,TestPlatFormService) {
	$scope.searchResponse = {};
	if(!$state.current.searchParams) {
		$scope.searchParams = {"name":"", "sortKey":"name", "sortDir":"asc", "currentPage": 1};
	}else{
		$scope.searchParams = $state.current.searchParams;
	}
	$scope.createNew = function(){
			$state.transitionTo("edittestplatforms",{"testPlatFormId":""});
		};
		
	$scope.edit = function(testPlatForm) {
		$state.transitionTo("edittestplatforms", {testPlatFormId:testPlatForm.id});
	};
	$scope.deleteItem = function(testPlatFormId) {
		TestPlatFormService.remove(testPlatFormId).then(function(response){
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