testadmin.controller(	'TestPlatFormController',['$scope','$state','loadedData','TestPlatFormService',
						function($scope, $state, loadedData,TestPlatFormService ) {
							$scope.savingIndicator = false;
						    $scope.testPlatForm = loadedData.data;
						    $scope.errors = loadedData.errors;
							$scope.actionButton = '';
							$scope.formAction = 'Add';
							$scope.cancel = function() {
					            $state.transitionTo("searchTestPlatform");
					        };
					        
							$scope.save = function(testPlatForm) {
								$scope.savingIndicator = true;
								TestPlatFormService.save(testPlatForm).then(
										function(response) {
											$scope.savingIndicator = false;
											$scope.errors = response.errors;
											if ($scope.errors.length == 0) {
												$scope.testPlatFormForm
														.$setPristine();
												$scope.testPlatForm = response.data;
												$state.transitionTo("searchTestPlatform");
											}
										});
								};

							$scope.$on('$stateChangeStart',
											function(event, toState, toParams,
													fromState, fromParams) {
												if ($scope.testPlatFormForm.$dirty
														&& $scope.actionButton != 'cancel') {
													if (!confirm("You have unsaved changes. Are you sure you want to leave this page?")) {
														event.preventDefault();
													}
												}
											});
						} ]);
