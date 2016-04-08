testadmin.controller('AffinityDialogController',function($scope,$modalInstance,data, $timeout){
	$scope.affinities = data.affinities;

	$scope.affinityValues =[];
	$scope.affinityTypes = data.affinityTypes;
	$scope.assessments = data.assessments;
	$scope.subjects = data.subjects;
	$scope.grades = data.grades;
	
	$timeout(function() {
		if ($scope.affinities && $scope.affinities.length > 0) {
			angular.forEach($scope.affinities, function(affinity, index) {
				if (affinity.type === "ASSESSMENT") {
					$scope.affinityValues[index] = $scope.convertAssessmentsToAffinityValue($scope.assessments);
				} else if (affinity.type === "SUBJECT") {
					$scope.affinityValues[index] = $scope.convertSubjectsToAffinityValue($scope.subjects);
				} else if (affinity.type === "GRADE") {
					$scope.affinityValues[index] = $scope.convertGradesToAffinityValue($scope.grades);
				} else {
					$scope.affinityValues[index] =[];
				}
			});
		}
	}, 300);
	
    $scope.convertAssessmentsToAffinityValue = function(assessments) {
        return $.map( assessments, function(assessment) { return { "id":assessment.id, "name":assessment.testName }; });
    };
	
    $scope.convertSubjectsToAffinityValue = function(subjects) {
        return $.map( subjects, function(subject) { return { "id":subject, "name":subject }; });
    };	
    
    $scope.convertGradesToAffinityValue = function(grades) {
        return $.map( grades, function(grade) { return { "id":grade.id, "name":grade.text }; });
    };
    
	$scope.setAffinities = function (index, type) {
		if (type === "ASSESSMENT") {
			$scope.affinityValues[index] = $scope.convertAssessmentsToAffinityValue($scope.assessments);
		} else if (type === "SUBJECT") {
			$scope.affinityValues[index] = $scope.convertSubjectsToAffinityValue($scope.subjects);
		} else if (type === "GRADE") {
			$scope.affinityValues[index] = $scope.convertGradesToAffinityValue($scope.grades);
		} else {
			$scope.affinityValues[index] =[];
		}

	};
	
	$scope.cancel = function(){
		$modalInstance.dismiss('canceled');  
	}; // end cancel
  
	$scope.addAffinity = function () {
    	if(!$scope.affinities) {
    		$scope.affinities=[];
    	}
    	$scope.affinities.push({type:"",rule:"NONSTRICT",value:""});
	};
	
	$scope.removeAffinity = function (index) {
    	$scope.affinities.splice(index, 1);
	};
	$scope.addAffinities = function(){	
		$scope.errors = [];
		angular.forEach($scope.affinities, function(affinity, index){
			if (affinity.type === "") {
				$scope.errors.push("Affinity type is required");
			}
			if (affinity.value === "") {
				$scope.errors.push("Affinity value is required");
			}
		});
		if ($scope.errors.length == 0) {
			$modalInstance.close($scope.affinities);
		}
	}; // end save
  
});
