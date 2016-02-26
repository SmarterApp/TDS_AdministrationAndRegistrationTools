
testreg.controller('TenantUserController', ['$scope', '$state', '$window', '$location', 'TenantUserService' , 'CurrentUserService', 'UserService', 
     function UserController($scope, $state, $window, $location, TenantUserService, CurrentUserService, UserService) {
		 var defaultAssets = {
				 logo : 'resources/testreg/images/logo_sbac.png',
				 headerbackground:'white'
		 };
		 $scope.go = function(path){
	    		$location.path(path);
		 };
		 
		 $scope.editProfile = function() {
			 $state.transitionTo("userProfile");
		 };
		 $scope.tenantContainer = [];
		 $scope.selectedTenant = {};
		 $scope.currentUser = [];

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
		 
		 TenantUserService.getCurrentUser().then(function (response){
			 $scope.errors = response.errors;
			 if($scope.errors.length == 0){
				 $scope.currentUser = response.data;
				 isUserHasOnlyEditProfile();
			 }
		});
		 		 
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
		 
		 UserService.getCurrentUser().then(function (response){
			 $scope.errors = response.errors;
			 if($scope.errors.length == 0){
				 $scope.user = response.data;
			 }
		});
		 
		 $scope.hasPermissionForEditProfile = function() {
			 var hasPermission = false;
			 if(angular.isDefined($scope.user)){
				 hasPermission = true;
			 }
			 return hasPermission;
		 };
		 
		 function isUserHasOnlyEditProfile() {
			 var hasPermission = false;
			 if(angular.isDefined($scope.currentUser) && angular.isDefined($scope.currentUser.authorities) && $scope.currentUser.authorities.length == 1){
				 if($scope.currentUser.authorities[0].name=="Edit Profile"){
					 hasPermission = true;
				 } 
			 }
	
			 if(hasPermission == true){
				 $state.transitionTo("userProfile");
			 }
		 }
		 
		 $scope.hasPermissionForDownloadTemplate = function() {
			 var hasPermission = false;
			 if(angular.isDefined($scope.currentUser)){
				 var obj = {"name":"Template Download","componentName":"Test Reg","authority":"ROLE_Template Download"};
				 hasPermission = $scope.containsObject(obj, $scope.currentUser.permissions);
			 }
			 return hasPermission;
		 };
		 
		 $scope.containsObject = function (obj, list) {
			 var i;
			 if(angular.isDefined(list)){
				 for (i = 0; i < list.length; i++) {
					 if (list[i] === obj) {
						 return true;
					 }
				 }
			 }
			 return false;
		 };
}]);

