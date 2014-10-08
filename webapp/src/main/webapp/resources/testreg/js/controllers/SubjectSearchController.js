testreg.controller('SubjectSearchController', ['$scope', '$state','$window', '$timeout','SubjectService', 'StudentService', 'AssessmentService',
    function ($scope, $state, $window, $timeout, SubjectService, StudentService, AssessmentService ) {
		if(!$state.current.searchParams) {
			$scope.searchParams = {"name":"", "sortKey":"name", "sortDir":"asc", "currentPage": 1};
		}else{
			$scope.searchParams = $state.current.searchParams;
		}
		$scope.errors = [];
		$scope.students= [];
		$scope.assessments=[];
		$scope.searchResponse = {};
		
		$scope.searchSubjects = function (params){
			$scope.errors = [];
			return SubjectService.searchSubjects(params);	
		};

		$scope.searchAssessments = function(subjectId) {
			AssessmentService.findAssessmentBySearchVal(subjectId,'1000000','subjectCode').then(function(response){
				$scope.assessments  = response.data.searchResults;
	        });		
		};
		
		$scope.searchStudents = function(subjectId) {
			params = {"accommodations.subject":subjectId,"currentPage": '0', "pageSize":"1000000"};
			StudentService.searchStudents(params).then(function(response){
				$scope.students = response.data.searchResults;
	        });
		};		
	
		$scope.addSubject = function(){		
			$state.transitionTo("editSubject",{"subjectId":""});
		};
		
		$scope.edit = function(subject) {
			$scope.errors = [];
			$scope.assessments=[];
			var assessmentExists = false;
			$scope.searchAssessments(subject.code);
			$timeout(function() {
				angular.forEach($scope.assessments, function(assessment,index){
					if (assessment.subjectCode === subject.code) {
						assessmentExists = true;
						return;
					}
				});					
				if(assessmentExists) {
					$scope.errors.push("Subject " + subject.code + " cannot be edited because it is associated with assessment(s)");
				} else {
					$state.transitionTo("editSubject", {subjectId:subject.id});
				}
		    }, 300);			

		};
		
		$scope.merge = function(subject) {
			$scope.errors = [];
			$scope.assessments=[];
			var assessmentExists = false;
			$scope.searchAssessments(subject.code);

			$timeout(function() {
				angular.forEach($scope.assessments, function(assessment,index){
					if (assessment.subjectCode === subject.code) {
						assessmentExists = true;
						return;
					}
				});				
				if(assessmentExists) {
					$scope.errors.push("Subject " + subject.code + " cannot be merged because it is associated with assessment(s)");
				} else {
					$state.transitionTo("mergeSubject", {subjectId:subject.id});
				}
		    }, 300);			

		};
		
		$scope.deleteItem = function(subject) {		
			$scope.errors = [];
			$scope.students= [];
			$scope.assessments=[];
			var assessmentExists = false;
			$scope.searchStudents(subject.code);
			$scope.searchAssessments(subject.code);

		    $timeout(function() {
				angular.forEach($scope.assessments, function(assessment,index){
					if (assessment.subjectCode === subject.code) {
						assessmentExists = true;
						return;
					}
				});	
				if($scope.students.length > 0 || assessmentExists) {
					$scope.errors.push("Subject " + subject.code + " cannot be deleted because it is associated with assessment(s) and/or accommodation(s)");
				} else {
					if (!confirm("Are you sure you want to delete this item?")) {
						event.preventDefault();
					} else {
						SubjectService.deleteSubject(subject.id).then(function(response){
							$scope.errors = response.errors;
							if($scope.errors.length == 0){
								window.location.reload();
							}
						});
					}
				}
		    }, 500);

		};

		$scope.$on('$stateChangeStart', function(event, toinstitution, toParams, frominstitution, fromParams){ 
			$state.current.searchParams = $scope.searchParams;
		});
 }
]);