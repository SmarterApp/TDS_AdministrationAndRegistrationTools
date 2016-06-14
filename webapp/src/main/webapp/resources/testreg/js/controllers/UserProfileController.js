testreg.controller(	'UserProfileController',['$scope','$location','$state','$timeout','loadedData','UserService','StateService', 'EntityService','TenantUserService', 'roles','prevActiveLink', 
    function($scope, $location, $state, $timeout, loadedData, UserService, StateService, EntityService, TenantUserService, roles,prevActiveLink) {
	 $scope.activeLink = prevActiveLink;
	 $state.$current.self.name = prevActiveLink;
	 $scope.isActiveLink = function(link){
		return  $scope.activeLink.indexOf(link) == 0; 
	 };
	 $scope.errors = loadedData.errors;
	 $scope.savingIndicator = false;
	 $scope.user = loadedData.data;
	 $scope.roles = roles.data;

	 $scope.entities = [];
	 $scope.selectedParentId = [];
	 $scope.selectedParentDBId= [];
	 $scope.actionButton = '';
	 $scope.formAction = 'Add';
	 $scope.entityStateAbbreviation=[];
	 $scope.currentUser = [];
	 $scope.showSavingMessage = false;
	 
	 TenantUserService.getCurrentUser().then(function (response){
		 if(response.errors.length == 0){
			 $scope.currentUser = response.data;
		 }
	});
	 
	 $scope.cancel = function(formIndicator) {
		 if($scope.isUserHasOnlyEditProfile()){
			 if (confirm("Are you sure you want to cancel changes?")) {
				 window.location.reload();
			 }
		 }else{
			 if(!formIndicator){
				 $scope.actionButton = 'cancel';
				 $state.transitionTo("root");
			 }else{
				 if (confirm("You have unsaved changes. Are you sure you want to leave this page?")) {
					 $scope.actionButton = 'cancel';
					 $state.transitionTo("root");
				 }
			 }
		 }
	 };
	 
	 $scope.displayCancel = function(formIndicator) {
		 if($scope.isUserHasOnlyEditProfile()){
			 return formIndicator;
		 }else
			 return true;
	 };
	 
	  $scope.isUserHasOnlyEditProfile = function() {
		 var hasPermission = false;
		 if(angular.isDefined($scope.currentUser) && angular.isDefined($scope.currentUser.authorities) && $scope.currentUser.authorities.length == 1){
			 if($scope.currentUser.authorities[0].name=="Edit Profile"){
				 hasPermission = true;
			 } 
		 }
		 return hasPermission;
	 };
	 
	 $scope.messageDisplay = function (){
		if($scope.isUserHasOnlyEditProfile() && $scope.showSavingMessage){
			return true;
		}else
			return false;
	 };
	 
	 StateService.loadStates().then(function(loadedData) {
		$scope.states = loadedData.data;
	 });

	 $scope.getAssociatedEntity = function(index,entities){
		return entities[index].entityId;
	 };
	 
	 $scope.xwalk   = function(label) {
		return $scope.safewalk('User', label);
	 };

	 if ($scope.user) {
		$scope.formAction = 'Edit';		
		//initialize roles, levels and associated entity ids
		for (var j=0; j < $scope.user.roleAssociations.length; j++) {
			if($scope.roles) {
				for (var i=0; i < $scope.roles.length; i++) {
					if ($scope.roles[i].role == $scope.user.roleAssociations[j].role) {
						$scope.entities[j] = $scope.roles[i].allowableEntities;
					}
				}
			}
		}		
	 }
	 
	 $scope.resetAssociatedEntities = function(currentRole, index) {	
		var $select2 = $('#associatedEntityDiv'+index);
		$select2.select2('data',null);
		currentRole.associatedEntityId ='';
		currentRole.associatedEntityMongoId='';
		currentRole.stateAbbreviation ='';
	 };
	 
	 $scope.getParentEntities = function(term, page, pageSize, entityType) {	
		return EntityService.loadParentEntitiesBySearch(term,--page,pageSize, entityType);
	 };
	 
	 $scope.getEntities = function(roleName, index) {
		if(!$scope.entities) {
			$scope.entities = [];
		}
		$scope.user.roleAssociations[index].level = "";
		$scope.user.roleAssociations[index].associatedEntityId = "";
		for (var i=0; i < $scope.roles.length; i++) {
			if ($scope.roles[i].role == roleName) {
				$scope.entities[index] = $scope.roles[i].allowableEntities;
			}
		}
	 };

	 $scope.getEntityIdwithName = function(user, index){
		if(user.roleAssociations != null){
			if(user.roleAssociations[index].level == 'CLIENT' || user.roleAssociations[index].level == 'STATE'){
				return user.roleAssociations[index].associatedEntityId +' - '+ user.roleAssociations[index].associatedEntityName;
			}else {
				return user.roleAssociations[index].associatedEntityId +' - '+ user.roleAssociations[index].associatedEntityName + ' ('+user.roleAssociations[index].stateAbbreviation+')';
			}
		}
	 };
	 
	 $scope.removeRoleAssociation = function (index) {
		if($scope.user.roleAssociations.length > 1){
			var confirmation = prompt("WARNING: If you delete this role, you may need to contact your coordinator to restore it. To confirm, please type DELETE here:");
			if(confirmation =='DELETE'){
				$scope.user.roleAssociations.splice(index,1);
				$scope.entities.splice(index,1);
				$scope.userForm.$dirty=true;
			}else if(confirmation != null){
				alert("Not confirmed, no changes made. You must type DELETE to remove the role.");
			} 
		}else{
			var confirmation = prompt("WARNING: If you delete this role, your account will be permanently deleted from ART. To confirm, please type DELETE here:");
			if(confirmation =='DELETE'){
				$scope.user.roleAssociations.splice(index,1);
				$scope.entities.splice(index,1);
				if($scope.user.roleAssociations.length == 0 && angular.isDefined($scope.user.id)) {
					UserService.deleteUser($scope.user.id).then(
							function(response) {
								if(response.errors.length == 0){
									$scope.userForm.$setPristine();
									$scope.logout();
								}
							});
				}
				$scope.userForm.$dirty=true;
			} else if(confirmation != null){
				alert("Not confirmed, no changes made. You must type DELETE to remove the role.");
			}
		}
	 };
	 
	 $scope.logout = function (){
			window.location.href = "saml/logout";
	 };

	 $scope.save = function(User) {
		$scope.errors = [];
		$scope.savingIndicator = true;
		if(User.roleAssociations === undefined || User.roleAssociations.length === 0){
			$scope.errors.push("At least one role is required");
			$scope.savingIndicator = false;
			$scope.showSavingMessage = false;
		}
		if ($scope.errors.length == 0) {
			UserService.saveUser(User).then(
					function(response) {
						$scope.savingIndicator = false;
						$scope.errors = response.errors;
						if ($scope.errors.length == 0) {
							$scope.userForm.$setPristine();
							$scope.user = response.data;
							if($scope.isUserHasOnlyEditProfile()){
								$scope.showSavingMessage = true;
							}else{
								$state.transitionTo("root");
							}
						}
					});
		} else {
			$scope.savingIndicator = false;
			$scope.showSavingMessage = false;
		}								
	 };

	 $scope.resetPassword = function () {
		UserService.resetPasswordUser($scope.user.id).then(
				function() {
					confirm("Are you sure that you want to reset your password?");
				});
	 };

	 $scope.$on('$stateChangeStart',
			function(event, toState, toParams,
					fromState, fromParams) {
		if ($scope.userForm.$dirty
				&& $scope.actionButton != 'cancel') {
			if (!confirm("You have unsaved changes. Are you sure you want to leave this page?")) {
				event.preventDefault();
			}
		}
	 });
   } 
]);

