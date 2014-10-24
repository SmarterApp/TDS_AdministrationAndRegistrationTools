testreg.controller(	'InstitutionController',['$scope','$state','loadedData','InstitutionService','StateService', 'EntityService','inputData', 
						function($scope, $state, loadedData, InstitutionService, StateService, EntityService, inputData) {
							$scope.savingIndicator = false;
						    $scope.institution = loadedData.data;
							$scope.actionButton = '';
							$scope.formAction = 'Add';
							$scope.errors = loadedData.errors;
							$scope.allStates = [];
							$scope.states=[];
							$scope.dbStates=[];
							$scope.cancel = function() {
					            $state.transitionTo("entities.searchInstitution");
					        };
					        
							//Load the client config
							EntityService.loadClientConfig().then(function(response){
								$scope.entities = EntityService.loadInstitutionParentEntities(response.data);
							});					        
					    	StateService.loadStates().then(function(loadedData) {
					    		$scope.dbStates = loadedData.data;
					    	});
					    	StateService.loadAllStates().then(function(loadedData) {
					    		$scope.allStates = loadedData.data;
					    	});
					    	
					    	$scope.loadStates = function(parentType){
					    		if (parentType === 'CLIENT' || parentType === 'GROUPOFSTATES'){
					    			$scope.states = $scope.allStates;
					    		} else {
					    			$scope.states = $scope.dbStates;
					    		}
					    	};
					    								    						    	
							if ($scope.institution && $scope.institution.id) {
								$scope.formAction = 'Edit';
								EntityService.getEntity($scope.institution.parentEntityType, $scope.institution.parentId).then(function(response){
									$scope.institution.parentEntityId = response.data.entityId;
								});									
							}else{
								if(inputData) {
									$scope.institution.entityId = inputData.entityId;
									$scope.institution.stateAbbreviation = inputData.stateAbbreviation;
								}
							}
							
							$scope.xwalk   = function(label) {
								return $scope.safewalk('Institution', label);
							};
							
							$scope.resetParent = function() {
								$scope.institution.parentEntityId = '';
							};
							$scope.setParentInfoOnChange = function (parentId) { 
								angular.forEach($scope.selectedParentEntities.$$v, function(parentEntity){
									if (parentEntity.id === parentId) {
										$scope.institution.parentEntityId =  parentEntity.entityId;
										$scope.institution.stateAbbreviation =  parentEntity.stateAbbreviation;
										return;
									}
								} ) 
							};
							$scope.save = function(institution) {
								$scope.savingIndicator = true;
								InstitutionService.saveInstitution(institution).then(
										function(response) {
											$scope.savingIndicator = false;
											$scope.errors = response.errors;
											if ($scope.errors.length == 0) {
												$scope.institutionForm
														.$setPristine();
												$scope.institution = response.data;
												$state.transitionTo("entities.searchInstitution");
											}
										});
								};

							$scope.$on('$stateChangeStart',
											function(event, toState, toParams,
													fromState, fromParams) {
												if ($scope.institutionForm.$dirty
														&& $scope.actionButton != 'cancel') {
													if (!confirm("You have unsaved changes. Are you sure you want to leave this page?")) {
														event.preventDefault();
													}
												}
											});
						} ]);
