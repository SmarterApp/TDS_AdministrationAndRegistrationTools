testreg.controller('ScheduleSummaryController', ['$scope', '$state','$window', 'ScheduleSummaryService',  'EntityService', 'ScheduleSummaryReportService', 'FacilityAvailabilityService',
     function ($scope, $state,$window, ScheduleSummaryService, EntityService, ScheduleSummaryReportService, FacilityAvailabilityService) {
	
	var S = $scope; 				//Simple Shorthands for $scope
	var _ = ScheduleSummaryService; 
	S._   = ScheduleSummaryService; //Expose service to view
	
	if(!$state.current.searchParams) {
			S.searchParams = {"name":"","sortKey":"name", "sortDir":"asc", "currentPage": 1, "scheduledDate": ""};
		}else{
			S.searchParams = $state.current.searchParams;
		}
  		S.searchResponse = {};
  		
  		S.scheduledDate = new Date();
		
  		
		S.getHghestNumberOfColsInARow = function(rowLists) {
			
			var maxRows = 0;
			angular.forEach(rowLists, function(rowList){
				if(rowList.length > maxRows) {
					maxRows = rowList.length;
				}
			});
			return maxRows;
		};
		
		S.getRowsForDisplay = function(timeSlots) {
			var rowList = [];
			angular.forEach(timeSlots, function(timeSlot, timeSlotIndex) {			
				var index = 0;
				angular.forEach(timeSlot.seats, function(seat) {
					if(seat.seatScheduled || seat.manuallyScheduled) {
						var rowListI = rowList[index++];
						
						if(angular.isUndefined(rowListI)) {
							rowListI = [];
							
							for(var i=0; i< timeSlotIndex; i++) {
								rowListI.push("");
								rowListI.push("");
								rowListI.push("");
								rowListI.push("");
							}					
							rowList.push(rowListI);	
						}
						rowListI.push(seat.student.entityId);
						rowListI.push(seat.student.lastName+", "+seat.student.firstName);
						rowListI.push(seat.assessment.testName);
						rowListI.push(_.getAccessibilityEquipmentText(seat.accessibilityEquipments));
					}
				});
			});
			
			//Pad Spaces where there are no values
			var maxCols = S.getHghestNumberOfColsInARow(rowList);
			angular.forEach(rowList, function(rowIndexed) {
				for(var i=0; i<maxCols-rowIndexed.length; i++) {
					rowIndexed.push("");
					rowIndexed.push("");
					rowIndexed.push("");
					rowIndexed.push("");
				}				
			});
			S.numberOfRowsDisplayed = rowList.length;
			return rowList;
		};
		
		
		//Default TimeSlot displays
		S.startTimeSlotNum = 0; 		
		S.totalTimeSlots = 0;
		S.timeSlotsDisplayStep = 2;
		S.endTimeSlotNum   = S.timeSlotsDisplayStep;
		
		var setScheduledDay = function(scheduledDay) {
			S.scheduledDay = _.getFormattedDate(scheduledDay.day, "yyyy-MM-dd");
		};
		
		var setFacilityNameAndId = function(facility) {
			S.facilityName = facility.facilityName;
			S.facilityId   = facility.id;
		};
		
		var setInstitutionName = function(institutionId) {
			S.institutionId   = institutionId;
			EntityService.getEntity('INSTITUTION', institutionId).then(function(response){
				S.institutionName = response.data.entityName;
			});			
		};
				
		var setTimeSlots = function(timeSlots) {
			if(!angular.isDefined(timeSlots)) {
				timeSlots = S.schedule.scheduledDays[0].facilities[0].timeSlots;
			}
			S.timeSlotsForDisplay = [];
			S.totalTimeSlots = timeSlots.length;
				
			angular.forEach(timeSlots, function(timeSlot, index){
				if(index >= S.startTimeSlotNum && index < S.endTimeSlotNum) {
					_.getFacilityTimeSlot(S.facilityId, S.institutionId, S.scheduledDay, timeSlot.originalTimeSlot.id).then(function (timeSlotAvailability){
						timeSlot.totalCapacity = _.getTotalTimeSlotCapacity(timeSlotAvailability.data.seatConfigurations);
						S.timeSlotsForDisplay.push(timeSlot);
					});				
				}
			});				 			
		};
		
		var resetTimeSlotNavigation = function() {
			S.startTimeSlotNum = 0;
			S.endTimeSlotNum   = S.timeSlotsDisplayStep;			
		};
		
		
		S.showNextTimeSlots = function() {
			S.startTimeSlotNum = S.endTimeSlotNum ;
			
			if(S.timeSlotsDisplayStep +S.startTimeSlotNum > S.totalTimeSlots) {
				S.endTimeSlotNum = S.totalTimeSlots;
			} else {
				S.endTimeSlotNum  = S.timeSlotsDisplayStep  + S.startTimeSlotNum;
			}
			setTimeSlots();
		};
		
		S.hasPreviousTimeSlots = function() {			
			if(S.startTimeSlotNum - S.timeSlotsDisplayStep >=0 ) return true;
			else false;
			
		};
		
		S.hasNextTimeSlots = function() {
			if(S.startTimeSlotNum + S.timeSlotsDisplayStep <S.totalTimeSlots) return true;
			else return false;
		};
		
		S.showPrevTimeSlots = function() {					
			S.endTimeSlotNum = S.startTimeSlotNum;
			S.startTimeSlotNum = S.endTimeSlotNum - S.timeSlotsDisplayStep;
			setTimeSlots();
		};
		
		S.previousScheduledDay = function() {
			resetTimeSlotNavigation();
			S.scheduledDate = _.adjustDays(_.getFormattedDate(S.scheduledDate, "yyyy-MM-dd"), -1);//Previous Day
			ScheduleSummaryReportService.searchSchedule = true; //Trigger findSchedule thru directive
		};
		
		S.nextScheduledDay = function() {
			resetTimeSlotNavigation();
			S.scheduledDate = _.adjustDays(_.getFormattedDate(S.scheduledDate, "yyyy-MM-dd"), 1);//Previous Day
			ScheduleSummaryReportService.searchSchedule = true;//Trigger findSchedule thru directive
		};
			
		S.scheduleFound = "not-yet";
		
		
		S.findSchedule = function(institutionId, facilityId, scheduledDate) {			
			ScheduleSummaryService.getTimeSlots(facilityId, institutionId, _.getFormattedDate(scheduledDate, "yyyy-MM-dd")).then(function(response) {
				if(response.data !="") {
					S.schedule = response.data;
					S.scheduleFound = "found";
					S.scheduledDate = scheduledDate;
					//Set properties from Schedule
					setFacilityNameAndId(S.schedule.scheduledDays[0].facilities[0]);
					setInstitutionName(S.schedule.institutionId);
					setScheduledDay(S.schedule.scheduledDays[0]);
					setTimeSlots(S.schedule.scheduledDays[0].facilities[0].timeSlots);
			} else {
					S.scheduleFound = "not-found";
					S.scheduledDate = scheduledDate;
					S.schedule = [];
					setTimeSlots([]);
				}
			});
		};
		
		S.edit = function(timeSlotNo) {
			var timeSlotIndex = parseInt(S.startTimeSlotNum, 10) + parseInt(timeSlotNo);
			var timeSlot = S.schedule.scheduledDays[0].facilities[0].timeSlots[timeSlotIndex];
  			$state.transitionTo("editScheduleSummary", {
  					timeSlotNum:timeSlotIndex,
  					startTime: timeSlot.originalTimeSlot.startTime,
  					endTime:   timeSlot.originalTimeSlot.endTime,
  					institutionId: S.institutionId, 
  					facilityName: S.facilityName, 
  					facilityId: S.facilityId, 
  					scheduledDay: S.scheduledDay});
  		};
  		
  		S.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){ 
            $state.current.searchParams = S.searchParams;
  		});
     }
]);
