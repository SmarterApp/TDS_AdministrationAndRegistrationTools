
testreg.controller('SubjectEditController',['$scope','$state', '$timeout', 'loadedData', 'SubjectService', 'StudentService', 'inputData',
    function($scope, $state, $timeout, loadedData, SubjectService, StudentService, inputData) {
		$scope.savingIndicator = false;
		$scope.errors = loadedData.errors;
		$scope.subject = loadedData.data;
		$scope.actionButton = '';
		$scope.formAction = 'Add';
		$scope.students =[];
		$scope.accommodations = [];
		$scope.accomCount = 0;
		$scope.originalSubject = angular.copy(loadedData.data);
		
		if($scope.subject && $scope.subject.id){
			$scope.formAction = 'Edit';		
		} else {
			if(inputData) {
				$scope.subject.name = inputData.name;
			}
		}
		
		$scope.searchStudents = function(subjectId) {
			params = {"accommodations.subject":subjectId,"currentPage": '0', "pageSize":"1000000"};
			StudentService.searchStudents(params).then(function(response){
				$scope.students = response.data.searchResults;
	        });
		};	
		
		$scope.save = function(subject){
			$scope.searchStudents($scope.originalSubject.code);
			$timeout(function() {
				angular.forEach($scope.students, function(student,index){
					angular.forEach(student.accommodations, function(accommodation,accindex){
						if (accommodation.subject === $scope.originalSubject.code) {
							$scope.accomCount = $scope.accomCount + 1;
						}
					});
				});
				
				var updateSubject = true;
	    		if ($scope.accomCount > 0) {
	    			updateSubject = false;
	    			var confirmMsg = "There are " + $scope.accomCount + " accommodation(s) associated with original subject " + $scope.originalSubject.code 
	    								+ ". Saving this subject will update all the associated accommodation(s) with the new subject " 
	    								+ subject.code + ". Are you sure you want to continue?";
	    			if(!confirm(confirmMsg)){
	    				updateSubject = false;
	    				event.preventDefault();
	    			} else {
	    				updateSubject = true;
	    			}   	
		    	}
	    		if (updateSubject) {
	    			$scope.savingIndicator = true;
	    			SubjectService.saveSubject(subject).then(function(response){
	    				$scope.savingIndicator = false;
	    				$scope.errors = response.errors;
	    				if($scope.errors.length == 0){
	    					$scope.subjectForm.$setPristine();
	    					$scope.subject = response.data;
	    					$state.transitionTo("searchSubject");
	    				}
	    			});    			
	    		}				
			}, 300);

		};
    
		$scope.cancel = function() {
			$scope.actionButton = 'cancel';
			$state.transitionTo("searchSubject");
		};
		
  		$scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){ 
    		if ($scope.subjectForm.$dirty) {
    			if(!confirm("You have unsaved changes. Are you sure you want to leave this page?")){
    				event.preventDefault();
    			}    	
	    	}
  		});
	}
]);
