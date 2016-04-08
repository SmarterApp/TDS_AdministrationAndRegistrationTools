var timepicker = angular.module('ui.timepicker', [])

.value('uiTimepickerConfig', {
    'step' : 15,
    'maxTime':'11:45 PM',
    'timeFormat': 'h:i A',
    'scrollDefaultTime': "12:00 AM"
});

var baseUrl =  '';
if(document.getElementById('baseUrl')){
 baseUrl = document.getElementById('baseUrl').value;
}

var testreg = angular.module('testreg', ['ui.state','ui.bootstrap','ngCookies', 'ui.select2','resettableForm','blueimp.fileupload','dialogs', 'ui.timepicker']);
testreg.config(['$stateProvider','$routeProvider', '$provide','$httpProvider', function($stateProvider, $routeProvider, $provide, $httpProvider) {
	
	  //register the interceptor as a service
	  $provide.factory('myHttpInterceptor', function($q) {
			return {
		     'responseError': function(rejection) {
		    	if(rejection.status == 0){
		    		location.reload();
		    	}
		 	    return $q.reject(rejection);
		      }
		    };
	  	});
	  
	  $provide.factory('myHttpInterceptor', function($q) {
		  return function(promise) {
		    return promise.then(function(success) {
		      return success;
		    }, function(rejection) {
		    	if(rejection.status == 0){
		    		location.reload();
		    	}
		      return $q.reject(rejection);
		    });
		  };
		});
	  
	  $httpProvider.responseInterceptors.push('myHttpInterceptor');
	  
$stateProvider
     .state('home', {
        url: "", // root route
        views: {
            "testregview": {
                templateUrl: 'resources/testreg/partials/home.html',
                controller: 'HomeController'
            }
        }
    })
    .state('noTenant', {
        url: "/subscription-needed", 
        views: {
            "testregview": {
                templateUrl: 'resources/testreg/partials/no-tenant.html'
            }
        }
    })
     .state('root', {
        url: "/", // root route
        views: {
            "testregview": {
                templateUrl: 'resources/testreg/partials/home.html',
                controller: 'HomeController'
            }
        }
    }) 
    .state('searchSubject', {
    	url: "/searchSubject",
    	views: {
    		"testregview": {
    			templateUrl: 'resources/testreg/partials/subjects-search.html',
    			controller: 'SubjectSearchController'
    		}
    	}
	
    })    
    .state('editSubject', {
	    url: "/mergeSubject/subject/{subjectId}", 
        resolve: {
        	inputData: function ($state) {
        			return $state.current.searchParams;
        	},        	
        	loadedData:subjectResolver,
        },
	    views: {
	        "testregview": {
	            templateUrl: 'resources/testreg/partials/subjects-form.html',
	            controller: 'SubjectEditController'
	        }
	    }
	}) 
	.state('mergeSubject', {
	    url: "/subject/{subjectId}", 
        resolve: {
        	inputData: function ($state) {
        			return $state.current.searchParams;
        	},        	
        	loadedData:subjectResolver,
        },
	    views: {
	        "testregview": {
	            templateUrl: 'resources/testreg/partials/subjects-merge.html',
	            controller: 'SubjectMergeController'
	        }
	    }
	}) 
    .state('uploadFile', {
        url: "/uploadFile", 
        views: {
            "testregview": {
                templateUrl: 'resources/testreg/partials/upload.html',
                controller: 'ImportFileController'
            }
        }
    })
     .state('uploadStudentGroups', {
        url: "/uploadStudentGroups", 
        views: {
            "testregview": {
                templateUrl: 'resources/testreg/partials/upload.html',
                controller: 'ImportFileController'
            }
        }
    })
      .state('uploadExplicitEligibility', {
        url: "/uploadExplicitEligibility",
        views: {
            "testregview": {
                templateUrl: 'resources/testreg/partials/upload.html',
                controller: 'ImportFileController'
            }
        }
    })
    .state('downloadTemplate', {
        url: "/downloadTemplate", 
        views: {
            "testregview": {
                templateUrl: 'resources/testreg/partials/downloadTemplate.html',
                controller: 'DownloadTemplateController'
            }
        }
    })
	.state('previewFile', {
	    url: "/previewFile/{fileId}", 
        resolve: {
        	loadedData:previewFileResolver,
        	fileId: getFileId,
        	prevActiveLink: function ($state) {
    			return $state.$current.self.name;
        	},         	
        },
	    views: {
	        "testregview": {
	            templateUrl: 'resources/testreg/partials/preview.html',
	            controller: 'PreviewFileController'
	        }
	    }
	})
	.state('validateFile', {
	    url: "/validateFile/{fileId}", 
        resolve: {
        	fileId: getFileId,
        	loadedData:validateFileResolver,
        	prevActiveLink: function ($state) {
    			return $state.$current.self.name;
        	},             	
        },
	    views: {
	        "testregview": {
	            templateUrl: 'resources/testreg/partials/validate.html',
	            controller: 'ValidateFileController'
	        }
	    }
	})
 
	.state('saveFile', {
	    url: "/saveFile/{fileId}", 
        resolve: {
        	loadedData:saveFileResolver,
        	prevActiveLink: function ($state) {
    			return $state.$current.self.name;
        	},         	
        },
	    views: {
	        "testregview": {
	            templateUrl: 'resources/testreg/partials/confirm.html',
	            controller: 'SaveFileController'
	        }
	    }
	})
   .state('clientconfig', {
        url: "/clientconfig",
        resolve: {
        	loadedData:clientResolver,
        },      
        views: {
            "testregview": {
                templateUrl: 'resources/testreg/partials/client-config.html',
                controller: 'ClientController'
            }
         }
     })	
   .state('entities', {
        url: "/entities",
       
        views: {
            "testregview": {
                templateUrl: 'resources/testreg/partials/entities-home.html',
                controller: 'EntitiesHomeController'
            }
         }
     })
     .state('entities.editState', {
         url: "/state/{stateId}/edit/{entityId}/{entityName}", // root route
        resolve: {
        	loadedData:stateResolver,
        },
        views: {
            "entities-home-view": {
                templateUrl: 'resources/testreg/partials/state-form.html',
                controller: 'StateController'
            }
        }
    })	
     .state('entities.searchState', {
        url: "/searchState", // root route
        views: {
            "entities-home-view": {
                templateUrl: 'resources/testreg/partials/state-search.html',
                controller: 'StateSearchController'
            }
        }
    })
    .state('entities.editInstitution', {
         url: "/institution/{institutionId}", // root route
        resolve:{
        	inputData: function ($state) {
    			return $state.current.searchParams;
        	}, 
          	loadedData:institutionResolver,
        },
          views: {
            "entities-home-view": {
                templateUrl: 'resources/testreg/partials/institution-form.html',
                controller: 'InstitutionController'
            }
        }
    })	
     .state('entities.searchInstitution', {
        url: "/searchInstitution", // root route
        views: {
            "entities-home-view": {
                templateUrl: 'resources/testreg/partials/institution-search.html',
                controller: 'InstitutionSearchController'
            }
        }
    })
    
   .state('entities.editGroupOfInstitutions', {
         url: "/groupofinstitutions/{groupofInstitutionsId}", // root route
        resolve:{
        	
        	inputData: function ($state) {
    			return $state.current.searchParams;
        	}, 
          	loadedData:groupofinstitutionsResolver,
        },
          views: {
            "entities-home-view": {
                templateUrl: 'resources/testreg/partials/groupofinstitutions-form.html',
                controller: 'GroupOfInstitutionsController'
            }
        }
    })	
     .state('entities.searchGroupOfInstitutions', {
        url: "/searchGroupOfInstitutions", // root route
        views: {
            "entities-home-view": {
                templateUrl: 'resources/testreg/partials/groupofinstitutions-search.html',
                controller: 'GroupOfInstitutionsSearchController'
            }
        }
    })	
	.state('entities.searchDistrict', {
	    url: "/searchDistrict", // root route
	    views: {
	        "entities-home-view": {
	            templateUrl: 'resources/testreg/partials/district-search.html',
	            controller: 'DistrictSearchController'
	        }
	    }
	})
	.state('entities.editDistrict', {
	    url: "/district/{districtId}", // root route
        resolve: {
        	inputData: function ($state) {
        			return $state.current.searchParams;
        	},
        	loadedData:districtResolver,
        },
	    views: {
	        "entities-home-view": {
	            templateUrl: 'resources/testreg/partials/district-form.html',
	            controller: 'DistrictEditController'
	        }
	    }
	})
	.state('entities.searchGroupOfStates', {
	    url: "/searchGroupOfStates", // root route
	    views: {
	        "entities-home-view": {
	            templateUrl: 'resources/testreg/partials/groupOfStates-search.html',
	            controller: 'GroupOfStatesSearchController'
	        }
	    }
	})
	.state('entities.editGroupOfStates', {
	    url: "/groupofstates/{groupOfStatesId}", // root route
        resolve: {
        	inputData: function ($state) {
        			return $state.current.searchParams;
        	},
        	loadedData:groupOfStatesResolver,
        },
	    views: {
	        "entities-home-view": {
	            templateUrl: 'resources/testreg/partials/groupOfStates-form.html',
	            controller: 'GroupOfStatesEditController'
	        }
	    }
	})
	.state('entities.searchGroupOfDistricts', {
	    url: "/searchGroupOfDistricts", // root route
	    views: {
	        "entities-home-view": {
	            templateUrl: 'resources/testreg/partials/groupOfDistricts-search.html',
	            controller: 'GroupOfDistrictsSearchController'
	        }
	    }
	})
	.state('entities.editGroupOfDistricts', {
	    url: "/groupofdistricts/{groupOfDistrictsId}", // root route
        resolve: {
        	inputData: function ($state) {
        			return $state.current.searchParams;
        	},
        	loadedData:groupOfDistrictsResolver,
        },
	    views: {
	        "entities-home-view": {
	            templateUrl: 'resources/testreg/partials/groupOfDistricts-form.html',
	            controller: 'GroupOfDistrictsEditController'
	        }
	    }
	})
	 .state('userProfile', {
        url: "/user/profile",
        resolve: {
        	inputData: function ($state) {
    			return $state.current.searchParams;
        	}, 
        	prevActiveLink: function ($state) {
    			return $state.$current.self.name;
        	},          	
          	loadedData:sbacUserResolver,
          	roles:rolesResolver,
        },      
        views: {
            "testregview": {
                templateUrl: 'resources/testreg/partials/profile-form.html',
                controller: 'UserProfileController'
            }
         }
     })
     .state('editUser', {
         url: "/user/{userId}", // root route
        resolve:{
        	inputData: function ($state) {
    			return $state.current.searchParams;
        	}, 
        	prevActiveLink: function ($state) {
    			return $state.$current.self.name;
        	},          	
          	loadedData:userResolver,
          	roles:rolesResolver,
        },
          views: {
            "testregview": {
                templateUrl: 'resources/testreg/partials/user-form.html',
                controller: 'UserController'
            }
        }
    })	
    .state('searchUser', {
        url: "/searchUser", // root route
        views: {
            "testregview": {
                templateUrl: 'resources/testreg/partials/user-search.html',
                controller: 'UserSearchController'
            }
        }
    })
    .state('searchStudent', {
        url: "/searchStudent", // root route
        views: {
            "testregview": {
                templateUrl: 'resources/testreg/partials/student-search.html',
                controller: 'StudentSearchController'
            }
        }
    })
    .state('searchStudentGroup', {
        url: "/searchStudentGroup", // root route
        views: {
            "testregview": {
                templateUrl: 'resources/testreg/partials/student-group-search.html',
                controller: 'StudentGroupSearchController'
            }
        }
    })
    .state('searchAssessment', {
    	url: "/searchAssessment",
    	views: {
    		"testregview": {
    			templateUrl: 'resources/testreg/partials/assessment-search.html',
    			controller: 'AssessmentSearchController'
    		}
    	}
	
    })
	.state('searchTSBAssessment', {
    	url: "/searchTSBAssessment",
    	views: {
    		"testregview": {
    			templateUrl: 'resources/testreg/partials/assessment-tsb-search.html',
    			controller: 'AssessmentTSBSearchController'
    		}
    	}
	
    })  
    .state('editStudent', {
	    url: "/student/{studentId}", // root route
        resolve: {
        	inputData: function ($state) {
        			return $state.current.searchParams;
        	},
        	prevActiveLink: function ($state) {
    			return $state.$current.self.name;
        	},          	
        	loadedData:studentResolver,
        	
        },
	    views: {
	        "testregview": {
	            templateUrl: 'resources/testreg/partials/student-form.html',
	            controller: 'StudentEditController'
	        }
	    }
	})
    .state('editStudentGroup', {
	    url: "/studentGroup/{studentGroupId}", // root route
        resolve: {
        	inputData: function ($state) {
        			return $state.current.searchParams;
        	},
        	prevActiveLink: function ($state) {
    			return $state.$current.self.name;
        	},          	
        	loadedData:studentGroupResolver,
        },
	    views: {
	        "testregview": {
	            templateUrl: 'resources/testreg/partials/student-group-form.html',
	            controller: 'StudentGroupEditController'
	        }
	    }
	})	
	.state('editAssessment', {
	    url: "/editAssessment/{assessmentId}", // root route
        resolve: {
        	inputData: function ($state) {
        			return $state.current.searchParams;
        	},
        	prevActiveLink: function ($state) {
    			return $state.$current.self.name;
        	},  
        	tsbNav : cancelLink,
        	loadedData:assessmentResolver,
        },
	    views: {
	        "testregview": {
	            templateUrl: 'resources/testreg/partials/assessment-form.html',
	            controller: 'AssessmentEditController'
	        }
	    }
	})
	.state('editProctor', {
	   url: "/editProctor/{userId}", // root route
	   resolve: {
		   inputData: userResolver,
		   loadedData: proctorResolver,
	   },
	   views: {
	       "testregview": {
	           templateUrl: 'resources/testreg/partials/proctor-form.html',
	           controller: 'ProctorController'
	       }
	   	}
	})
	.state('importAssessment', {
    url: "/importAssessment/", // root route
    resolve: {
    	inputData: function ($state) {
    			return $state.current.searchParams;
    	},
    	prevActiveLink: function ($state) {
			return $state.$current.self.name;
    	}, 
    	tsbNav : cancelImportLink,
    	loadedData:importAssessmentResolver,
    	
    },
    views: {
        "testregview": {
            templateUrl: 'resources/testreg/partials/assessment-form.html',
            controller: 'AssessmentEditController'
        }
    }
	});
}]);


