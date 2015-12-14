testreg.controller(	'GroupOfInstitutionsController',['$scope','$state','loadedData','GroupOfInstitutionsService','StateService', 'EntityService','inputData', 
						function($scope, $state, loadedData, GroupOfInstitutionsService, StateService, EntityService, inputData) {
							$scope.savingIndicator = false;
						    $scope.groupofInstitutions = loadedData.data;
						    $scope.errors = loadedData.errors;
							$scope.actionButton = '';
							$scope.formAction = 'Add';
							$scope.cancel = function() {
					            $state.transitionTo("entities.searchGroupOfInstitutions");
					        };
							//Load the client config
							EntityService.loadClientConfig().then(function(response){
								$scope.entities = EntityService.loadGroupOfInstitutionsParentEntities(response.data);
							});		
					    	StateService.loadStates().then(function(loadedData) {
					    		$scope.states = loadedData.data;
					    	});
					    						    	
							if ($scope.groupofInstitutions && $scope.groupofInstitutions.id) {
								$scope.formAction = 'Edit';
							}else{
								if(inputData) {
									$scope.groupofInstitutions.entityId = inputData.entityId;
									$scope.groupofInstitutions.stateAbbreviation = inputData.stateAbbreviation;
								}
							}
							
							$scope.xwalk   = function(label) {
								return $scope.safewalk('GroupOfInstitutions', label);
							};
							
							$scope.setParentInfoOnChange = function (parentId) { 
								angular.forEach($scope.selectedParentEntities.$$v, function(parentEntity){
									if (parentEntity.id === parentId) {
										$scope.groupofInstitutions.parentEntityId =  parentEntity.entityId;
										$scope.groupofInstitutions.stateAbbreviation =  parentEntity.stateAbbreviation;
										return;
									}
								} ) 
							};
							
							$scope.resetParent = function() {
								$scope.groupofInstitutions.parentEntityId = '';
							};
							$scope.save = function(groupofInstitutions) {
								$scope.savingIndicator = true;
								GroupOfInstitutionsService.saveGroupOfInstitutions(groupofInstitutions).then(
										function(response) {
											$scope.savingIndicator = false;
											$scope.errors = response.errors;
											if ($scope.errors.length == 0) {
												$scope.groupofInstitutionsForm
														.$setPristine();
												$scope.groupofInstitutions = response.data;
					
												$state.transitionTo("entities.searchGroupOfInstitutions");
											}
										});
								};

							$scope.$on('$stateChangeStart',
											function(event, toState, toParams,
													fromState, fromParams) {
												if ($scope.groupofInstitutionsForm.$dirty){
													if (!confirm("You have unsaved changes. Are you sure you want to leave this page?")) {
														event.preventDefault();
													}
												}
											});
						} ]);
