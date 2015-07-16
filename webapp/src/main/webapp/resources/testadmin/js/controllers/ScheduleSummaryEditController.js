testadmin.controller('ScheduleSummaryEditController',['$scope','$state','$window', '$dialogs', 'loadedData', 'timeSlotNum', 'timeSlotAvailability', 'eligibleAssessments', 'EntityService', 'ScheduleSummaryService', 'ProctorService', 'StudentService',
		function($scope, $state, $window, $dialogs, loadedData, timeSlotNum, timeSlotAvailability, eligibleAssessments, EntityService, ScheduleSummaryService, ProctorService, StudentService) {
			
			var S = $scope; 				//Simple Shorthands for $scope. Advantage of re-definition - This will not mask if $scope is used anywhere here
			var _ = ScheduleSummaryService; //Simple Shorthands for ScheduleSummaryService
			S._   = ScheduleSummaryService; //Expose service to view
			
			S.savingIndicator = false;
		    S.schedule = loadedData.data;
		    S.errors = loadedData.errors;
			S.actionButton = '';
			S.formAction = 'Edit';
			
			if(S.schedule) {
				EntityService.getEntity("INSTITUTION", S.schedule.institutionId).then(function(response){
					S.institution = response.data;
				});
				S.facilityName  = S.schedule.scheduledDays[0].facilities[0].facilityName;
				S.scheduledDay  = _.getFormattedDate(S.schedule.scheduledDays[0].day, "yyyy-MM-dd");
				S.timeSlot 		= S.schedule.scheduledDays[0].facilities[0].timeSlots[parseInt(timeSlotNum, 10)];
				S.timeSlotText  = _.getTimeSlotText(S.timeSlot.startTime, S.timeSlot.endTime);
				S.studentScheduledd = S.schedule.creationInfo.studentsNotScheduled;
				S.getCount = function(timeSlot){
					var count=0;
					for(var i=0;i<timeSlot.seats.length;i++){
						if(timeSlot.seats[i].student){
							count++;
						}
					}
					return count;
				};
				
				ProctorService.getProctorsForInstitution(S.schedule.institutionId).then(function(response) {
					var users = [];
					angular.forEach(response.data, function(proctor){
						users.push(proctor.user);
						//Hack to Select the Proctor from the Saved schedule. 
						//If Proctor-User and User domain are in sync this should not happen. But itsn't working without this.
						if(proctor.user.id == S.timeSlot.proctor.user.id) {
							S.timeSlot.proctor.user = proctor.user;
						}
					});
					S.users = users;
				});								
			};
			
			S.eligibleAssessments = eligibleAssessments;
			

			var seatConfigsAvailableForSchedule = _.flatMap(timeSlotAvailability.data.seatConfigurations);
			S.totalCapacity = _.getTotalTimeSlotCapacity(timeSlotAvailability.data.seatConfigurations);
			
			S.syncAssessment = function(seat, assessments) {
				angular.forEach(S.timeSlot.seats, function(seatScheduled) {					
					if(_.isSeatScheduledInSystem(seatScheduled) && seatScheduled.student.id == seat.student.id) {						
						angular.forEach(assessments, function(assessment){
							if(assessment.id == seatScheduled.assessment.id) {
								seatScheduled.assessment = assessment;
							}							
						});
					};					
				});
			};							
									
						
			//------All Button Functions
			S.removeStudent = function(index,stdId) {			
				if(S.timeSlot.seats[index].student != null){
					var studentId = S.timeSlot.seats[index].student.entityId;
					S.timeSlot.seats.splice(index, 1);	  
					var asIndex = S.timeSlot.assignedStudents.indexOf(studentId);
					S.timeSlot.assignedStudents.splice(asIndex, 1);	
					S.scheduleSummaryForm.$dirty = true;
				}else{
					for(var i=0;i<S.timeSlot.seats.length;i++){
						if(S.timeSlot.seats[i].student != null){
								var studentId = S.timeSlot.seats[i].student.entityId;
								if(studentId == stdId){
								S.timeSlot.seats.splice(i, 1);	  
								var asIndex = S.timeSlot.assignedStudents.indexOf(studentId);
								S.timeSlot.assignedStudents.splice(asIndex, 1);	
								S.scheduleSummaryForm.$dirty = true;
								break;
							}
								
						}
					}
				}
			};
			
						
			S.selectSeatConfig = function(seatArrayIndex, seatNumber, testPlatform, accessibilityEquipments, stdId) {			
				dlg = $dialogs.create(
						'resources/testadmin/partials/scheduleSummary-seat-selection.html','ScheduleSummarySeatSelectionController',
						{seatConfigurations: seatConfigsAvailableForSchedule, 
							scheduledSeats: S.timeSlot.seats,
							existingConfigurations:{seatNumber: seatNumber, testPlatform: testPlatform, accessibilityEquipments: accessibilityEquipments}},
						{key: false,back: 'static'});
				dlg.result.then(function(selectedSeat) {
					if(selectedSeat.testPlatform != testPlatform || _.getAsText(accessibilityEquipments) != _.getAsText(selectedSeat.accessibilityEquipments)) {
						for(var i=0; i<S.timeSlot.seats.length; i++){
							if(S.timeSlot.seats[i].student != null && S.timeSlot.seats[i].student.entityId === stdId) {
								var seatScheduled = S.timeSlot.seats[i];
								seatScheduled.testPlatform = selectedSeat.testPlatform;
								seatScheduled.accessibilityEquipments = _.getAccessibilityEquipmentList(selectedSeat.accessibilityEquipments);
								seatScheduled.manuallyScheduled = true;
								break;
							}
						}
						S.scheduleSummaryForm.$dirty = true;
					}
				});
			};
			
			S.addStudent = function(){
				dlg = $dialogs.create(
						'resources/testadmin/partials/student-selection.html','StudentSelectionDialogController',
						{institutionIdentifier:S.institution.entityId, 
						 stateAbbreviation: S.institution.stateAbbreviation,
						 scheduleNotStudent: S.schedule.creationInfo,
						 scheduleStudentList : S.schedule.scheduledDays[0].facilities[0].timeSlots[parseInt(timeSlotNum, 10)].assignedStudents},{key: false,back: 'static'});
				dlg.result.then(function(selectedEligibleStudents) {
					angular.forEach(selectedEligibleStudents, function(selectedEligibleStudent) {	
						S.eligibleAssessments.push({id: selectedEligibleStudent.student.id, assessments: selectedEligibleStudent.assessments});
						var checkCount = 0;
						for(var i=0; i<S.timeSlot.seats.length; i++){
							if(S.timeSlot.seats[i].student == null) {
								S.timeSlot.seats.splice(i, 1);
								S.timeSlot.seats.push({manuallyScheduled:true, student:selectedEligibleStudent.student, testPlatformObj:{}, assessment: {}, accessibilityEquipmentObjs: []});
								checkCount ++;
								break;
							}
						}
						if(checkCount == 0){
							S.timeSlot.seats.push({manuallyScheduled:true, student:selectedEligibleStudent.student, testPlatformObj:{}, assessment: {}, accessibilityEquipmentObjs: []});
						}
						S.timeSlot.assignedStudents.push(selectedEligibleStudent.student.entityId);	
					});					 
		            },function(){
		              //no selection made
		            });
			};
			
			S.cancel = function() {
				S.actionButton = 'cancel';
				$state.transitionTo("scheduleSummary");
			};
		
			S.save = function() {
				S.savingIndicator = true;
				
				S.schedule.scheduledDays[0].facilities[0].timeSlots[parseInt(timeSlotNum, 10)] = S.timeSlot;
				_.updateScheduleDay(S.schedule.id, S.schedule.scheduledDays[0]).then(
					function(response) {
						S.savingIndicator = false;
						S.errors = response.errors;
						if (S.errors.length == 0) {
							S.scheduleSummaryForm.$setPristine();
							S.schedule = response.data;
							$state.current.searchParams = {name:S.facilityName, scheduledDate:S.scheduledDay};
							$state.transitionTo("scheduleSummary");
						}
					});
			};			
		
			S.$on('$stateChangeStart',
			function(event, toState, toParams, fromState, fromParams) {
				if (S.scheduleSummaryForm.$dirty && S.actionButton != 'cancel') {
					if (!confirm("You have unsaved changes. Are you sure you want to leave this page?")) {
						event.preventDefault();
					}
				}
			});
} ]);
