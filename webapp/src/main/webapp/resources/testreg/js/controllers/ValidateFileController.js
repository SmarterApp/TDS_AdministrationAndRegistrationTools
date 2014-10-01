testreg.controller('ValidateFileController',['$scope','$state', 'loadedData','ValidateFileService', 'fileId','prevActiveLink',
    function($scope, $state, loadedData, ValidateFileService, fileId,prevActiveLink) {

        $scope.activeLink = prevActiveLink;
        $state.$current.self.name = prevActiveLink;

        $scope.savingIndicator = false;
        $scope.isSaveButtonDisabled = false;

	    $scope.isActiveLink = function(link){
			return  $scope.activeLink.indexOf(link) == 0;
		};

        $scope.errors = loadedData.errors;
        $scope.validationResults = loadedData.data;
        $scope.hasGlobalErrors = false;
        $scope.hasFatalErrors = false;
        $scope.globalErrors;
        $scope.fileId = fileId;

        for (var i = 0; i < $scope.validationResults.length; i++) {
        	if ($scope.validationResults[i].formatType == 'GLOBAL') {
        		$scope.hasGlobalErrors = true;
        		$scope.globalErrors = $scope.validationResults[i];
        	}
        	
        	if($scope.validationResults[i].fatalErrors) {
                $scope.savingIndicator = false;
                $scope.isSaveButtonDisabled = false;
        		$scope.hasFatalErrors = true;
        	}
		}

        $scope.cancel = function() {
            $scope.savingIndicator = false;
            $scope.isSaveButtonDisabled = false;
            $state.transitionTo($scope.activeLink);
        };
        
        $scope.save = function() {
            $scope.savingIndicator = true;
            $scope.isSaveButtonDisabled = true;
            $state.transitionTo("saveFile", {fileId:$scope.fileId});
        };
    }
]);