testreg.filter('joinBy', function () {
    return function (input,delimiter) {
        return (input || []).join(delimiter || ',');
    };
});


var previewFileResolver = ['$stateParams','PreviewFileService', function ($stateParams, PreviewFileService) {
	if($stateParams.fileId) {
		return PreviewFileService.previewFile($stateParams.fileId); 	
	} else {
		return {	
			fileId: $stateParams.fileId,
			data:{},
			errors:[]
		};
	}	
	}];

var stateResolver = ['$stateParams','StateService', function ($stateParams, StateService) {
	
	if($stateParams.stateId) {
		return StateService.loadState($stateParams.stateId); 
	} else {
		return {
			
			data:{entityId:$stateParams.entityId,entityName:$stateParams.entityName},
			errors:[]
		};
	}							
	}];
var institutionResolver = ['$stateParams','InstitutionService', function ($stateParams, InstitutionService) {
	
	if($stateParams.institutionId){
		return InstitutionService.loadInstitution($stateParams.institutionId); 
	} else {
		return {
			data:{},
			errors:[]
		};
	}							
	}];
var userResolver = ['$stateParams','UserService', function ($stateParams, UserService) {
	
	if($stateParams.userId){
		return UserService.loadUser($stateParams.userId); 
	} else {
		return {
			data:{},
			errors:[]
		};
	}							
	}];

