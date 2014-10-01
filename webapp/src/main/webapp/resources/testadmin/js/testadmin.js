var timepicker = angular.module('ui.timepicker', [])

.value('uiTimepickerConfig', {
    'step' : 15,
    'maxTime':'11:45 PM',
    'timeFormat': 'h:i A',
    'scrollDefaultTime': "08:15AM"
});

var testadmin = angular.module('testadmin', ['testreg','ui.timepicker']);
testadmin.config(['$stateProvider','$routeProvider', '$httpProvider', function($stateProvider, $routeProvider, $httpProvider) {
	$httpProvider.defaults.headers.patch = {'Content-Type': 'application/json;charset=utf-8'};
$stateProvider
	//add states here. try to prefix states with 'ta-' so we would not have state conflicts
.state('testadmin', {
   url: "/testadmin", // root route
   views: {
       "testregview": {
           templateUrl: 'resources/testadmin/partials/home.html',
           controller: 'HomeController'
       }
   }
})
.state('edittestplatforms', {
    url: "/testplatform/{testPlatFormId}", // root route
   resolve: {
   	loadedData:testPlatFormResolver,
   },
   views: {
       "testregview": {
           templateUrl: 'resources/testadmin/partials/testPlatForm-form.html',
           controller: 'TestPlatFormController'
       }
   }
})	
.state('searchTestPlatform', {
   url: "/searchTestPlatform", // root route
   views: {
       "testregview": {
           templateUrl: 'resources/testadmin/partials/testPlatForm-search.html',
           controller: 'TestPlatFormSearchController'
       }
   }
})
.state('searchAccessibilityEquipment', {
   url: "/searchAccessibilityEquipment", // root route   
   views: {
       "testregview": {
           templateUrl: 'resources/testadmin/partials/accessibility-search.html',
           controller: 'AccessibilitySearchController'
       }
   }
})
.state('editAccessibilityEquipment', {
    url: "/accessibilityEquipment/{accessibilityEquipmentId}", // root route
   resolve: {
   	loadedData:accessibilityResolver,
   },
   views: {
       "testregview": {
           templateUrl: 'resources/testadmin/partials/accessibility-form.html',
           controller: 'AccessibilityController'
       }
   }
})
.state('searchFacility', {
   url: "/searchFacility", 
   views: {
       "testregview": {
           templateUrl: 'resources/testadmin/partials/facility-search.html',
           controller: 'FacilitySearchController'
       }
   }
})
.state('editFacility', {
    url: "/facility/{facilityId}", // root route
   resolve: {
   	loadedData:facilityResolver,
   },
   views: {
       "testregview": {
           templateUrl: 'resources/testadmin/partials/facility-form.html',
           controller: 'FacilityController'
       }
   }
})	
.state('searchFacilityAvailability', {
   url: "/searchFacilityAvailability", 
   views: {
       "testregview": {
           templateUrl: 'resources/testadmin/partials/facility-availability-search.html',
           controller: 'FacilityAvailabilitySearchController'
       }
   }
})
.state('editFacilityAvailability', {
    url: "/facilityAvailability/{facilityAvailabilityId}", // root route
   resolve: {
   	loadedData:facilityAvailabilityResolver,
   },
   views: {
       "testregview": {
           templateUrl: 'resources/testadmin/partials/facility-availability-form.html',
           controller: 'FacilityAvailabilityController'
       }
   }
})	
.state('searchSchedule', {
    url: "/searchSchedule", // root route
   views: {
       "testregview": {
           templateUrl: 'resources/testadmin/partials/schedule-search.html',
           controller: 'ScheduleSearchController'
       }
   }
})
.state('editSchedule', {
   url: "/editSchedule/{scheduleId}",
   resolve: {
	   	loadedData:scheduleResolver,
   },
   views: {
       "testregview": {
           templateUrl: 'resources/testadmin/partials/schedule-form.html',
           controller: 'ScheduleController'
       }
   }
})
.state('viewSchedule', {
   url: "/viewSchedule/{scheduleId}",
   resolve: {
	   	loadedData:scheduleResolver,
   },
   views: {
       "testregview": {
           templateUrl: 'resources/testadmin/partials/schedule-view.html',
           controller: 'ScheduleController'
       }
   }
})
.state('participationReports', {
   url: "/participationReports", // root route
   views: {
       "testregview": {
           templateUrl: 'resources/testadmin/partials/participation-reports-home.html',
           controller: 'ReportController'
       }
   }
})
.state('participationReports.summary', {
   url: "/participationSummaryReport", // root route
   views: {
       "reportsview": {
           templateUrl: 'resources/testadmin/partials/participation-summary-report.html',
           controller: 'ReportController'
       }
   }
})
.state('participationReports.details', {
   url: "/participationDetailReport", // root route
      views: {
       "reportsview": {
           templateUrl: 'resources/testadmin/partials/participation-details-report.html',
           controller: 'ReportController'
       }
   }
})
.state('proctorScheduleReport', {
   url: "/proctorScheduleReport", // root route
   views: {
       "testregview": {
           templateUrl: 'resources/testadmin/partials/schedule-report.html',
           controller: 'ReportController'
       }
   }
})
.state('studentScheduleReport', {
   url: "/studentScheduleReport", // root route
  views: {
       "testregview": {
           templateUrl: 'resources/testadmin/partials/schedule-report.html',
           controller: 'ReportController'
       }
   }
})
.state('searchProctors', {
   url: "/searchProctors", // root route
   views: {
       "testregview": {
           templateUrl: 'resources/testadmin/partials/proctor-search.html',
           controller: 'ProctorSearchController'
       }
   }
})
.state('searchProctorRoles', {
   url: "/searchProctorRoles", // root route
   views: {
       "testregview": {
           templateUrl: 'resources/testadmin/partials/proctorRole-search.html',
           controller: 'ProctorRoleSearchController'
       }
   }
})
.state('editProctorRole', {
    url: "/proctorRole/{proctorRoleId}", // root route
   resolve: {
   	loadedData:proctorRoleResolver,
   },
   views: {
       "testregview": {
           templateUrl: 'resources/testadmin/partials/proctorRole-form.html',
           controller: 'ProctorRoleController'
       }
   }
})
.state('scheduleSummary', {
   url: "/scheduleSummary", // root route
   views: {
       "testregview": {
           templateUrl: 'resources/testadmin/partials/schedule-summary.html',
           controller: 'ScheduleSummaryController'
       }
   }
})
.state('editScheduleSummary', {
	   url: "/scheduleSummary/{timeSlotNum}/{institutionId}/{facilityId}/{facilityName}/{scheduledDay}/{startTime}/{endTime}", // root route
	   resolve: {
		   	loadedData:scheduleSummaryResolver,
		   	timeSlotNum: timeSlotNumResolver,
		   	eligibleAssessments: eligibleAssessmentResolver,
		   	timeSlotAvailability: timeSlotResolver
	   },
	   views: {
	       "testregview": {
	           templateUrl: 'resources/testadmin/partials/scheduleSummary-form.html',
	           controller: 'ScheduleSummaryEditController'
	       }
	   }
});
}]);
var testPlatFormResolver = ['$stateParams','TestPlatFormService', function ($stateParams, TestPlatFormService) {
	
	if($stateParams.testPlatFormId) {
		return TestPlatFormService.findById($stateParams.testPlatFormId); 
	} else {
		return {
			data:{},
			errors:[]
		};
	}							
}];
var accessibilityResolver = ['$stateParams','AccessibilityService', function ($stateParams, AccessibilityService) {
	if($stateParams.accessibilityEquipmentId) {
		return AccessibilityService.findById($stateParams.accessibilityEquipmentId);
	} else {
		return {
			data:{},
			errors:[]
		};
	}	
}];

