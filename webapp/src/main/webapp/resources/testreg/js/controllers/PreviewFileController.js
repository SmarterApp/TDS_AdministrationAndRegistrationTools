testreg.controller('PreviewFileController',['$scope','$state', 'loadedData','PreviewFileService', 'fileId','prevActiveLink',
    function($scope, $state, loadedData, PreviewFileService, fileId,prevActiveLink) {

        $scope.savingIndicator = false;
        $scope.isValidateButtonDisabled = false;
		$scope.activeLink = prevActiveLink;
		$state.$current.self.name = prevActiveLink;

		$scope.isActiveLink = function(link){
		    return $scope.activeLink.indexOf(link) == 0;
		};

   	    $scope.previewFiles = loadedData.data;
   	    $scope.errors = loadedData.errors;
   	    $scope.fileId = fileId;

		$scope.cancel = function() {
            $scope.isValidateButtonDisabled = false;
            $scope.savingIndicator = false;
		    $state.transitionTo($scope.activeLink);
		};
		
		$scope.validate = function() {
            $scope.isValidateButtonDisabled = true;
            $scope.savingIndicator = true;
		    $state.transitionTo("validateFile", {fileId:$scope.fileId});
		};
	}
]);
