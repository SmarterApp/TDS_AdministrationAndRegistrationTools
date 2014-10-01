testreg.controller('HomeController', ['$scope','$location','$window', '$state', 'EntityNameService', 'XwalkService', 'VersionService', "DateComparisonService","EntityService",
     function HomeController($scope,$location, $window, $state, EntityNameService, XwalkService, VersionService, DateComparisonService,EntityService) {

        VersionService.getBuildInfo().then(function(response) {
            $scope.buildInfo = response.data;
        });
		$scope.activeLink = $state.current.name;
		$scope.slidePage = function (path) {
			$location.path(path);			
		};

	    $scope.go = function(path){
	    	$location.path(path);
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