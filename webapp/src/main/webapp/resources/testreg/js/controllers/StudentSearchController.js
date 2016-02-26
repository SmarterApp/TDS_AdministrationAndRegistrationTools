testreg.controller('StudentSearchController', ['$scope', '$state','$window', 'EntityService', 'StudentService', 'StateService',
     function ($scope, $state,$window, EntityService, StudentService, StateService ) {
	 $scope.activeLink = $state.$current.self.name;
	 $scope.grades =[];
	 $scope.IsVisible = false;
	 $scope.selectExportTypes = [];
	 $scope.selectExportTypes = StudentService.selectExportTypes();
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
  		
  		$scope.isSelected = function(mode) {
  			return angular.isDefined(mode);
  		};
  		
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
  		
  		$scope.studentExport = function(){
  			$scope.IsVisible = $scope.IsVisible ? false : true;
  		};
  		
  		$scope.exportSResults = function(reportType,mode,reportFormat) {
  			
  			if(reportType == 'currentPage') {
  				$scope.exportSearchResults(reportFormat,mode);
  			} else {
  				$scope.exportAllResults(reportFormat,mode);
  			}
  		};
  		
  		$scope.exportSearchResults = function(fileType,mode) {
  			var endpoint = "students/" + mode + "." + fileType;
  			
  			//Query URL for current page should less than one
  			$scope.searchParams.currentPage = $scope.searchParams.currentPage-1;
  			var paramValues = $.param($scope.searchParams);
  			//To display page  Values
  			$scope.searchParams.currentPage = $scope.searchParams.currentPage+1;
  			$window.open(baseUrl + endpoint + '?'+ paramValues);
  		};
  		
  		$scope.exportAllResults = function(fileType,mode) {
  			EntityService.getExportLimit().then(function(response){
  				$scope.pageLimit=response;
  			});
            $timeout(function() {
            	$scope.searchParams.currentPage = '0';
	  			var paramValues = $.param($scope.searchParams);
	  			var  endpoint = "students/" + mode + "." + fileType + '?pageSize='+$scope.pageLimit+"&"+paramValues;
	  			$window.open(baseUrl + endpoint);
            }, 300);
  		};
  		
  		$scope.isAllOptionsChecked = function(reportType,mode,reportFormat) {
  			
  			var isExportSaveVisible = false;
  			if(angular.isDefined(reportType) && angular.isDefined(mode) && angular.isDefined(reportFormat)){
  				isExportSaveVisible = true;
  			}
  			
  			return isExportSaveVisible;
  		};
  		
  		$scope.cancelContainer = function(reportType,mode,reportFormat) {
  			$scope.IsVisible = false;
  			
  		};
  		
  		
  		$scope.edit = function(student) {
  			$state.transitionTo("editStudent",{"studentId":student.id});
  		};
	
  		$scope.deleteItem = function(studentId) {
  			StudentService.deleteStudent(studentId).then(function(response){
				$scope.errors = response.errors;
				if($scope.errors.length == 0){
					$state.current.searchParams = $scope.searchParams;
					for (var i=$scope.searchResponse.searchResults.length; i--; ) {
					   if ($scope.searchResponse.searchResults[i].id === studentId) {
						   $scope.searchResponse.searchResults.splice(i, 1);
						   return;
					   }
					}
				}
			});
  		};
  		
  		$scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){ 
            $state.current.searchParams = $scope.searchParams;
  		});
  		

  		
     }
]);
