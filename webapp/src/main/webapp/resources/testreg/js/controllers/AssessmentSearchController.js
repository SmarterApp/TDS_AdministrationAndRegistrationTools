testreg.controller('AssessmentSearchController', ['$scope', '$state','$window', 'AssessmentService', 'CurrentUserService','StudentService',
    function ($scope, $state,$window, AssessmentService, CurrentUserService,StudentService) {
	 $scope.activeLink = $state.$current.self.name;
	 
	 $scope.isActiveLink = function(link){
		return  $scope.activeLink.indexOf(link) == 0; 
	 };
		if(!$state.current.searchParams) {
			$scope.searchParams = {"entityId":"", "testName":"", "testWindow.beginWindow":"", "testWindow.endWindow":"", "numGlobalOpportunities":"", "tenantId":"", "sortKey":"entityId", "sortDir":"asc", "currentPage": 1};
		}else{
			$scope.searchParams = $state.current.searchParams;
		}
		
		var splitExp = function(property) {
			var tokens =  property.split('searchParams.')[1];
			return tokens+'.opened';
		};
		
		$scope.addDateWatchers(['searchParams.beginWindow', 'searchParams.endWindow'], splitExp, $scope);
		
		//set tenant id
		$scope.searchParams.tenantId = CurrentUserService.getTenantId();
		$scope.xwalk   = function(label) {
			return $scope.safewalk('Assessment', label);
		};
	
		$scope.searchResponse = {};
		$scope.eligibilityTypes = AssessmentService.loadEligibilityTypes();
		
		//DatePicker format
		$scope.format = "yyyy-MM-dd";
		
  		$scope.edit = function(assessment) {
  			$state.transitionTo("editAssessment", {assessmentId:assessment.id});
  		};
  		

  		$scope.changeAssessmentTestName = function(selectedItem){
  			$scope.searchParams.testName = selectedItem.testName;
		};
		$scope.changeTestName = function(testName){
  			$scope.searchParams.testName = testName;
  		};  		
  		$scope.formatAssessmentTestName = function(assessment) {
  			if(assessment) {
  	  			return assessment.testName; 				
  			}else{
  				return $scope.searchParams.testName;
  			}
  		};  

		$scope.changeAssessmentId = function(selectedItem){
  			$scope.searchParams.entityId = selectedItem.entityId;
		}; 
		$scope.changeEntityId = function(entityId){
  			$scope.searchParams.entityId = entityId;
  		}; 		
  		$scope.formatAssessmentId = function(assessment) {
  			if(assessment) {
  	  			return assessment.entityId; 				
  			}else{
  				return $scope.searchParams.entityId;
  			}
  		};  
 
 		$scope.changeAssessmentSubjectCode = function(selectedItem){
  			$scope.searchParams.subjectCode = selectedItem.subjectCode;
		};
		$scope.changeSubjectCode = function(subjectCode){
  			$scope.searchParams.subjectCode = subjectCode;
  		};  		
  		$scope.formatAssessmentSubjectCode = function(assessment) {
  			if(assessment) {
  	  			return assessment.subjectCode; 				
  			}else{
  				return $scope.searchParams.subjectCode;
  			}
  		};  
		StudentService.loadGrades().then(function(response){
			$scope.grades = response;
		});

		$scope.changeAssessmentGrade = function(selectedItem){
  			$scope.searchParams.grade = selectedItem.grade;
		}; 
		$scope.changeGrade = function(grade){
  			$scope.searchParams.grade = grade;
  		}; 		
  		$scope.formatAssessmentGrade = function(assessment) {
  			if(assessment) {
  	  			return assessment.grade; 				
  			}else{
  				return $scope.searchParams.grade;
  			}
  		};  
  		
  		$scope.deleteItem = function(assessmentId) {
  			AssessmentService.deleteAssessment(assessmentId).then(function(response){
				$scope.errors = response.errors;
				if($scope.errors.length == 0){
					$state.current.searchParams = '';
					$window.location.reload();
				}
			});
  		};
  		
  		$scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){ 
            $state.current.searchParams = $scope.searchParams;
  		});
  		
  		
	
 	}
]);