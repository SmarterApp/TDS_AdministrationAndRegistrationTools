testreg.controller('StudentSearchController', ['$scope', '$state','$window', 'StudentService', 'StateService',
     function ($scope, $state,$window, StudentService, StateService ) {
	 $scope.activeLink = $state.$current.self.name;
	 $scope.grades =[];
	 $scope.isActiveLink = function(link){
		return  $scope.activeLink.indexOf(link) == 0; 
	 };
	if(!$state.current.searchParams) {
			$scope.searchParams = {"stateAbbreviation":"", "districtIdentifier":"", "institutionIdentifier":"", "studentIdentifier":"", "grade":"","student.inValidAccommodationsSubject":"", "sortKey":"stateAbbreviation", "sortDir":"asc", "currentPage": 1};
		}else{
			$scope.searchParams = $state.current.searchParams;
		}
  		$scope.searchResponse = {};
  		
  		$scope.xwalk   = function(label) {
  			return $scope.safewalk('Student', label);
  		};
  		
  		StateService.loadStates().then(function(loadedData) {
  			$scope.states = loadedData.data;
  		});
  		
  		$scope.formatDate = function(date) {
  			return StudentService.getFormattedDate(date);
  		};
  		 $scope.grades = StudentService.loadGrades();

  		
  		$scope.formatDistrictLabel = function(district) {
  			if(district) {
  	  			return district.entityId; 				
  			}else{
   				return $scope.searchParams.districtIdentifier;
  			}
  		};

  		$scope.formatInstitutionLabel = function(institution){
  			if (institution) {
  				return institution.entityId;	
  			}else{
   				return $scope.searchParams.institutionIdentifier;
  			}		
  		};
  		
		$scope.changeDistrictId = function(districtId){
  			$scope.searchParams.districtIdentifier = districtId;
  		};
  		$scope.changeInstitutionId = function(institutionId){
  			$scope.searchParams.institutionIdentifier = institutionId;
  		};
  		  		
  		$scope.changeDistrict = function(selectedItem){
  			$scope.searchParams.districtIdentifier = selectedItem.district.entityId;
  		};

  		$scope.changeInstitution = function(selectedItem){
  			$scope.searchParams.institutionIdentifier = selectedItem.institution.entityId;
  		};
  		
  		$scope.createNew = function(){
  			$state.transitionTo("editStudent",{"studentId":""});
  		};
  		
  		$scope.edit = function(student) {
  			$state.transitionTo("editStudent",{"studentId":student.id});
  		};
	
  		$scope.deleteItem = function(studentId) {
  			StudentService.deleteStudent(studentId).then(function(response){
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