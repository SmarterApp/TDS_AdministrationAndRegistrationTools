testreg.controller('UserSearchController', ['$scope', '$state','$window', 'UserService','StateService', 'EntityService',
    function ($scope, $state,$window, UserService, StateService, EntityService ) {
	 $scope.activeLink = $state.$current.self.name;
	 
	 $scope.isActiveLink = function(link){
		return  $scope.activeLink.indexOf(link) == 0; 
	 };
	if(!$state.current.searchParams) {

		$scope.searchParams = {"firstName":"","lastName":"","email":"", "roleAssociations.stateAbbreviation":"", "sortKey":"email", "sortDir":"asc", "currentPage": 1};
	}else{

		$scope.searchParams = $state.current.searchParams;
	}

	$scope.searchResponse = {};

	$scope.getStateAbbreviation = function (roleAssociation) {
        if(!roleAssociation) {return ""}
		if (roleAssociation.level == 'STATE') {
			return roleAssociation.associatedEntityId;
		} else {
			return roleAssociation.stateAbbreviation;
		}
	};
	
	StateService.loadStates().then(function(loadedData) {
		$scope.states = loadedData.data;
	});
	$scope.xwalk   = function(label) {
		return $scope.safewalk('User', label);
	};
	UserService.loadRoles().then(function(response){
		$scope.roles = response.data;
	});
	$scope.addUser = function(){
		$state.transitionTo("editUser",{"userId":""});
	};
	$scope.edit = function(User) {
		$state.transitionTo("editUser", {userId:User.id});
	};
	$scope.editProctor = function(User) {
		$state.transitionTo("editProctor", {userId:User.id});
	};
	$scope.changeUserFirstName = function(selectedItem){
		$scope.searchParams.firstName = selectedItem.firstName;
	};
	$scope.changeFirstName = function(firstName){
		$scope.searchParams.firstName = firstName;
	};  		
	$scope.formatUserFirstName = function(user) {
		if(user) {
  			return user.firstName; 				
		}else{
			return $scope.searchParams.firstName;
		}
	};  
	
	$scope.changeUserLastName = function(selectedItem){
		$scope.searchParams.lastName = selectedItem.lastName;
	};
	$scope.changeLastName = function(lastName){
		$scope.searchParams.lastName = lastName;
	};  		
	$scope.formatUserLastName = function(user) {
		if(user) {
  			return user.lastName; 				
		}else{
			return $scope.searchParams.lastName;
		}
	}; 	
	$scope.changeUserEmail = function(selectedItem){
		$scope.searchParams.email = selectedItem.email;
	};
	$scope.changeEmail = function(email){
		$scope.searchParams.email = email;
	};  		
	$scope.formatUserEmail = function(user) {
		if(user) {
  			return user.email; 				
		}else{
			return $scope.searchParams.email;
		}
	}; 
	
	//Proctor
	$scope.proctorRoles = [];
	UserService.loadProctorRoles().then(function(loadedData) {
		if(loadedData.data.searchResults) {
    		angular.forEach(loadedData.data.searchResults, function(proctorRole) {
    			$scope.proctorRoles.push(proctorRole.name);
    		});
    	};
	});
	
	$scope.isUserAProctor = function(roleAssociations) {
		var flag = false;
		angular.forEach(roleAssociations, function(roleAssociation) {
			if($scope.proctorRoles.indexOf(roleAssociation.role) >= 0) {
				flag = true;				
			}
		});
		return flag;
	};
	
	$scope.deleteItem = function(userId) {
		UserService.deleteUser(userId).then(function(response){
			$scope.errors = response.errors;
			if($scope.errors.length == 0){
				window.location.reload();
			}
		});
	};

	$scope.$on('$stateChangeStart', function(event, toUser, toParams, fromUser, fromParams){ 
    $state.current.searchParams = $scope.searchParams;
	});
 }
]);