var rolesResolver = ['UserService', function (UserService) {
	return UserService.loadRoles(); 							
	}];

var proctorResolver = ['$stateParams', 'ProctorService', function($stateParams, ProctorService){
	if($stateParams.userId){
		return ProctorService.loadProctor($stateParams.userId); 
	} else {
		return {
			data:{},
			errors:[]
		};
	}							
}];

var groupofinstitutionsResolver = ['$stateParams','GroupOfInstitutionsService', function ($stateParams, GroupOfInstitutionsService) {
	
	if($stateParams.groupofInstitutionsId){
		return GroupOfInstitutionsService.loadGroupOfInstitutions($stateParams.groupofInstitutionsId); 
	} else {
		return {
			data:{},
			errors:[]
		};
	}							
	}];
var validateFileResolver = ['$stateParams','ValidateFileService', function ($stateParams, ValidateFileService) {
	if($stateParams.fileId) {
		return ValidateFileService.validateFile($stateParams.fileId); 
	} else {
		return {
			data:{},
			errors:[]
		};
	}							
	}];

var saveFileResolver = ['$stateParams','SaveFileService', function ($stateParams, SaveFileService) {
	if($stateParams.fileId) {
		return SaveFileService.saveFile($stateParams.fileId); 
	} else {
		return {
			data:{},
			errors:[]
		};
	}							
	}];

