testreg.controller('ProctorRoleSearchController', ['$scope', '$state','$window', 'ProctorRoleService', 
     function ($scope, $state,$window, ProctorRoleService) {
	
	if(!$state.current.searchParams) {
			$scope.searchParams = {"name":"","sortKey":"name", "sortDir":"asc", "currentPage": 1};
		}else{
			$scope.searchParams = $state.current.searchParams;
		}
  		$scope.searchResponse = {};
		
		$scope.searchProctorRoles = function (params){
			$scope.errors = [];
			params.pageSize = "1000000";
			return ProctorRoleService.searchProctorRoles(params);	
		};
		
  		$scope.createNew = function(){
  			$state.transitionTo("editProctorRole",{"proctorRoleId":""});
  		};
  		
  		$scope.edit = function(proctorRole) {
  			$state.transitionTo("editProctorRole", {proctorRoleId:proctorRole.id});
  		};
	
  		$scope.deleteItem = function(proctotRoleId) {
  			ProctorRoleService.remove(proctotRoleId).then(function(response){
				$scope.errors = response.errors;
				if($scope.errors.length == 0){
					$state.current.searchParams = $scope.searchParams;
					for (var i=$scope.searchResponse.searchResults.length; i--; ) {
					   if ($scope.searchResponse.searchResults[i].id === proctotRoleId) {
						   $scope.searchResponse.searchResults.splice(i, 1);
						   return;
					   }
					}
				}
			});
  		};
  		
  		$scope.hierarchyLevelFormatter = function(levels) {
  			var formattedLevels = '';
  			angular.forEach(levels, function(level) {
  				formattedLevels = formattedLevels + level + "\n";
  			});
  			return formattedLevels;
  		};
  		
  		$scope.assessmentFormatter = function(assessments) {
  			var formattedTypes = '';
  			angular.forEach(assessments, function(assessment) {
  				formattedTypes = formattedTypes + assessment.testName + "\n";
  			});
  			return formattedTypes;
  		};
  		
  		//Load All Roles from Permissions
  		$scope.roles = [];
		ProctorRoleService.loadUserRoles().then(function(response){
			$scope.roles = response.data;
		});
		
  		//Load Role Levels for selected role
		$scope.getEntities = function(roleName, index) {
			var formattedTypes = '';
			ProctorRoleService.getEntities($scope.roles, roleName, function(entities){
				formattedTypes = '';
				angular.forEach(entities, function(entity) {
	  				formattedTypes = formattedTypes + entity + "\n";
	  			});
			});
			return formattedTypes;
		};
  		
  		$scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){ 
            $state.current.searchParams = $scope.searchParams;
  		});
     }
]);