testreg.factory("DateComparisonService", function($http, $rootScope, $parse, $filter) {
	
	return {		
		loadDateWatchers: function() {
			$rootScope.addDateWatchers = function(scopeProperties, splitExp, $scope, callbackFn) {
				angular.forEach(scopeProperties, function(value){
					addWatchExpression(value, $scope);
				});
				function addWatchExpression(scopeProperty, $scope) {
					$scope.$watch($parse(scopeProperty), function(newVal, oldVal){
						if(isDateChanged(newVal, oldVal, $scope.format)) {
							
							if(callbackFn) {
								callbackFn(true);
							}
						}
						
						var property = scopeProperty;
						if(splitExp !=null) {
							property = splitExp(scopeProperty);
						} 
						$parse(property).assign($scope, false);
					});
				};
				
				function isDateChanged(oldDate, newDate, format){
					var oldDateVal;
					var newDateVal;
					
					if(angular.isObject(oldDate)) {
						oldDateVal = $filter('date')(oldDate, format);
					} else {
						oldDateVal = getFormattedDate(oldDate);
					}
					
					if(angular.isObject(newDate)) {
						newDateVal = $filter('date')(newDate, format);
					} else {
						newDateVal = getFormattedDate(newDate);
					}
					
					if(oldDateVal != newDateVal) {
						return true;
					}
					return false;
				};
				
				function getFormattedDate(date) {
					if (date) {
			    		return date.split("T")[0];
			    	} else {
			    		return date;
			    	}
				};
			};
			return;
		}
	};
	
});