/*jshint smarttabs: true */

testreg.directive("searchable",['$http','$parse', function($http, $parse){
	return {
		restrict:"A",
		scope:{
			searchPromise:'&',
			searchUrl:'@',
			searchParams:'=',
			searchResponse:'=',
			searchPostProcess: '&',			
			searchOverwriteUrl:'='
		},
		transclude :true,
		templateUrl: 'resources/testreg/partials/searchable.html',
		controller: function($scope, $attrs) {
			this.search = function(searchParams){
				$scope.searchResponse.searching = true;
				var url = "";
				if($attrs.searchUrl) {
					url = $scope.$eval($attrs.searchUrl) + '/?_=' + Math.random();
				} else {
					url = $scope.searchOverwriteUrl  + '/?_=' + Math.random();
				}
				//make sure we have a valid number
				var pageNum = (searchParams.currentPage+'').replace(/\D/g, '') *1;
				searchParams.currentPage = pageNum > 0 ? pageNum:1;
				var params = JSON.parse(JSON.stringify(searchParams));
				params.currentPage = params.currentPage -1;
				if($attrs.searchPromise) {
					$scope.searchPromise({params:params}).then(function(response) {
						if(response.errors && response.errors.length > 0){
							$scope.errors = response.errors;
						}else{
							$scope.errors =[];
							$scope.searchResponse = response.data;
							$scope.searchResponse.currentPage = ($scope.searchResponse.currentPage *1) +1;
							var modVal = (($scope.searchResponse.totalCount*1) % ($scope.searchResponse.pageSize*1));
							if(modVal == 0){
								$scope.searchResponse.lastPage = parseInt((($scope.searchResponse.totalCount*1) / ($scope.searchResponse.pageSize*1)));
							}else{
								$scope.searchResponse.lastPage = parseInt((($scope.searchResponse.totalCount*1) / ($scope.searchResponse.pageSize*1))) + 1;
							}
							if ($scope.searchPostProcess) {
								if($scope.searchResponse.searchResults) {
		    						$.each($scope.searchResponse.searchResults, function(index,result) {
		    						    $scope.searchPostProcess({response:result});
		    			            });
								} 
							}							
						}
						$scope.searchResponse.searching = false;
						
					});	
				} else {
					$http.get(baseUrl + url, {params:params}).success(function(data) {
						$scope.errors =[];
						$scope.searchResponse = data;
						$scope.searchResponse.currentPage = ($scope.searchResponse.currentPage *1) +1;
						var modVal = (($scope.searchResponse.totalCount*1) % ($scope.searchResponse.pageSize*1));
						if(modVal == 0){
							$scope.searchResponse.lastPage = parseInt((($scope.searchResponse.totalCount*1) / ($scope.searchResponse.pageSize*1)));
						}else{
							$scope.searchResponse.lastPage = parseInt((($scope.searchResponse.totalCount*1) / ($scope.searchResponse.pageSize*1))) + 1;
						}
						if ($scope.searchPostProcess) {
							if($scope.searchResponse.searchResults) {
	    						$.each($scope.searchResponse.searchResults, function(index,result) {
	    						    $scope.searchPostProcess({response:result});
	    			            });
							} 
						}						
					}).error(function (data, status, headers, config) {
						$scope.errors =[];
						for(var field in data.messages){
							for(var messages in data.messages[field]){
								$scope.errors.push(data.messages[field][messages]);
							}
						}
						$scope.searchResponse.searching = false;
						return status;
					});						
				}
			};
			
			this.changePage = function(){
				this.search($scope.searchParams);
			};
			
			this.filterChange = function(){
				$scope.searchParams.currentPage = 1;
				this.search($scope.searchParams);
			};
			
			this.sortChange = function(sortKey, element){
				element.parent().children().removeClass("headerSortDown headerSortUp");
		        if ($scope.searchParams.sortKey == sortKey && $scope.searchParams.sortDir == "asc") {
		        	 $scope.searchParams.sortDir = "desc";
		        	 element.addClass('headerSortDown');
		        } else if ($scope.searchParams.sortKey == sortKey && $scope.searchParams.sortDir == "desc") {
		        	 $scope.searchParams.sortDir = "asc";
		        	 element.addClass('headerSortUp');
		        } else {
		        	 $scope.searchParams.sortKey = sortKey;
		        	 $scope.searchParams.sortDir = "asc";
		        	 element.addClass('headerSortUp');
		        }
				this.search($scope.searchParams);
			};
			
			this.search($scope.searchParams);
		},
		link:function(scope, element, attrs){
			
		}
	};
}]);


testreg.directive("searchOnClick", function(){
	return {
		restrict:"A",
		require:"^searchable",
		scope:{
			activeIndicator:'='
		},
		transclude:false,
		link : function(scope, element, attrs, searchableController) {
			element.bind("click", function(){
				searchableController.filterChange();
			});
		}
	};
});