var facilityResolver = ['$stateParams','FacilityService', function ($stateParams, FacilityService) {
	
	if($stateParams.facilityId) {
		return FacilityService.findById($stateParams.facilityId); 
	} else {
		return {
			data:{},
			errors:[]
		};
	}							
}];

var facilityAvailabilityResolver = ['$stateParams','FacilityAvailabilityService', function ($stateParams, FacilityAvailabilityService) {
	
	if($stateParams.facilityAvailabilityId) {
		return FacilityAvailabilityService.findById($stateParams.facilityAvailabilityId); 
	} else {
		return {
			data:{},
			errors:[]
		};
	}							
}];

var proctorRoleResolver = ['$stateParams','ProctorRoleService', function ($stateParams, ProctorRoleService) {
	
	if($stateParams.proctorRoleId) {
		return ProctorRoleService.findById($stateParams.proctorRoleId); 
	} else {
		return {
			data:{},
			errors:[]
		};
	}							
}];
var scheduleResolver = ['$stateParams','ScheduleService', function ($stateParams, ScheduleService) {
	
	if($stateParams.scheduleId) {
		return ScheduleService.findById($stateParams.scheduleId); 
	} else {
		return {
			data:{},
			errors:[]
		};
	}							
}];
var scheduleSummaryResolver = ['$stateParams', 'ScheduleSummaryService', function($stateParams, ScheduleSummaryService){
	return ScheduleSummaryService.getTimeSlots($stateParams.facilityName, $stateParams.institutionId, $stateParams.scheduledDay);	
}];

var timeSlotNumResolver = ['$stateParams', function($stateParams){
	return $stateParams.timeSlotNum;
}];

var eligibleAssessmentResolver = ['$stateParams', 'ScheduleSummaryService', 'StudentService', function($stateParams, ScheduleSummaryService, StudentService){
	var eligibleAssessmentsMap = [];
	scheduleSummaryResolver[2]($stateParams, ScheduleSummaryService).then(function(response){
		var timeSlot = response.data.scheduledDays[0].facilities[0].timeSlots[$stateParams.timeSlotNum];		
		angular.forEach(timeSlot.seats, function(seat){
			StudentService.loadStudentEligibleAssessments(seat.student.id).then(function(response) {
				eligibleAssessmentsMap.push({id: seat.student.id, assessments: response.data});
	  		});			
		});
	});
	return eligibleAssessmentsMap;
}];

var timeSlotResolver = ['$stateParams', 'FacilityAvailabilityService', function($stateParams, FacilityAvailabilityService){
	return FacilityAvailabilityService.getTimeSlot($stateParams.facilityId, $stateParams.institutionId, $stateParams.scheduledDay, $stateParams.startTime, $stateParams.endTime);	
}];

//add resolvers here