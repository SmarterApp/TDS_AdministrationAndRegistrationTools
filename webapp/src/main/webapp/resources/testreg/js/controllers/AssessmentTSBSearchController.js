testreg.controller('AssessmentTSBSearchController', ['$scope', '$state','$window', 'AssessmentService', 'CurrentUserService','StudentService',
    function ($scope, $state,$window, AssessmentService, CurrentUserService,StudentService) {

	 $scope.activeLink = $state.$current.self.name;
	 $scope.searchUrl= "tsbassessments/tenant/" + CurrentUserService.getTenantId();
	 $scope.isActiveLink = function(link){
		return  $scope.activeLink.indexOf(link) == 0; 
	 };


	 $scope.grades = StudentService.loadGrades();
	 $scope.getAltText = function(assessmentObj){
		 if (assessmentObj.exists && assessmentObj.updatedVersion) {
			 return "Updated version can be imported";				
		 } else if (assessmentObj.exists) {
			 return "Exists in TR, already imported";
		 } else {
			 return "Can import";
		 }
	 };
	 $scope.status = function(assessmentObj) {
		 if (assessmentObj.exists && assessmentObj.updatedVersion) {
			 return "U";
		 } else if (assessmentObj.exists) {
			 return "E";
		 } else {
			 return "C";
		 }
	 };	 
		if(!$state.current.searchParams) {
			$scope.searchParams = {"purpose":"REGISTRATION","subjectAbbreviationContains":"","grade":"", "includeXml":"false", "sortKey":"name", "sortDir":"asc", "currentPage": 1};
		}else{
			$scope.searchParams = $state.current.searchParams;
		}
		
		$scope.xwalk   = function(label) {
			return $scope.safewalk('Assessment', label);
		};
		
		$scope.searchResponse = {};
		$scope.eligibilityTypes = AssessmentService.loadEligibilityTypes();
		
		$scope.formatGrade=function(gradeValue){
			if(!isNaN(gradeValue)){
				$scope.searchParams.grade= parseInt(gradeValue);
			}
		};
		
  		$scope.edit = function(assessmentObj) {
  			AssessmentService.addAssessmentData(assessmentObj).then(
  					function(response) {
  						AssessmentService.pushAssessmentData(response);
  						$state.transitionTo("importAssessment");
  					});

  		};
  		$scope.update = function(assessmentObj) {
  	
  			AssessmentService.assessmentSearch(assessmentObj).then(function(response) {
 				var fullAssessment = response.data.searchResults[0];
	  			AssessmentService.updateAssessment(fullAssessment).then( function(responseData) {
	  				$scope.errors  = responseData.errors;
					if(!$scope.errors || $scope.errors.length === 0){
						$window.location.reload();
					}
  			});
  			});
  		
  		};
 

 	}
]);