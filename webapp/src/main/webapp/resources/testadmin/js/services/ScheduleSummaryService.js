testadmin.factory("ScheduleSummaryService", function($http, $filter, $rootScope, ScheduleService, FacilityAvailabilityService){
	var service =  {
		getResource : function() {
			return ScheduleService.getResource();
		},
		
		getHttp : function() {
			return ScheduleService.getHttp();
		},
		
		getBaseUrl : function() {
			return ScheduleService.getBaseUrl();
		},
		
		updateScheduleDay: function(scheduleId, scheduledDay) {
			return this.patch(scheduleId, scheduledDay);
		},
		
		getEntityLabel : function(enName) {
				if($rootScope.entityNameLabels) {
					return $rootScope.entityNameLabels[enName];
				} else {
					return enName;
				}				
		},
		
		getFormattedDate: function(date, format){
	    	return $filter('date')(date, format);
	    },
	    	    
	    getTimeSlots: function(facilityName, institutionId, scheduledDay) {
	    	var url = this.getBaseUrl() + this.getResource();
	    	url = url + "/"+institutionId + "/"+facilityName+"/"+scheduledDay;
	    	return  this.getHttp()({
	            method: 'GET',
	            url: url,
		    }).then(this.successHandler, this.errorHandler);			
	    },
	    
	    getFacilityTimeSlot: function(facilityId, institutionId, scheduledDay, timeSlotId) {
	    	return FacilityAvailabilityService.getTimeSlot(facilityId, institutionId, scheduledDay, timeSlotId);
	    },
	    
	    adjustDays: function(date, adjustment) {
	    	var DAY_OFFSET   = parseInt(1, 10) ;
	    	var MONTH_OFFSET = parseInt(1, 10);
	    	
	    	var dateAdjusted = new Date();
	    	dateAdjusted.setFullYear(this.getFormattedDate(date, "yyyy"));
	    	dateAdjusted.setMonth(this.getFormattedDate(date, "MM")  - MONTH_OFFSET); //Month Offset
	    	var day = parseInt(this.getFormattedDate(date, "dd"),10) + DAY_OFFSET + parseInt(adjustment, 10);
	    	dateAdjusted.setDate(day); 
			return dateAdjusted;
	    },
	    
	    getDateObj: function(date) {
	    	return this.adjustDays(date, 0);
	    },
	    
	    getTimeComponent: function(date) {
			var timeComponent = this.getFormattedDate(date, "hh") 
										+ ":" 
										+ this.getFormattedDate(date, "mm") + " " 
										+ this.getFormattedDate(date, "a");
			return timeComponent;
		},
		
		getAccessibilityEquipmentText: function(accessibilityEquipmentList) {
			var concatanatedString = "";
			angular.forEach(accessibilityEquipmentList, function(accessibilityEquipment, index){
				if(index == 0) {
					concatanatedString = concatanatedString + accessibilityEquipment;
				} else {
					concatanatedString = concatanatedString + ", " + accessibilityEquipment;
				}
			});
			return concatanatedString;
		},
		getAccessibilityEquipmentList : function(accessibilityEquipmentText) {
			var isBlank = function isBlank(str) {
			    return (!str || /^\s*$/.test(str));
			};
			return isBlank(accessibilityEquipmentText) ? []: accessibilityEquipmentText.split(",");
		},
		
		getSeatsForFacility: function(facilityName, institutionIdentifier) {
			var searchParams = {"facilityName":facilityName, 
									"institutionIdentifier":institutionIdentifier, 
									"sortKey":"facilityName", 
									"sortDir":"asc", 
									"currentPage": 0};
			return FacilityAvailabilityService.search(searchParams);			
		},
		
		getTotalTimeSlotCapacity: function(seatConfigurations) {
			var totalCapacity = 0;
			angular.forEach(seatConfigurations, function(seatConfiguration){
				totalCapacity = totalCapacity + parseInt(seatConfiguration.numberOfSeats, 10);
			});	
			return totalCapacity;
		},
		
		getFullName: function(user) {
			if(user)
				return user.lastName + ", "+ user.firstName;
			else if(user === null)
				return "";
		},
		
		getTimeSlotText: function(startDateTime, endDateTime) {
			return this.getTimeComponent(startDateTime) +" - " +  this.getTimeComponent(endDateTime);
		},
		
		flatMap: function(array) {
			var result = [];
			angular.forEach(array, function(arrayElement){
				result = result.concat(arrayElement);
			});	
			return result;
		},
		
		getSubColumnList : function(timeSlots) {
			var subColumnList = [];
			angular.forEach(timeSlots, function(timeSlot){
				subColumnList.push("Student Id");
				subColumnList.push("Student Name");
				subColumnList.push("Test Name");
				subColumnList.push("Accessibility Equipment");
			});
			
			return subColumnList;
		},
		
		isSeatScheduledInSystem: function(seatScheduled){
			return (seatScheduled.manuallyScheduled || seatScheduled.seatScheduled);
		},
    };
	
	return angular.extend(service, BaseService);
});