var saveFileResolver = ['$stateParams', 'SaveFileService', function ($stateParams, SaveFileService) {
	if($stateParams.fileId) {
		return SaveFileService.saveFile($stateParams.fileId); 
	} else {
		return {
			data:{},
			errors:[]
		};
	}							
	}];

var getFileId = ['$stateParams', function ($stateParams) {
	return $stateParams.fileId;
}];
var cancelLink = ['$stateParams', function ($stateParams) {
	return false;
}];
var cancelImportLink = ['$stateParams', function ($stateParams) {
	return true;
}];
var districtResolver = ['$stateParams','DistrictService', function ($stateParams, DistrictService) {
	
	if($stateParams.districtId) {
		return DistrictService.loadDistrict($stateParams.districtId); 
	} else {
		return {
			data:{},
			errors:[]
		};
	}											
	}];

var groupOfStatesResolver = ['$stateParams','GroupOfStatesService', function ($stateParams, GroupOfStatesService) {
	
	if($stateParams.groupOfStatesId) {
		return GroupOfStatesService.loadGroupOfStates($stateParams.groupOfStatesId); 
	} else {
		return {
			data:{},
			errors:[]
		};
	}											
	}];

var groupOfDistrictsResolver = ['$stateParams','GroupOfDistrictsService', function ($stateParams, GroupOfDistrictsService) {
	
	if($stateParams.groupOfDistrictsId) {
		return GroupOfDistrictsService.loadGroupOfDistricts($stateParams.groupOfDistrictsId); 
	} else {
		return {
			data:{},
			errors:[]
		};
	}											
	}];

