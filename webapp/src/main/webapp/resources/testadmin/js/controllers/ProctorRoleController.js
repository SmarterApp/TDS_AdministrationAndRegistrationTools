testadmin.controller('ProctorRoleController',['$scope','$state','$window','loadedData','ProctorRoleService', 
		function($scope, $state, $window, loadedData, ProctorRoleService ) {
			$scope.savingIndicator = false;
		    $scope.proctorRole = loadedData.data;
		    $scope.errors = loadedData.errors;
			$scope.actionButton = '';
			$scope.formAction = 'Add';
			$scope.allAssessmentTypes =[];
			$scope.hierarchyLevelsByTenant = [];
			$scope.entities = [];

			//Load Role Levels for selected role
			$scope.getEntities = function(roleName, index) {
				ProctorRoleService.getEntities($scope.roles, roleName, function(entities){
					$scope.entities = entities;
				});
			};
			
			$scope.getRoleNameIndex = function(roleName) {
				var indexFound = -1;
				angular.forEach($scope.roles, function(role, index){
					if(role.role == roleName){
						indexFound = index;
					}
				});
				return indexFound;
			};
			
			$scope.spliceRoles = function(proctorRoles) {
				angular.forEach(proctorRoles.data.searchResults, function(proctorRole) {
					var index = $scope.getRoleNameIndex(proctorRole.name);
					if(index > -1) {
						$scope.roles.splice(index, 1); //Remove the roles that already has proctor association
					};
				});
			};

			//Load All Roles from Permissions
			$scope.roles=[];
			ProctorRoleService.loadUserRoles().then(function(userRoles){
				$scope.roles = userRoles.data;
				
				if($scope.proctorRole && ! $scope.proctorRole.id) {
					ProctorRoleService.getAll($scope.roles.length).then(function(proctorRoles){
						$scope.spliceRoles(proctorRoles);
					});
				}
				
				//Initialize Entities. Note: See the dependence to $scope.roles. Thats why it is called here
				$scope.getEntities($scope.proctorRole.name, 0);
			});
			

			if($scope.proctorRole && $scope.proctorRole.id){
				$scope.formAction = 'Edit';					
			} 
			
			//Load Assessment Types
			ProctorRoleService.getAssessmentTypes().then(function(response){
				$scope.allAssessmentTypes = response.data;
			});
						
									
			$scope.cancel = function() {
				$scope.actionButton = 'cancel';
				$state.transitionTo("searchProctorRoles");
			};
		
			$scope.save = function(proctorRole) {
				$scope.savingIndicator = true;
				ProctorRoleService.save(proctorRole).then(
					function(response) {
						$scope.savingIndicator = false;
						$scope.errors = response.errors;
						if ($scope.errors.length == 0) {
							$scope.proctorRoleForm.$setPristine();
							$scope.proctorRole = response.data;
							$state.transitionTo("searchProctorRoles");
						}
					});
			};
			
			$scope.assessmentTypeSelector = {
	   	   			'placeholder': "Select...",
	   	   			'allowClear': true,
	   	   			'multiple': true,
	   	   	        'simple_tags': true,
	   	   	        'width' :'resolve',
	   	  	        'query': function (query) {
	   	  	        	var data = { results: $.map($scope.allAssessmentTypes, function(type) { return { "id":type, "text":type }; }) };
	   	  	        	query.callback(data);
	   	  	        },
	   	  	        'id': function(select2Object) {  
	   	  	            return select2Object.id; 
	   	  	        },
	                'setPristine': true
	   	   	};
			
			$scope.hierarchyLevelSelector = {
	   	   			'placeholder': "",
	   	   			'allowClear': true,
	   	   			'multiple': true,
	   	   	        'simple_tags': true,
	   	   	        'width' :'resolve',
	   	  	        'query': function (query) {
	   	  	        	var data = { results: $.map($scope.entities, function(type) { return { "id":type, "text":type }; }) };
	   	  	        	query.callback(data);
	   	  	        },
	   	  	        'id': function(select2Object) {  
	   	  	            return select2Object.id; 
	   	  	        },
	                'setPristine': true
	   	   	};
		
			$scope.$on('$stateChangeStart',
			function(event, toState, toParams, fromState, fromParams) {
				if ($scope.proctorRoleForm.$dirty && $scope.actionButton != 'cancel') {
					if (!confirm("You have unsaved changes. Are you sure you want to leave this page?")) {
						event.preventDefault();
					}
				}
			});
} ]);
