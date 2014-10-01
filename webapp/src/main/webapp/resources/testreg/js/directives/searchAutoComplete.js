/*jshint smarttabs: true */
testreg.directive("groupOfStatesSearchAutoComplete", function(GroupOfStatesService, $timeout) {
    return {
        restrict : "A",
        replace: true,
        require: ["ngModel"],
        scope:true,
        transclude : false,
        controller : function($scope, $attrs) {
            $scope.filterGroupofStates = function(searchVal, pageSize, searchById) {       
                 return GroupOfStatesService.findGroupOfStatesBySearchValAndState(searchVal, pageSize, searchById).then(
                        function(loadedData) {
                            return loadedData.data.searchResults;
                        }
                    );
                };            	
            },
        link : function(scope, element, attrs, ctrls) {
        	
        	$(element).bind('focus', function() {
                $timeout(function() { // timeout necessary for IE10 to work..
                    ctrls[0].$setViewValue(ctrls[0].$viewValue ? ctrls[0].$viewValue : " ");
                }, 1);
            });
			element.bind("change", function(){
				if(attrs.ngModel=='entityId'){
					scope.changeEntityId(scope.$eval(attrs.ngModel));
				}else{
					scope.changeEntityName(scope.$eval(attrs.ngModel));
				}
			});	
        }
    };
});
testreg.directive("districtSearchAutoComplete", function(DistrictService, $timeout) {
    return {
        restrict : "A",
        replace: true,
        require: ["ngModel"],
        scope:true,
        transclude : false,
        controller : function($scope, $attrs) {
            $scope.filterDistricts = function(searchVal, pageSize,searchById) {       
       	 		state = $scope.searchParams.stateAbbreviation;
                return DistrictService.findDistrictsBySearchVal(searchVal, state, pageSize, searchById).then(
                        function(loadedData) {
                            return loadedData.data.searchResults;
                        }
                    );
                };            	
            },
        link : function(scope, element, attrs, ctrls) {
        	
        	$(element).bind('focus', function() {
                $timeout(function() { // timeout necessary for IE10 to work..
                    ctrls[0].$setViewValue(ctrls[0].$viewValue ? ctrls[0].$viewValue : " ");
                }, 1);
            });
        	
			element.bind("change", function(){
				if(attrs.ngModel=='entityId'){
					scope.changeEntityId(scope.$eval(attrs.ngModel));
				}else{
					scope.changeEntityName(scope.$eval(attrs.ngModel));
				}
			});	
        }
    };
});

testreg.directive("groupOfDistrictsSearchAutoComplete", function(GroupOfDistrictsService, $timeout) {
    return {
        restrict : "A",
        replace: true,
        require: ["ngModel"],
        scope:true,
        transclude : false,
        controller : function($scope, $attrs) {
            $scope.filterGroupofDistricts = function(searchVal, pageSize, searchById) {       
       	 		state = $scope.searchParams.stateAbbreviation;
                return GroupOfDistrictsService.findGroupOfDistrictsBySearchVal(searchVal, state, pageSize, searchById).then(
                        function(loadedData) {
                            return loadedData.data.searchResults;
                        }
                    );
                };            	
            },
        link : function(scope, element, attrs, ctrls) {
        	
        	$(element).bind('focus', function() {
                $timeout(function() { // timeout necessary for IE10 to work..
                    ctrls[0].$setViewValue(ctrls[0].$viewValue ? ctrls[0].$viewValue : " ");
                }, 1);
            });
        	
			element.bind("change", function(){
				if(attrs.ngModel=='entityId'){
					scope.changeEntityId(scope.$eval(attrs.ngModel));
				}else{
					scope.changeEntityName(scope.$eval(attrs.ngModel));
				}
			});	
        }
    };
});

