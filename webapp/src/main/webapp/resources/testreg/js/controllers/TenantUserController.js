
testreg.controller('TenantUserController', ['$scope', '$state', '$window', '$location', 'TenantUserService' , 'CurrentUserService', 
     function UserController($scope, $state, $window, $location, TenantUserService, CurrentUserService) {
		 var defaultAssets = {
				 logo : 'resources/testreg/images/logo_sbac.png',
				 headerbackground:'white'
		 };
		 $scope.go = function(path){
	    		$location.path(path);
		 };
		 $scope.tenantContainer = [];
		 $scope.selectedTenant = {};

		 TenantUserService.getApplicableTenants().then(function(response){
			 if(response.data != null){
				 $scope.tenantContainer = response.data.tenants;
				 if($scope.tenantContainer && $scope.tenantContainer.length > 0){
					 $scope.selectedTenant = {};
					 angular.forEach($scope.tenantContainer, function(value){
						 if(CurrentUserService.getTenantId() == value.id){
							 $scope.selectedTenant = value;
						 }
					 });
					 if(!$scope.selectedTenant.id){
						 $scope.selectedTenant = $scope.tenantContainer[0];
						 $scope.changeTenant();
					 }
				 }else{
					 $state.transitionTo("noTenant");
				 }
			 }
		 });
		 
		 refreshAssets();
		 
		 function refreshAssets() {
			 TenantUserService.getAssets(CurrentUserService.getTenantId()).then(function(response){
				 var assets = null;
				 if(response.data != null && response.data.assets != null){
					 assets = {};
					 angular.forEach(response.data.assets, function(value, key){
						 if(value.type == 'IMAGE'){
							 assets[value.name] = value.url;
						 }else{
							 assets[value.name] = value.property;
						 }
					 });
				 }
				 skinApp(assets);
			 });
		 }
		 		 
		 $scope.changeTenant = function(){
			 CurrentUserService.setTenantId($scope.selectedTenant.id);
			 CurrentUserService.setTenantType($scope.selectedTenant.type);
			 CurrentUserService.setTenantName($scope.selectedTenant.name);
			 refreshAssets();
			 if(!contextPath || contextPath == "") {
				 $window.location = "/" ;
			 } else {
				 $window.location = contextPath ;
			 }
		 };
		 
		 function skinApp(assets){
			 if(assets == null) {
				 assets = defaultAssets;
			 }
			 $scope.logoImage =  assets.logo;
			 $scope.headerbackground = {"background-color":assets.headerbackground }; 
		 }
}]);