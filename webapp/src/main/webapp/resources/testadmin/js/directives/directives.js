testreg.directive("institutionAutoCompleteSchedule", function(InstitutionService, GroupOfInstitutionsService, $timeout) {
    return {
        restrict : "A",
        replace: true,
        require: ["ngModel"],
        scope:true,
        transclude : false,
        controller : function($scope, $attrs) {
        	if ($scope[$scope['domain']] && $scope[$scope['domain']].id) {
           	 	$scope.institution = InstitutionService.loadInstitution($scope[$scope['domain']].institutionId).then(
           			 function(loadedData) {
           				 return loadedData.data;
           			 }
           	 	);
           	}
            $scope.filterInstitutions = function(searchVal, stateAbbreviation, pageSize) { 
        		return InstitutionService.findInstitutionsByState(searchVal, stateAbbreviation, pageSize).then(
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
				scope.changeInstitutionId(scope.$eval(attrs.ngModel));
			});	
        }
    };
});



timepicker.directive('uiTimepicker', ['uiTimepickerConfig', function(uiTimepickerConfig) {
    return {
        restrict: 'A',
        require: 'ngModel',
        priority: 1,
        link: function(scope, element, attrs, ngModel, ctrl) {
    		var originalEndDate = "";
    		function zfill(num, len) {return (Array(len).join("0") + num).slice(-len);}
    		
    		function formattedTime(date) {
                	if ( angular.isDefined(date) && date !== null && !angular.isDate(date) ) {
                		return;
                	}
    			  	var hours = date.getHours() == 0 ? "12" : date.getHours() > 12 ? date.getHours() - 12 : date.getHours();
    			    var minutes = (date.getMinutes() < 10 ? "0" : "") + date.getMinutes();
    			    var ampm = date.getHours() < 12 ? "AM" : "PM";
    			    var formattedTime = zfill(hours, 2) + ":" + zfill(minutes, 2)  + ampm;
    			    return formattedTime;
    		}
    		
            ngModel.$render = function () {
                var date = ngModel.$modelValue;
                if ( angular.isDefined(date) && date !== null && !angular.isDate(date) ) {
                    throw new Error('ng-Model value must be a Date object - currently it is a ' + typeof date + '.');
                }
                if (!element.is(":focus")) {
                    element.timepicker('setTime', date);
                }
            };
            
            ngModel.$formatters.push(function(modelValue) {
                return formattedTime(modelValue);
            });

            ngModel.$parsers.unshift(function(viewValue){          	
            	var date = element.timepicker('getTime', ngModel.$modelValue);
            	var tempEndDate = "";
            	if(!originalEndDate || originalEndDate === "") {
                	originalEndDate = new Date(date.getTime());
            	}
            	tempEndDate = new Date(originalEndDate.getTime());
            	if (ngModel.$name === "endTime") {
            		tempEndDate.setHours(date.getHours());
            		tempEndDate.setMinutes(date.getMinutes());
            		if (date.getHours() === 0 && date.getMinutes() === 0) {
                		date.setDate(tempEndDate.getDate() + 1);
            		} else {
            			date.setDate(tempEndDate.getDate());
            		}
            	}
            	return date;
            });

            scope.$watch(attrs.ngModel, function() {
                var date = ngModel.$viewValue;
                if ( angular.isDefined(date) && date !== null && !angular.isDate(date) ) {
                    return;
                }
                ngModel.$render();
            }, true);

            element.timepicker(uiTimepickerConfig);
            element.bind('change', function() {
            	var timestr = ngModel.$viewValue;

            	var newtime = timestr.replace(":","");
            	newtime = newtime.replace(" AM","");
            	newtime = newtime.replace("AM","");
            	newtime = newtime.replace(" PM","");
            	newtime = newtime.replace("PM","");

            	if (isNaN(newtime)) {
            		if (ngModel.$name === "startTime") {
            			scope.errors.push("Invalid start time");
            		}else if (ngModel.$name === "endTime") {
            			scope.errors.push("Invalid end time");
            		}         		
            	}
            	
            });
            element.on('changeTime', function() {
        		if (ngModel.$name === "startTime") {
        			scope.errors.splice(scope.errors.indexOf("Invalid start time"), 1);
        		}else if (ngModel.$name === "endTime") {
        			scope.errors.splice(scope.errors.indexOf("Invalid end time"), 1);
        		}  

                if(!scope.$$phase) {
                    var date = element.timepicker('getTime', ngModel.$modelValue);
                    var time = date.getHours() + ":" + date.getMinutes();
                    ngModel.$setViewValue(time);
                    scope.$apply();
                }
            });                      
        }
    };

}]);

