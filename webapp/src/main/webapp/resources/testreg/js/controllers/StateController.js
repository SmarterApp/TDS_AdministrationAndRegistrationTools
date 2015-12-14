testreg.controller(	'StateController',['$scope','$state','loadedData','StateService', 'EntityService','CurrentUserService','filterFilter','$rootScope',
						function($scope, $state, loadedData, StateService, EntityService, CurrentUserService, filterFilter,$rootScope) {
							$scope.savingIndicator = false;
						    $scope.state = loadedData.data;
						    $scope.errors = loadedData.errors;
							$scope.actionButton = '';
							$scope.formAction = 'Add';
							$scope.cancel = function() {
					            $state.transitionTo("entities.searchState");
					        };
					        
							if ($scope.state && $scope.state.id) {
								$scope.formAction = 'Edit';
								EntityService.getEntity($scope.state.parentEntityType, $scope.state.parentId).then(function(response){
									$scope.state.parentEntityId = response.data.entityId;
								});								
							}
							//Load the client config
							EntityService.loadClientConfig().then(function(response){
								$scope.entities = EntityService.loadStateParentEntities(response.data);
								if (CurrentUserService.getTenantType() == 'STATE') {
									$scope.entities.push({entityId:"CLIENT",entityName:'client'});
							    	if(! response.groupOfStates){
							    		$scope.entities.push({entityId:"GROUPOFSTATES",entityName:'GroupOfStates'});
							    	}
								}
							});

							StateService.loadAllStates().then(function(allStates){
								$scope.states = allStates.data;
								if (CurrentUserService.getTenantType() == 'STATE') {
									$scope.states = filterFilter($scope.states, {entityId:CurrentUserService.getTenantName()});
								}	
							});
							$scope.selectState = function(id) {
								$scope.state.entityName = StateService.getStateName(id,$scope.states);
			
							};
							$scope.xwalk   = function(label) {
								return $scope.safewalk('State', label);
							};
							$scope.resetParent = function() {
								$scope.state.parentEntityId = '';
							};
							$scope.save = function(state) {
								$scope.savingIndicator = true;
								StateService.saveState(state).then(
										function(response) {
											$scope.savingIndicator = false;
											$scope.errors = response.errors;
											if ($scope.errors.length == 0) {
												$scope.stateForm.$setPristine();
												$scope.state = response.data;
												$state.transitionTo("entities.searchState");
											}
										});
								};

							$scope.$on('$stateChangeStart',
											function(event, toState, toParams,
													fromState, fromParams) {
												if ($scope.stateForm.$dirty
														&& $scope.actionButton != 'cancel') {
													if (!confirm("You have unsaved changes. Are you sure you want to leave this page?")) {
														event.preventDefault();
													}
												}
											});
						} ]);