testreg.directive("sortOnClick", function(){
	return {
		restrict:"A",
		require:"^searchable",
		transclude:false,
		link:function(scope, element, attrs, searchableController){
			element.bind('mouseenter', function(){
	            element.addClass('columnHover');
	            element.addClass('headerSortHover');
	        })
	        .bind('mouseleave', function(){
	        	element.removeClass('columnHover');
	        	element.removeClass('headerSortHover');
	        })
			.bind("click", function(){
				searchableController.sortChange(attrs.sortColumn, element);
			});	
		}
	};
});

testreg.directive("export", function($window, $timeout, EntityService){
	return {
		restrict:"A",
		transclude :true,
		scope:true,
		templateUrl: 'resources/testreg/partials/export.html',
		controller: function($scope, $attrs) {
	  		$scope.exportSearchResults = function(fileType) {
	  	
	  			var  endpoint = $attrs.export + "." + fileType;
	  			//Query URL for current page should less than one
	  			$scope.searchParams.currentPage = $scope.searchParams.currentPage-1;
	  			var paramValues = $.param($scope.searchParams);
	  			//To display page  Values
	  			$scope.searchParams.currentPage = $scope.searchParams.currentPage+1;
	  			$window.open(baseUrl + endpoint + '?'+ paramValues);
	  		};
	  		$scope.exportAllResults = function(fileType) {
	  			EntityService.getExportLimit().then(function(response){
	  				$scope.pageLimit=response;
	  			});
                $timeout(function() {
                	$scope.searchParams.currentPage = '0';
    	  			var paramValues = $.param($scope.searchParams);
    	  			var  endpoint = $attrs.export + "." + fileType + '?pageSize='+$scope.pageLimit+"&"+paramValues;
    	  			$window.open(baseUrl + endpoint);
                }, 300);
	  		};
		},
		link:function(scope, element, attrs){}
	};
});

testreg.directive("loadParentEntities", function(EntityService){
	return {
		restrict:"A",
		transclude:false,
		scope:false,
		controller: function($scope, $attrs, $element) {
			var parentEntityType = $scope.$eval($attrs.ngModel);
			if(parentEntityType) {
				$scope.selectedParentEntities = EntityService.loadParentEntities(parentEntityType);	
			}
		},
		link:function(scope, element, attrs){
			element.bind("change", function(){
				scope.resetParent();
				scope.selectedParentEntities = EntityService.loadParentEntities(attrs.loadParentEntities);		
				scope.$apply();
			});
		}
	};
});


testreg.directive("pageable", function(){
	return {
		restrict:"A",
		transclude :true,
		require:"^searchable",
		scope:{
			pagingInfo:'=',
			searchParams:'=',
			changePage:'&'
		},
		templateUrl: 'resources/testreg/partials/pageable-table.html',
		controller: function($scope, $attrs) {

			$scope.nextPage = function(){
				$scope.searchParams.currentPage = $scope.searchParams.currentPage + 1;
				$scope.changePage();
			};
			$scope.prevPage = function(){
				$scope.searchParams.currentPage = $scope.searchParams.currentPage - 1;
				$scope.changePage();
			};
			$scope.lastPage = function(){
				
				$scope.searchParams.currentPage = $scope.pagingInfo.lastPage;
				$scope.changePage();
			};
			$scope.firstPage = function(){
				$scope.searchParams.currentPage = 0;
				$scope.changePage();
			};
		},
		link:function(scope, element, attrs, searchableCtrl){
			scope.changePage = function() {
				searchableCtrl.changePage();
			};
		}
	};
});

testreg.directive("districtAutoComplete", function(DistrictService, $timeout) {
    return {
        restrict : "A",
        replace: true,
        require: ["ngModel"],
        scope:true,
        transclude : false,
        controller : function($scope, $attrs) {
        	if ($scope.student && $scope.student.id) {
	        	 $scope.district = DistrictService.loadDistrict($scope.student.districtEntityMongoId).then(
	    			 function(loadedData) {
	    				 return loadedData.data;
	    			 }
	        	 );
        	}

            $scope.filterDistricts = function(searchVal, pageSize) {           	
            	var state = '';
            	if (!$scope.searchParams) {
            		state = $scope.student.stateAbbreviation;
            	} else {
            		$scope.searchParams.districtIdentifier = searchVal;
            		state = $scope.searchParams.stateAbbreviation;
            	}
            	
            	if (!state) {
                  	 return DistrictService.findDistrictByEntityId(searchVal).then(
                   			 function(loadedData) {
                   				return loadedData.data.searchResults;
                   			 }
                       	 );
            	}
            	else {
	                return DistrictService.findDistrictsBySearchValAndState(searchVal, state, pageSize).then(
	                    function(loadedData) {
	                        return loadedData.data.searchResults;
	                    }
	                );
            	}
            };
        },
        link : function(scope, element, attrs, ctrls) {
        	$(element).bind('focus', function() {
                $timeout(function() { // timeout necessary for IE10 to work..
                    ctrls[0].$setViewValue(ctrls[0].$viewValue ? ctrls[0].$viewValue : " ");
                }, 1);
            });
        	
			element.bind("change", function(){
				scope.changeDistrictId(scope.$eval(attrs.ngModel));
			});	
        }
    };
});

