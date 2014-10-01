testadmin.controller('StudentSelectionDialogController',function($scope,$modalInstance,data, StudentService){
	$scope.seatConfigurations = data.seatConfigurations;
	$scope.selectedConfigurations = angular.copy($scope.seatConfigurations);
	$scope.filteredConfigurations = [];
	$scope.existingConfigurations = data.existingConfigurations;
	
	$scope.xwalk   = function(label) {
			return $scope.safewalk('Student', label);
	};
	
	$scope.searchParams = {"student.stateAbbreviation":data.stateAbbreviation, "student.institutionIdentifier":data.institutionIdentifier, "student.entityId":"", "findEligibleStudents":"true", "sortKey":"institutionIdentifier", "sortDir":"asc", "currentPage": 1};
	$scope.searchResponse = {};
	$scope.grades = StudentService.loadGrades();
	
	$scope.cancel = function() {
		$modalInstance.dismiss('canceled');  
	};
	
	$scope.eligStudentAssignedCollection = [];
	
	$scope.addStudent = function(eligibleStudentCollection){		
		var indexToRemove = -1;
		
		angular.forEach($scope.eligStudentAssignedCollection, function(eligStudentAssigned, index){
			if(eligStudentAssigned.student.id == eligibleStudentCollection.student.id){
				indexToRemove = index;
			};
		});
		
		if(indexToRemove > -1) { 
			$scope.eligStudentAssignedCollection.splice(indexToRemove, 1);
		}
		
		if(indexToRemove == -1) {
			$scope.eligStudentAssignedCollection.push(eligibleStudentCollection);
		}		
	};
	
	$scope.assignStudents = function() {		
		$modalInstance.close($scope.eligStudentAssignedCollection);		
	};
	
});