var studentResolver = ['$stateParams','StudentService', function ($stateParams, StudentService) {
	
	if($stateParams.studentId) {
		return StudentService.loadStudent($stateParams.studentId); 
	} else {
		return {
			data:{},
			errors:[]
		};
	}											
	}];
var studentGroupResolver = ['$stateParams','StudentGroupService', function ($stateParams, StudentGroupService) {
	
	if($stateParams.studentGroupId) {
		return StudentGroupService.loadStudentGroup($stateParams.studentGroupId); 
	} else {
		return {
			data:{},
			errors:[]
		};
	}											
	}];
var assessmentResolver = ['$stateParams','AssessmentService', function ($stateParams, AssessmentService) {
	
	if($stateParams.assessmentId) {
		return AssessmentService.loadAssessment($stateParams.assessmentId); 
	} else {
		return {
			data:{},
			errors:[]
		};
	}											
	}];

var importAssessmentResolver = ['$stateParams','AssessmentService', function ($stateParams, AssessmentService) {
	return AssessmentService.getAssessmentData();
	}];

var clientResolver = ['ClientService', function (ClientService) {
			return ClientService.loadClient(); 
	}];

var sbacUserResolver = ['UserService', function (UserService) {
	return UserService.getCurrentUser(); 
}];

var subjectResolver = ['$stateParams','SubjectService', function ($stateParams, SubjectService) {
	
	if($stateParams.subjectId) {
		return SubjectService.loadSubject($stateParams.subjectId); 
	} else {
		return {
			data:{},
			errors:[]
		};
	}											
	}];