testreg.directive("districtAutoCompleteStudentGroup", function(DistrictService, $timeout) {
    return {
        restrict : "A",
        replace: true,
        require: ["ngModel"],
        scope:true,
        transclude : false,
        controller : function($scope, $attrs) {
        	if ($scope.studentGroup && $scope.studentGroup.id) {
	        	 $scope.district = DistrictService.loadDistrict($scope.studentGroup.districtEntityMongoId).then(
	    			 function(loadedData) {
	    				 return loadedData.data;
	    			 }
	        	 );
        	}

            $scope.filterDistricts = function(searchVal, pageSize) {           	
            	var state = '';
            	if (!$scope.searchParams) {
            		state = $scope.studentGroup.stateAbbreviation;
            	} else {
            		$scope.searchParams.districtIdentifier = searchVal;
            		state = $scope.searchParams.stateAbbreviation;
            	}
            	
            	if (!state) {
	            	return DistrictService.findDistrictByEntityId(searchVal).then(
	           			 function(loadedData) {
	           				return loadedData.data.searchResults;
	           			 }
	               	 );
            	}
            	else {
	                return DistrictService.findDistrictsBySearchValAndState(searchVal, state, pageSize).then(
	                    function(loadedData) {
	                        return loadedData.data.searchResults;
	                    }
	                );
            	}
            };
        },
        link : function(scope, element, attrs, ctrls) {
        	
        	$(element).bind('focus', function() {
                $timeout(function() { // timeout necessary for IE10 to work..
                    ctrls[0].$setViewValue(ctrls[0].$viewValue ? ctrls[0].$viewValue : " ");
                }, 1);
            });
        	
			element.bind("change", function(){
				scope.changeDistrictId(scope.$eval(attrs.ngModel));
			});	
        }
    };
});