testadmin.directive("scheduleSearch", function(EntityNameService, EntityService, CurrentUserService, ScheduleSummaryReportService){
	return {
		restrict:"A",
		transclude :true,
		scope:{
			triggerSearch: '=',
			actionFn: '&'
		},
		templateUrl: 'resources/testadmin/partials/report-search.html',
		controller: function($scope, $attrs) {
			
			$scope.type 		= $attrs.type;
			$scope.buttonLabel  = $attrs.buttonLabel;
			$scope.cssClass 	= ($scope.type == 'Report') ? 'reportLayout' : 'fieldGroup';
			$scope.spanWidth 	= ($scope.type == 'Report') ? 'width:12%' : 'width:15%';
			
			EntityNameService.loadEntityNameLabels();
			
			$scope.selectedEntityId = "";
 			$scope.entityType = "";
 			$scope.userEntityType = CurrentUserService.getTenantType();
 			$scope.format="yyyy-MM-dd";
			
 			var entityName = ScheduleSummaryReportService.getEntityName;
 			
 			//Load Aggregate Levels
 			$scope.aggregateLevels = ScheduleSummaryReportService.loadAggregateLevels();
 			
 			$scope.getEntityLabel = function(enName) {
 				var $rootScope = $scope.$root;
 				if($rootScope.entityNameLabels) {
 					return $rootScope.entityNameLabels[enName];
 				}				
 			};
 			
 			$scope.displayNameIfEntityType = function(entityType, entityCollection) {
 				if($scope.entityType == entityType) {
 					return entityCollection[0].entityName;
 				}
 			};

 			//Find Tenant Type and Tenant Name. They are needed for limiting the dropdown values
 			var tenantType = CurrentUserService.getTenantType();
 			var tenantId = "" ;
 		     if(tenantType=="CLIENT"||tenantType=="STATE"){
 		        tenantId = CurrentUserService.getTenantName();
 		     }else{
 		    	 tenantId = CurrentUserService.getTenantId();
 		     }
	          
 			//Start with Tenant Type and load the entity data first and then populate child values
 			ScheduleSummaryReportService.findEntityById(tenantId,tenantType).then(function(loadData){
 				var selectedData=loadData.data;
	        	 $scope.entityType = tenantType;
	        	//This is localized scope and fine if we just pollute(or populate if you wish) the values. Not going to affect other scope boundaries
	        	 $scope[entityName(tenantType)] = loadData.data; 
	        	 $scope[entityName(tenantType)+"Id"] = selectedData[0].id;
	        	 $scope.selectedEntityId = selectedData[0].id;
	        	 $scope.populateChildValues(selectedData[0].id,CurrentUserService.getTenantType());
	        	 //$scope.setAccessFlag($scope.entityType);
	          });
	          
 			$scope.populateChildValues = function(parentId,parentType){
 				var childArrays= ScheduleSummaryReportService.loadChildHierarchy(parentType);
 				angular.forEach(childArrays, function(entityType){
 					var params = {parentId:parentId,parentEntityType:parentType};
	        			 
 					if(parentType == "INSTITUTION") {
 						$scope.institutionId = parentId;
 						params.institutionEntityMongoId 		= parentId;
 					}
	        			 
 					ScheduleSummaryReportService.loadParents(entityType, params).then(function(loadData) {
 						var data = (loadData.data.searchResults) ? loadData.data.searchResults : loadData.data; 
 						$scope[entityName(entityType)] = data;
        			 });
        		 });
 				
        	 };
	        	 
        	 $scope.resetChildValues = function(parentType) {
        		 var childArrays= ScheduleSummaryReportService.loadChildHierarchy(parentType);
        		 angular.forEach(childArrays, function(entityType) {
        			 $scope[entityName(entityType)] = [];
        		 });	 
        	 };
	        	 
    	 	 //Called when any value is selected from any entity dropdown
        	 $scope.selectedEntityType = function(parentId,parentType) {
        		 if(parentId ==null){
        			 $scope.resetChildValues(parentType);
	        	 } else {			        	 
		        	 $scope.selectedEntityId = parentId;
		        	 $scope.entityType = parentType;
		        	 if(parentType != "STUDENT") {
			        		$scope.populateChildValues(parentId,parentType);
		        	 }
	        	 }
		      };
			      
		      $scope.isValuePresent = function(value) {
		    	  if(value) return true;
		    	  else return false;
		      };
		      
		      $scope.isDateValue = function(value) {
		    	  if(angular.isDate(value)) return true;
		    	  else return false;
		      };
			
	         $scope.reportTypeFlag = function(reportType){
	        	 if(EntityService.isEntityAllowed(reportType)) {
	        		 return true;
	        	 }
	        	 return false;
	         };
		         
	         $scope.scheduledDate = [];
	         $scope.format = "yyyy-MM-dd";
	         
	         
	         $scope.api = ScheduleSummaryReportService;
	         $scope.$watch('api.searchSchedule', function(newv, oldv) {
	        	 if(newv) {
		        	 $scope.actionFn({institutionId:$scope.institutionId, 
			 			 facilityId:$scope.facilityId, 
			 			 scheduledDate: $scope.$parent.scheduledDate});
		        	 $scope.scheduledDate = $scope.$parent.scheduledDate;
		        	 $scope.api.searchSchedule = '';
	        	 }
	         });		        
		},
		link:function(scope, element, attrs) {
			scope.doAction = function() {
	        	 scope.actionFn({institutionId:scope.institutionId, 
	        		 			 facilityId:scope.facilityId, 
	        		 			 scheduledDate: scope.scheduledDate});
	         };
		}
	};
});


testadmin.filter("assessmentNameFilter", function(){
    return function(input, type, assessments){
    	var assessmentName = input;
	    	if (type === 'ASSESSMENT') {
	    	angular.forEach(assessments, function(assessment){
	    		  if (input == assessment.id) {
	    			  assessmentName = assessment.testName;
	    			  return;
	    		  }
	    	});
	    }
        return assessmentName;
    };
});
