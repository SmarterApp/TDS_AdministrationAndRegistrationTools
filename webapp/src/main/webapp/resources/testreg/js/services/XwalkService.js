testreg.factory("XwalkService", function($http, $rootScope) {
	return {
		loadXwalkMap: function() {
			var url = baseUrl + "crosswalkMap" ;
			$rootScope.safewalk = function(entity, name) {
				if($rootScope.crosswalkMap) {//If a XWalk map exists
					var crosswalkEntry = $rootScope.crosswalkMap[entity];
					
					if(crosswalkEntry) {
						var displayName = crosswalkEntry[name];
						if(displayName) {
							return displayName;
						}
						return name;
					}
					return name;
				}
				return name;	
			};
			
			return $http.get(url, {cache: true}).then(this.successHandler, this.errorHandler).then(function(loadedData) {
				if(loadedData.data) {
					$rootScope.crosswalkMap = loadedData.data;
				}
				return;
			});
		}
	};
});