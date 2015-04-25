testreg.controller(	'UserController',['$scope','$state','$timeout','loadedData','UserService','StateService', 'EntityService','inputData', 'roles','prevActiveLink',
						function($scope, $state, $timeout, loadedData, UserService, StateService, EntityService, inputData, roles,prevActiveLink) {
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
							$scope.cancel = function() {
					            $state.transitionTo("searchUser");
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

							if ($scope.user && $scope.user.id) {
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
							}else{
								if(inputData) {
									$scope.user.entityId = inputData.entityId;
									$scope.user.stateAbbreviation = inputData.stateAbbreviation;
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
							$scope.removeRoleAssociation = function (index) {
								$scope.user.roleAssociations.splice(index,1);
								$scope.entities.splice(index,1);
								$scope.userForm.$dirty=true;
							};			
							
							$scope.addRoleAssociation = function(){
								if(!$scope.user.roleAssociations) {
									$scope.user.roleAssociations=[];
								} 
								$scope.user.roleAssociations.push({"role":"","level":null,"associatedEntityId":"","stateAbbreviation":"",});
								$scope.userForm.$dirty=true;						
							};

							$scope.save = function(User) {
								$scope.errors = [];
								$scope.savingIndicator = true;
								if(User.roleAssociations === undefined || User.roleAssociations.length === 0){
									$scope.errors.push("At least one role is required");
									$scope.savingIndicator = false;
								}
								if ($scope.errors.length == 0) {
									UserService.saveUser(User).then(
										function(response) {
											$scope.savingIndicator = false;
											$scope.errors = response.errors;
											if ($scope.errors.length == 0) {
												$scope.userForm
														.$setPristine();
												$scope.user = response.data;
												$state.transitionTo("searchUser");
											}
									});
								} else {
									$scope.savingIndicator = false;
								}								
							};

                            $scope.sync = function () {
                                UserService.syncUser($scope.user.id).then(
                                    function() {
                                        confirm("A request to SYNC the user is in progress!")
                                    });
                            };

                            $scope.resetPassword = function () {
                                UserService.resetPasswordUser($scope.user.id).then(
                                    function() {
                                        confirm("A request to RESET the user's password is in progress!")
                                    });
                            };

                            $scope.lock = function () {
                                UserService.lockUser($scope.user.id).then(
                                    function() {
                                        confirm("A request to LOCK the user is in progress!")
                                    });
                            };

                            $scope.unlock = function () {
                                UserService.unlockUser($scope.user.id).then(
                                    function() {
                                       confirm("A request to UNLOCK the user is in progress!")
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
						} ]);