testreg.directive("groupOfInstitutionsSearchAutoComplete", function(GroupOfInstitutionsService, $timeout) {
    return {
        restrict : "A",
        replace: true,
        require: ["ngModel"],
        scope:true,
        transclude : false,
        controller : function($scope, $attrs) {
            $scope.filterGroupOfInstitutions = function(searchVal, pageSize,searchById) {       
       	 		state = $scope.searchParams.stateAbbreviation;
                return GroupOfInstitutionsService.findGroupOfInstitutionsBySearchVal(searchVal, state, pageSize,searchById).then(
                        function(loadedData) {
                            return loadedData.data.searchResults;
                        }
                    );
                };            	
            },
        link : function(scope, element, attrs, ctrls) {
        	
        	$(element).bind('focus', function() {
                $timeout(function() { // timeout necessary for IE10 to work..
                    ctrls[0].$setViewValue(ctrls[0].$viewValue ? ctrls[0].$viewValue : " ");
                }, 1);
            });
        	
			element.bind("change", function(){
				if(attrs.ngModel=='entityId'){
					scope.changeEntityId(scope.$eval(attrs.ngModel));
				}else{
					scope.changeEntityName(scope.$eval(attrs.ngModel));
				}
			});	
        }
    };
});
testreg.directive("institutionsSearchAutoComplete", function(InstitutionService, $timeout) {
    return {
        restrict : "A",
        replace: true,
        require: ["ngModel"],
        scope:true,
        transclude : false,
        controller : function($scope, $attrs) {
            $scope.filterInstitutions = function(searchVal, pageSize,searchById) {       
       	 		state = $scope.searchParams.stateAbbreviation;
                return InstitutionService.findInstitutionBySearchVal(searchVal, state, pageSize,searchById).then(
                        function(loadedData) {
                            return loadedData.data.searchResults;
                        }
                    );
                };            	
            },
        link : function(scope, element, attrs, ctrls) {
        	
        	$(element).bind('focus', function() {
                $timeout(function() { // timeout necessary for IE10 to work..
                    ctrls[0].$setViewValue(ctrls[0].$viewValue ? ctrls[0].$viewValue : " ");
                }, 1);
            });
        	
			element.bind("change", function(){
				if(attrs.ngModel=='entityId'){
					scope.changeEntityId(scope.$eval(attrs.ngModel));
				}else{
					scope.changeEntityName(scope.$eval(attrs.ngModel));
				}
			});	
        }
    };
});
testreg.directive("assessementSearchAutoComplete", function(AssessmentService, $timeout) {
    return {
        restrict : "A",
        replace: true,
        require: ["ngModel"],
        scope:true,
        transclude : false,
        controller : function($scope, $attrs) {
            $scope.filterAssessments = function(searchVal, pageSize,searchBy) {   
                return AssessmentService.findAssessmentBySearchVal(searchVal, pageSize,searchBy).then(
                        function(loadedData) {
                            return loadedData.data.searchResults;
                        }
                    );
                };            	
            },
        link : function(scope, element, attrs, ctrls) {
        	
        	$(element).bind('focus', function() {
                $timeout(function() { // timeout necessary for IE10 to work..
                    ctrls[0].$setViewValue(ctrls[0].$viewValue ? ctrls[0].$viewValue : " ");
                }, 1);
            });
        	
			element.bind("change", function(){
				if(attrs.ngModel=='entityId'){
					scope.changeEntityId(scope.$eval(attrs.ngModel));
				}else if(attrs.ngModel=='testName'){
					scope.changeTestName(scope.$eval(attrs.ngModel));
				}else if(attrs.ngModel=='grade'){
					scope.changeGrade(scope.$eval(attrs.ngModel));
				}else{
					scope.changeSubjectCode(scope.$eval(attrs.ngModel));
				}
			});	
        }
    };
});

testreg.directive("userSearchAutoComplete", function(UserService, $timeout) {
    return {
        restrict : "A",
        replace: true,
        require: ["ngModel"],
        scope:true,
        transclude : false,
        controller : function($scope, $attrs) {
            $scope.filterUsers = function(searchVal, pageSize, searchBy) {  
            	var state = $scope.searchParams['roleAssociations.stateAbbreviation'];
                return UserService.findUserBySearchVal(searchVal, state, pageSize, searchBy).then(
                        function(loadedData) {
                            return loadedData.data.searchResults;
                        }
                    );
                };            	
            },
        link : function(scope, element, attrs, ctrls) {
        	
        	$(element).bind('focus', function() {
                $timeout(function() { // timeout necessary for IE10 to work..
                    ctrls[0].$setViewValue(ctrls[0].$viewValue ? ctrls[0].$viewValue : " ");
                }, 1);
            });
        	
			element.bind("change", function(){
				if(attrs.ngModel=='firstName'){
					scope.changeFirstName(scope.$eval(attrs.ngModel));
				}else if(attrs.ngModel=='lastName'){
					scope.changeLastName(scope.$eval(attrs.ngModel));
				}else{
					scope.changeEmail(scope.$eval(attrs.ngModel));
				}
			});	
        }
    };
});

