testreg.controller(	'ClientController',['$scope','$state', '$rootScope','loadedData','ClientService',
						function($scope, $state, $rootScope, loadedData,ClientService) {
							$scope.savingIndicator = false;
						    $scope.client = loadedData.data;
						    $scope.errors = loadedData.errors; 
							$scope.actionButton = '';
							$scope.formAction = 'Add';

							$scope.cancel = function() {
								$scope.actionButton = 'cancel';
								$state.transitionTo("root");
					        };
					        
					        $scope.timeZones=ClientService.loadTimeZone();
								$scope.save = function(client) {
								$scope.savingIndicator = true;
								ClientService.saveClient(client).then(
										function(response) {
											$scope.savingIndicator = false;
											$scope.errors = response.errors;
											if($scope.errors.length == 0){
												$scope.clientForm.$setPristine();
												$scope.client = response.data;
											} else {
			            						angular.forEach($scope.errors, function(error, index){
			            							var tempError = error;
													tempError = tempError.replace("GROUPOFSTATES",$rootScope.entityNameLabels['GroupOfStates']);
													tempError = tempError.replace("GROUPOFDISTRICTS",$rootScope.entityNameLabels['GroupOfDistricts']);
													tempError = tempError.replace("GROUPOFINSTITUTIONS",$rootScope.entityNameLabels['GroupOfInstitutions']);
													$scope.errors[index] = tempError;
			            						});
											}
										});
								};
						  		$scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
						    		if ($scope.clientForm.$dirty && $scope.actionButton != 'cancel') {
						    			if(!confirm("You have unsaved changes. Are you sure you want to leave this page?")){
						    				event.preventDefault();
						    			}    	
							    	}
						  		});
						  	
						  	$scope.generateGuid = function() {
						  		ClientService.getGuid().then(
						  				function(response) {
						  					$scope.client.systemId = response.data;
						  					$scope.clientForm.$dirty = true;
						  				}
						  		);
						  	};
						  	
						  	ClientService.loadAssessmentTypes().then(function(response){
						  		if (response.data != null) {
						  			$scope.assessmentTypes = response.data;
						  		}
						  	});
						  		
						} ]);
