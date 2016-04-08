
testreg.controller('DownloadTemplateController',['$scope','$state', 'DownloadTemplateService','fileUpload', '$filter', '$http', '$location','EntityService',
    function($scope, $state, DownloadTemplateService, fileUpload, $filter, $http, $location,EntityService) {

        $scope.activeLink = $state.$current.self.name;

        $scope.isActiveLink = function(link){
            return  $scope.activeLink.indexOf(link) == 0;
        };

		$scope.errors = {};
		$scope.fileTypes = DownloadTemplateService.loadFileTypes();
		//Load the client config
		EntityService.loadClientConfig().then(function(response){
			$scope.entities = DownloadTemplateService.loadEntities(response.data);
		});		
		$scope.$watch('entities', function(newVal, oldVal){
			if(newVal !== oldVal) {
					$scope.selectedEntities = [];
					angular.forEach($filter('filter')(newVal, {code: true}), function(entity){
						$scope.selectedEntities.push(entity.entityName);
					});
			};
		}, true);
		
		$scope.$watch('fileTypes', function(newVal, oldVal){
			if(newVal !== oldVal) {
				$scope.selectedFileTypes = [];
				angular.forEach($filter('filter')(newVal, {code: true}), function(fileType){
					$scope.selectedFileTypes.push(fileType.extn);
				});
			};
		}, true);
		
		
		$scope.downloadTemplate = function() {
			$scope.downloadFiles = [];
			angular.forEach($scope.selectedEntities, function(entityName) {
				angular.forEach($scope.selectedFileTypes, function(fileExtn){
					$scope.downloadFiles.push({url: DownloadTemplateService.fileUrl(entityName, fileExtn)});
				});
			});
		};
		
		
		$scope.resetErrors = function() {
			$scope.errors = {};
		};
	}
]);

	