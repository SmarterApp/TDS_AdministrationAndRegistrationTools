testadmin.controller('HomeController', ['$scope','$location','$state', '$window','VersionService','DateComparisonService','EntityNameService', 'XwalkService',
     function HomeController($scope,$location,$state, $window, VersionService,DateComparisonService,EntityNameService, XwalkService) {
    	$scope.activeLink = $state.current.name;
        VersionService.getBuildInfo().then(function(response) {
            $scope.buildInfo = response.data;
        });
	    $scope.go = function(path){ 
	    	$location.path(path);
		};
		
		$scope.slidePage = function (path) {
			$location.path(path);			
		};
		
		 $scope.openUserGuide = function(link) {
			$window.open(link,'_blank');
		 };
		 $scope.isActiveLink = function(link){
			 return  $scope.activeLink === link || $state.current.name === link; 
	     };

		 $scope.goToFormsPage = function(tabLink) {
	         $state.transitionTo(tabLink);
	         $scope.activeLink = tabLink;
	     };
	     
	     EntityNameService.loadEntityNameLabels();
	     
	     EntityNameService.entityHierarchyData();

	     XwalkService.loadXwalkMap();
	     
	     DateComparisonService.loadDateWatchers();
	     
	     
		$scope.showTestAdmin = function (bool) {
			if(bool) {
				$state.transitionTo("searchProctorRoles");
				$scope.activeLink ="searchProctorRoles";
			}	else {
				$state.transitionTo("searchTSBAssessment");
				$scope.activeLink ="searchTSBAssessment";				
			}				

		};
	 }
   ]);