testreg.directive("institutionAutoComplete", function(InstitutionService, GroupOfInstitutionsService, $timeout) {
    return {
        restrict : "A",
        replace: true,
        require: ["ngModel"],
        scope:true,
        transclude : false,
        controller : function($scope, $attrs) {
        	if ($scope.student && $scope.student.id) {
           	 	$scope.institution = InstitutionService.loadInstitution($scope.student.institutionEntityMongoId).then(
           			 function(loadedData) {
           				 return loadedData.data;
           			 }
           	 	);
           	}
            $scope.filterInstitutions = function(searchVal, pageSize) { 
            	var stateId = '';
            	var districtId = '';
            	if (!$scope.searchParams) {
            		stateId = $scope.student.stateAbbreviation;
            		districtId = $scope.student.districtIdentifier;
            	} else {
            		$scope.searchParams.institutionIdentifier = searchVal;
            		stateId = $scope.searchParams.stateAbbreviation;
            		districtId = $scope.searchParams.districtIdentifier;
            	}
            	if (!districtId) {
            		if(stateId) {
            			return InstitutionService.findInstitutionsByState(searchVal, stateId, pageSize).then(
                     			 function(loadedData) {
                     				 return loadedData.data.searchResults;
                     			 }
                     	 	);
            		} else {
	            		return InstitutionService.findInstitutionByEntityId(searchVal).then(
	                  			 function(loadedData) {
	                  				 return loadedData.data.searchResults;
	                  			 }
	                  	 	);
            		}
            	}
            	else {
                	
	                return InstitutionService.findAllInstitution(searchVal, stateId, districtId, pageSize).then(
	            		function(loadedData) {
	            			return loadedData.data.searchResults;
	            		});
            	}
  
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

testreg.directive("institutionAutoCompleteStudentGroup", function(InstitutionService, GroupOfInstitutionsService, $timeout) {
    return {
        restrict : "A",
        replace: true,
        require: ["ngModel"],
        scope:true,
        transclude : false,
        controller : function($scope, $attrs) {
        	if ($scope.studentGroup && $scope.studentGroup.id) {
           	 	$scope.institution = InstitutionService.loadInstitution($scope.studentGroup.institutionEntityMongoId).then(
           			 function(loadedData) {
           				 return loadedData.data;
           			 }
           	 	);
           	}
            $scope.filterInstitutions = function(searchVal, pageSize) {            	
            	var stateId = '';
            	var districtId = '';
            	if (!$scope.searchParams) {
            		stateId = $scope.studentGroup.stateAbbreviation;
            		districtId = $scope.studentGroup.districtIdentifier;
            	} else {
            		$scope.searchParams.institutionIdentifier = searchVal;
            		stateId = $scope.searchParams.stateAbbreviation;
            		districtId = $scope.searchParams.districtIdentifier;
            	}
            	
            	if (!districtId) {
            		if(stateId) {
            			return InstitutionService.findInstitutionsByState(searchVal, stateId, pageSize).then(
                     			 function(loadedData) {
                     				 return loadedData.data.searchResults;
                     			 }
                     	 	);
            		} else {
	            		return InstitutionService.findInstitutionByEntityId(searchVal).then(
	                  			 function(loadedData) {
	                  				 return loadedData.data.searchResults;
	                  			 }
	                  	 	);
            		}            		
            	}
            	else {
	                return InstitutionService.findInstitutionsByStateAndDistrict(searchVal, stateId, districtId, pageSize).then(
	            		function(loadedData) {
	            			var institutions = loadedData.data.searchResults;
	            			return GroupOfInstitutionsService.findAllByDistrict(districtId, pageSize).then(function (groupOfInsByDist) {
	            				var groupOfIns = groupOfInsByDist.data.searchResults;
	            				return InstitutionService.findAllGroupOfInstitutionsParentByState(searchVal, stateId, pageSize).then(function (ins) {
	            					var instsGrouOfInsParent = ins.data.searchResults;
	            					
	            					angular.forEach(groupOfIns, function(a){
	            						angular.forEach(instsGrouOfInsParent, function(b){
	            							if(b.parentEntityId === a.entityId){
	            								institutions = institutions.concat(b);
	            							}
	            						});
	            					});
	                				return institutions;
	            					
	            				});
	            			});
	                    }
	                );
            	}
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

testreg.directive("accommodationEditor", function(AccommodationService){
	return {
		restrict:"A",
		scope: true,
		templateUrl: 'resources/testreg/partials/accommodation-editor.html',
		controller: function($scope, $attrs) {	
			$scope.americanSignLanguage 			= AccommodationService.americanSignLanguage();
			$scope.colorContrast 					= AccommodationService.colorContrast();
			$scope.closedCaptioning 				= AccommodationService.closedCaptioning();
			$scope.language 						= AccommodationService.language();
			$scope.masking 							= AccommodationService.masking();
			$scope.permissiveMode			 		= AccommodationService.permissiveMode();
			$scope.printOnDemand 					= AccommodationService.printOnDemand();
			$scope.printSize 						= AccommodationService.printSize();
			$scope.streamlinedInterface 			= AccommodationService.streamlinedInterface();
			$scope.textToSpeech 					= AccommodationService.textToSpeech();
			$scope.translation 						= AccommodationService.translation();
			$scope.nonEmbeddedDesignatedSupports 	= AccommodationService.nonEmbeddedDesignatedSupports();
			$scope.nonEmbeddedAccommodations 		= AccommodationService.nonEmbeddedAccommodations();
			$scope.accommodationStudentId = $scope.$parent.student.entityId;
			$scope.accommodationStateId = $scope.$parent.student.stateAbbreviation;
		
			$scope.selectedSubject = [];
			$scope.subjects = [[]];
			$scope.rowNumber = 0;
			$scope.isDisabled = false; 
			$scope.onloadSubjectData= [];
			$scope.loaded = false;
			//While loading Filtert the subjects

			$scope.loadSelected = function () {
				angular.forEach($scope.student.accommodations, function(accommodation,index){
					$scope.selectedSubject.push({"rowNum":index,"subjectObj":accommodation.subject});
					accommodation.subject = accommodation.subject.toUpperCase();
					$scope.onloadSubjectData.push(accommodation.subject);
				});
	
				angular.forEach($scope.student.accommodations, function(accommodation,index){
					$scope.subjects[index] = [];
					
					   angular.forEach($scope.subjectData, function(subjectVal,elementIndex){
						   $scope.subjects[index].push(subjectVal);
					   });
					   
					   function isSubjectCachedForDisplay(subjectToCheck) {
						   angular.forEach($scope.subjects, function(subjectCached){
							   if(subjectToCheck == subjectCached) {
								   return true;
							   }
						   });
						   return false;
					   }
					   
					   $scope.rowNumber = index+1;
				});
			};

			 AccommodationService.subjects($scope.accommodationStudentId,$scope.accommodationStateId).then(function (response){
				 $scope.subjectData= response.data;
				 $scope.loadSelected();
			 });
	
		    $scope.removeAccommodation = function (index) {
				if (!confirm("Are you sure you want to delete this item?")) {
					event.preventDefault();
				} else {
					var selSubject=$scope.student.accommodations[index].subject ;
					if(selSubject != null && selSubject != '' ){
						$scope.resetSubject(index,selSubject);
					}
					var length = $scope.student.accommodations.length;
					var subjectArray = new Array();
						var count = 0;
						angular.forEach($scope.subjects, function(subject,arrindex){
							if(index != arrindex){
								subjectArray[count] = subject;
								count++;
							}
						});
						$scope.subjects=subjectArray;
						$scope.student.accommodations.splice(index,1);
						
					}
				   
					$scope.studentForm.$dirty=true;
					$scope.rowNumber = $scope.rowNumber-1;
					
				
			};			
			
			$scope.removeSelectedSubject = function(index,subject){
				var changedSubject = null;
				var subIndexVal = -1;
				angular.forEach($scope.selectedSubject, function (existingSubject,subindex){
					if(index == existingSubject.rowNum){
						changedSubject = existingSubject.subjectObj;
						subIndexVal = subindex;
						
					}
				});
				if(subIndexVal != -1){
					$scope.selectedSubject.splice(subIndexVal,1);
				}
				return changedSubject;
			};
			
			$scope.refreshSubject = function(subject,index){
				var changedSubject = $scope.removeSelectedSubject(index,subject);
				$scope.selectedSubject.push({"rowNum":index,"subjectObj":subject});
		    	angular.forEach($scope.subjects, function(subjectArray,parentIndex){
		    		if(parentIndex !=  index){
						if(changedSubject != null){
		    				subjectArray.push(changedSubject);
		    			}		    			
			    		angular.forEach(subjectArray, function(subjectVal,elementIndex){
			    			if(subjectVal == subject){
			    				subjectArray.splice(elementIndex,1);
			    			}
			    		});
		    		}
		    	});
			};			

			$scope.resetSubject = function(index,subject){
				angular.forEach($scope.selectedSubject, function (existingSubject,subindex){
					if(existingSubject.subjectObj == subject){
						$scope.selectedSubject.splice(subindex,1);
					}	
				});
				angular.forEach($scope.subjects, function(subjectArray){
					subjectArray.push(subject);
				});
				
			};
			
			$scope.addItem = function(){
				var accSub = new Array();
				angular.forEach($scope.student.accommodations, function(accommodation,index){
					accSub[index] = accommodation.subject;
				});
				$scope.subjects[$scope.rowNumber] = angular.copy($scope.subjectData);
				if($scope.selectedSubject != null){
					var count = 0;
					angular.forEach($scope.subjectData, function(subjectVal,elementIndex){
						if(accSub.indexOf(subjectVal) != -1){
							$scope.subjects[$scope.rowNumber].splice(elementIndex-count,1);
		    				count++;
		    			}		
					});

				}		
				
				if($scope.subjectData.length !=0 && $scope.rowNumber < $scope.subjectData.length){
						if(!$scope.student.accommodations) {
							$scope.student.accommodations=[];
						} 
						$scope.student.accommodations.push({"studentId":$scope.student.entityId,"stateAbbreviation":$scope.student.stateAbbreviation,
							"subject":"","americanSignLanguage":"", "colorContrast":"","closedCaptioning":"","language":"","masking":"","permissiveMode":"",
							"printOnDemand":"", "printSize":"","streamlinedInterface":"","textToSpeech":"","translation":"","nonEmbeddedDesignatedSupports":"",
							"nonEmbeddedAccommodations":"", "other":""});
						$scope.rowNumber++;
						$scope.studentForm.$dirty=true;
				}
			};

        },
		link:function(scope, element, attrs){
		
		}
	};
});

testreg.directive('formatDate', function ($filter) {
    return {
	    restrict: 'A',
	    require: 'ngModel',
        link: function (scope, element, attrs, ctrl) {
            ctrl.$formatters.unshift(function (modelValue) {
            	if(modelValue) {
            		return $filter('date')(modelValue, attrs.formatDate);
            	}
            });         
        },
    };
});

testreg.directive('dateParser', function($filter){
	return {
		restrict: 'A',
		require: 'ngModel',
		link: function(scope, element, attrs, ctrl){
			ctrl.$formatters.unshift(function (modelValue) {
            	if(modelValue && (angular.isString(modelValue)) ) { //Thinks format is yyyy-MM-dd
            		var y = modelValue.substr(0, 4),
                    m = modelValue.substr(5,2) - 1,
                    d = modelValue.substr(8,2);
            		var D = new Date(y,m,d);
            		var res = (D.getFullYear() == y && D.getMonth() == m && D.getDate() == d) ? D : '';
            		if(res) {
            			ctrl.$pristine = false; //Do not allow ctrl to set $dirty
            			ctrl.$setViewValue(new Date(res));
            			return new Date(res);
            		}
            	} else if(modelValue && angular.isDate(modelValue)) {
            		return $filter('date')(modelValue, "yyyy-MM-dd");
            	}
            });  
		},
	};
});

testreg.directive("deleteConfirmation", function(){
	return {
		restrict:"A",
		scope:true,
		transclude:false,
		link : function(scope, element, attrs) {
			element.bind("click", function(){
				if (!confirm("Are you sure you want to delete this item?")) {
					event.preventDefault();
				} else {
					scope.deleteItem(attrs.deleteConfirmation);
				}
			});
		}
	};
});

testreg.directive("loadParentNames", function($timeout ,EntityService){
	return {
		restrict:"A",
		transclude:false,
		scope:false,
		controller: function($scope, $attrs, $element) {
			$scope.parentEntities = [];
			$scope.savingIndicator = true;
			
			$timeout( function(){
		    	$scope.loadParents();
		    }, 500 );
		    
		    $scope.$watch('searchResponse', function() {
		    	$scope.loadParents();
		    }, true);
		    
			$scope.loadParents = function() {
		    	angular.forEach($scope.searchResponse.searchResults, function(entity){
		    		
		    		if(entity.formatType == "USER") {
		    			angular.forEach(entity.roleAssociations, function(roleAssociation){
		    				$scope.setParent(roleAssociation.level, roleAssociation.associatedEntityMongoId);
		    			});
		    		} else if (entity.formatType == "STUDENT" || entity.formatType == "STUDENTGROUP") {
		    			$scope.setParent("DISTRICT", entity.districtEntityMongoId);
		    			$scope.setParent("INSTITUTION", entity.institutionEntityMongoId);
		    		} else {	
		    			$scope.setParent(entity.parentEntityType, entity.parentId);
		    		}
		    	});
		    	$scope.savingIndicator = false;
			};
			
			$scope.setParent = function(type, id) {
					EntityService.getEntity(type, id).then(function(loadedData) {
						$scope.parentEntities.push({id:loadedData.data.id, entityId:loadedData.data.entityId, entityName:loadedData.data.entityName});			
					});
			};
		},
		link:function(scope, element, attrs){
		}
	};
});

testreg.directive('accessibleTable', function() {
	return {
		restrict: 'A',
		scope: true,
		link: function(scope, el) {
			
			var isMenu = false;
			var keys = {left: 37, up: 38, right: 39, down: 40};
			var parentTypes = [];
			
			var siblingIndex = 0;
			
			var firstVisibleField = function(node, tdIndex, leftNav) {
				if (tdIndex !== undefined) {
					node = node.children[tdIndex];
				}
				if (node) {
					var descendants = node.getElementsByTagName('*');
					if(leftNav) {
						for (var i = descendants.length - 1; i >= 0; i--) {
							if ((descendants[i].nodeName === 'INPUT' || descendants[i].nodeName === 'BUTTON' || descendants[i].nodeName === 'SELECT')
									&& descendants[i].offsetHeight > 0 && descendants[i].offsetWidth > 0 && !descendants[i].disabled) {
								siblingIndex = i;
								return descendants[i];
							}
						}
					} else {
						for (var i = 0; i < descendants.length; i++) {
							if ((descendants[i].nodeName === 'INPUT' || descendants[i].nodeName === 'BUTTON' || descendants[i].nodeName === 'SELECT')
									&& descendants[i].offsetHeight > 0 && descendants[i].offsetWidth > 0 && !descendants[i].disabled) {
								siblingIndex = i;
								return descendants[i];
							}
						}
					}
				}
				return undefined;
			}
			
			scope.focusNext = function(event, node, startInput) {
				var key = event.which;
				event.preventDefault();
			
				// check for siblings
				var sibling = startInput;
				var fieldFound = false;
				do {
					sibling = (key === keys.left || key === keys.up ? sibling.previousElementSibling : sibling.nextElementSibling);
					
					angular.forEach(parentTypes, function(parentType) {
						if(sibling != null && sibling.nodeName === parentType && sibling.offsetHeight > 0 && sibling.offsetWidth > 0 && !sibling.disabled) {
							fieldFound = true;
						}
					});
				} while(sibling != null && !fieldFound);
				
				if(sibling != null) {
					destinationInput = sibling;
					
				} else {
					//walk along the TDs until we find one that has a visible input within it
					var parentNodeName = 'TD';
					if(isMenu) {
						parentNodeName = 'DIV';
					}
					do {
						node = (key === keys.left ? node.previousElementSibling : node.nextElementSibling);
						if (node && node.nodeName === parentNodeName) {
							siblingIndex = 0;
							destinationInput = firstVisibleField(node, undefined, key === keys.left);
						} else {
							return;  //no more TDs available - we're done here
						}
					} while (!destinationInput);
				}
				return destinationInput;
			};
		  
			el.bind('keydown', function(event) {
				var key = event.which;
			  
				//start at the currently focused element, must be an input for this to continue
				var startInput = document.activeElement;
				if(startInput.nodeName == 'LI') {
					parentTypes = ["DIV", "LI"];
					isMenu = true;
				} else if (startInput.nodeName !== 'INPUT' && startInput.nodeName !== 'BUTTON' && startInput.nodeName !== 'SELECT') {
					return;
				} else {
					parentTypes = ["INPUT", "BUTTON", "SELECT"];
				}
				
				var destinationInput;
				var node = startInput;
				var count = 0;
				var parentNodeName = 'TD';
				if(isMenu) {
					parentNodeName = 'DIV';
				}
			  
				//look for the startInput's TD
				do {
					node = node.parentNode;
					count++;
				} while (node && node.nodeName !== parentNodeName || count == 10);
				
				if (!node) {
					return;  //ill-formed html
				}

				// keys.left, keys.right
				if (key === keys.left || key === keys.right) {				  				  		
					destinationInput = scope.focusNext(event, node, startInput);
					
				// keys.down, keys.up
				} else if (key === keys.up || key === keys.down) {
					if(isMenu) {
						destinationInput = scope.focusNext(event, node, startInput);
					} else {
						event.preventDefault();
						
						var tdIndex = node.cellIndex;
						var count = 0;
	
						do { //find the TR
							node = node.parentNode;
							count++;
						} while (node && node.nodeName !== 'TR' || count == 10);
						
						if (!node) {
							return;  //ill-formed html
						}
	
						do {
							node = (key === keys.up ? node.previousElementSibling : node.nextElementSibling);
							if (node && node.nodeName === 'TR') {
								destinationInput = firstVisibleField(node, tdIndex);
							} else {
								return;  //no more rows or ill-formed html
							}
						} while (!destinationInput);
					}
				}

				if (destinationInput) {
					destinationInput.focus();
					if(!isMenu) {
						startInput.setAttribute("tabindex", "-1");
						destinationInput.setAttribute("tabindex", "0");
					}
				}
			})
		}
	}
});

testreg.directive('dragDrop', function() {
	return {
		restrict: 'A',
        
        controller : function($scope, $attrs) {
			
            $scope.getSelectedRow = function(eventTarget) {
            	var selectedRow = eventTarget;
            	while(selectedRow.parentNode != null && selectedRow.attributes["draggable"] == null) {
            		selectedRow = selectedRow.parentNode;
            	}
            	return selectedRow; 
            };
        	
        	$scope.toggleDragged = function(index, event, sortedList) {
        		var selectedRow = $scope.getSelectedRow(event.target);
  				
	  			switch(event.keyCode) {
	  			
	  			case 32:  // Space
	  				if(selectedRow.getAttribute("aria-grabbed") == "true") {
	  	  				selectedRow.setAttribute("aria-grabbed", false);
	  	  				selectedRow.setAttribute("aria-droppeffect", "none");
	  	  				selectedRow.className = selectedRow.className.replace(/\ draggable\b/, "");
	  				} else {
	  	  				selectedRow.setAttribute("aria-grabbed", true);
	  	  				selectedRow.setAttribute("aria-droppeffect", "move");
	  	  				selectedRow.className += " draggable";
	  				}
	  				break;
	  				
	  			case 37 :  // Left arrow
				case 38 :  // Up arrow
					var previousSibling = selectedRow.previousElementSibling;
					if (previousSibling != null) {
						if(selectedRow.getAttribute("aria-grabbed") == "true") {
							previousSibling = selectedRow.previousElementSibling;
							if (previousSibling != null) {
								var selectedObject = sortedList[index];
								var previousObject = sortedList[index - 1];
								
								if(selectedObject != null && previousObject != null && index > 0) {
									sortedList[index] = previousObject;
									sortedList[index - 1] = selectedObject;
									$scope.sortChanged = true;
									index++;
								}
							}
						} else {
							previousSibling.focus();
						}
					}
					event.preventDefault();
					break;
				
				case 39 :  // Right arrow
				case 40 :  // Down arrow
					var nextSibling = selectedRow.nextElementSibling;
					if (nextSibling != null) {
						if(selectedRow.getAttribute("aria-grabbed") == "true") {
							nextSibling = selectedRow.nextElementSibling;
							if (nextSibling != null) {
								var selectedObject = sortedList[index];
								var nextObject = sortedList[index + 1];
								
								if(selectedObject != null && nextObject != null && index < sortedList.length) {
									sortedList[index] = nextObject;
									sortedList[index + 1] = selectedObject;
									$scope.sortChanged = true;
									index++;
								}
							}
						} else {
							nextSibling.focus();
						}
					}
					event.preventDefault();
					break;
	  				
	  			case 27:  // Escape
	  			case 9:  // Tab
	  				selectedRow.setAttribute("aria-grabbed", false);
	  				selectedRow.setAttribute("aria-droppeffect", "none");
	  				selectedRow.className = selectedRow.className.replace(/\ draggable\b/, "");
	  				break;
	  			}
        	};
        	
        	$scope.unfocusDragged = function(event) {
        		var selectedRow = $scope.getSelectedRow(event.target);
				selectedRow.setAttribute("aria-grabbed", false);
				selectedRow.setAttribute("aria-droppeffect", "none");
				selectedRow.className = selectedRow.className.replace(/\ draggable\b/, "");
        	};
		},
        
		link:function(scope, element, attrs){

		}
	}
});

testreg.directive('widgetNavigation', function() {
	return {
		restrict: 'A',
		scope: true,
		
		controller: function($scope, $attrs) {
			$scope.focusElement = function(elementId) {
				var foundElement = document.getElementById(elementId);
				document.getElementById(elementId).focus();
			};
		},
        
		link:function(scope, element) {
			
			scope.processPreviousSibling = function(previousSibling) {
				if(previousSibling && previousSibling.getAttribute("class") != null) {
					var hidden = previousSibling.getAttribute("class").indexOf("ng-hide") > -1;
					
					if(hidden) {
						scope.processPreviousSibling(previousSibling.previousElementSibling);
					} else {
						event.target.setAttribute("tabindex", -1);
						previousSibling.setAttribute("tabindex", 0);
						previousSibling.focus();
					}
				}
			};
			
			scope.processNextSibling = function(nextSibling) {
				if(nextSibling && nextSibling.getAttribute("class") != null) {
					var hidden = nextSibling.getAttribute("class").indexOf("ng-hide") > -1;
					
					if(hidden) {
						scope.processNextSibling(nextSibling.nextElementSibling);
					} else {
						event.target.setAttribute("tabindex", -1);
						nextSibling.setAttribute("tabindex", 0);
						nextSibling.focus();
					}
				}
			};
			
			element.bind('keydown', function(event) {
  				
	  			switch(event.keyCode) {
	  			
	  			case 13:  // Enter
	  			case 32:  // Space
	  				event.target.click();
	  				event.preventDefault();
	  				break;
	  				
	  			case 37 :  // Left arrow
				case 38 :  // Up arrow
					scope.processPreviousSibling(event.target.previousElementSibling);
					event.preventDefault();
					break;
				
				case 39 :  // Right arrow
				case 40 :  // Down arrow
					scope.processNextSibling(event.target.nextElementSibling);
					event.preventDefault();
					break;
	  			}
        	});
		}
	}
});

testreg.directive('enter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
        	// Enter or Space
            if(event.which === 13 || event.which === 32) {
                scope.$apply(function (){
                    scope.$eval(attrs.enter);
                });

                event.preventDefault();
            }
        });
    };
});

testreg.filter("parentNameFilter", function(){
    return function(text, type, parentEntities){    	
    	var parentName = "";
    	angular.forEach(parentEntities, function(entity){
    		  if (text == entity.id) {
    			  parentName = entity.entityName;
    			  return;
    		  }
    	});
        return parentName;
    };
});

timepicker.directive('uiTimepicker', ['uiTimepickerConfig', function(uiTimepickerConfig) {
    return {
        restrict: 'A',
        require: 'ngModel',
        priority: 1,
        link: function(scope, element, attrs, ngModel, ctrl) {
    		
    		function zfill(num, len) {return (Array(len).join("0") + num).slice(-len);}
    		
    		function formattedTime(date) {
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

            element.on('changeTime', function() {
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


testreg.directive('capitalize', function(uppercaseFilter) {
	   return {
	     require: 'ngModel',
	     link: function(scope, element, attrs, modelCtrl) {
	        var capitalize = function(inputValue) {
	        	if(inputValue) {
		           var capitalized = inputValue.toUpperCase();
		           if(capitalized !== inputValue) {
		              modelCtrl.$setViewValue(capitalized);
		              modelCtrl.$render();
		            }         
		           return capitalized;
	        	}else {
	        		return "";
	        	}
	         };
	         modelCtrl.$parsers.push(capitalize);
	         capitalize(scope[attrs.ngModel]);
	     }
	   };
});

testreg.filter("testStatusFilter", function(){
    return function(input, teststatuses){
    	var status = "";
    	angular.forEach(teststatuses, function(teststatus){
    		  if (input == teststatus.assessmentId) {
    			  status = teststatus.statusValue;
    			  return;
    		  }
    	});
        return status;
    };
});