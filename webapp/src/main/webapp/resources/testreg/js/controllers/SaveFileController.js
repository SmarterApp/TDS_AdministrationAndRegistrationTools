testreg.controller('SaveFileController',['$scope','$state', 'loadedData','SaveFileService','prevActiveLink',
    function($scope, $state, loadedData, SaveFileService,prevActiveLink) {
		 $scope.activeLink = prevActiveLink;
		 $state.$current.self.name = prevActiveLink;
		 $scope.isActiveLink = function(link){
				return  $scope.activeLink.indexOf(link) == 0; 
			 };	
	$scope.fileSummary = loadedData.data;
        $scope.errors = loadedData.errors;
        
        $scope.cancel = function(formatType) {
        	if(formatType === "EXPLICITELIGIBILITY"){
        		$state.transitionTo("uploadExplicitEligibility");
        	} else if(formatType === "STUDENTGROUP"){
        		$state.transitionTo("uploadStudentGroups");
        	}else{
                $state.transitionTo("uploadFile");        		
        	}
        };
    }
]);
