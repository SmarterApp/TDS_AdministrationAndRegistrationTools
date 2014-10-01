testreg.controller('EntitiesHomeController',['$scope','$state','EntityService','CurrentUserService',
      function($scope, $state,EntityService,CurrentUserService) {
  	
	 $scope.activeLink = $state.$current.self.name;
	 
	 $scope.isActiveLink = function(link){
		return  $scope.activeLink.indexOf(link) == 0; 
	 };
	 
	 $scope.goToFormsPage = function(tabLink) {
         $state.transitionTo(tabLink);
         $scope.activeLink = tabLink;
     };
	EntityService.loadClientConfig().then(function(response){
		$scope.parentEntity = response.data;
		
	});
     
	 $scope.isAllowed = function(entity) {
		 allowedEntities = EntityService.loadAllowedEntitiesByTenant();
		 tenantType = CurrentUserService.getTenantType();
		 if(tenantType == 'GROUPOFSTATES') {
			 allowedEntities.splice(allowedEntities.indexOf("GROUPOFSTATES"), 1);
		 }else if(tenantType == 'STATE') {
			 allowedEntities.splice(allowedEntities.indexOf("STATE"), 1);
		 }else if(tenantType == 'DISTRICT') {
			 allowedEntities.splice(allowedEntities.indexOf("DISTRICT"), 1);
		 }else if(tenantType == 'GROUPOFDISTRICTS') {
			 allowedEntities.splice(allowedEntities.indexOf("GROUPOFDISTRICTS"), 1);
		 }else if(tenantType == 'INSTITUTION') {
			 allowedEntities.splice(allowedEntities.indexOf("INSTITUTION"), 1);
		 }else if(tenantType == 'GROUPOFINSTITUTIONS') {
			 allowedEntities.splice(allowedEntities.indexOf("GROUPOFINSTITUTIONS"), 1);
		 }
		 return (allowedEntities.indexOf(entity) != -1);
     };
     var pageData = EntityService.loadEntityPage();
	         if(pageData != null){
	         	$state.transitionTo(pageData);
	         	$scope.activeLink =pageData;
	         }
}]);
