testreg.controller('StudentGroupEditController',['$scope','$state', '$filter', 'loadedData', 'StudentService','StudentGroupService'
                                                 ,'StateService', 'EntityService', 'inputData','prevActiveLink', 'UserService',
    function($scope, $state, $filter, loadedData, StudentService, StudentGroupService,StateService, EntityService, inputData,prevActiveLink, UserService) {
	
		$scope.activeLink = prevActiveLink;
		$state.$current.self.name = prevActiveLink;
		$scope.isActiveLink = function(link){
			return  $scope.activeLink == link; 
		};
		$scope.chkboxStudent = [];
		$scope.selectedStudents = [];
		$scope.chkboxAvailableStudent = [];
		$scope.selectedAvailableStudents = [];	 
		$scope.availableStudents = [];
		$scope.selectedGrades = [];
		$scope.users = [];
	 	$scope.savingIndicator = false;
		$scope.errors = loadedData.errors;
		$scope.studentGroup = loadedData.data;
		$scope.originalStudentGroup = angular.copy(loadedData.data);
		$scope.actionButton = '';
		$scope.formAction = 'Add';
		$scope.grades =[];
		$scope.modifyErrorMessage = "Modifying state abbreviation or district identifier or institution identifier will " +
										"cause all the students in the group to be removed. " +
										"User can search students for the modified criteria and add it to the group. Do you wish to continue?";
		
		$scope.getSearchParams = function () {
			return params = {"stateAbbreviation": $scope.studentGroup.stateAbbreviation,
						"districtIdentifier":$scope.studentGroup.districtIdentifier, "institutionIdentifier":$scope.studentGroup.institutionIdentifier,
						"currentPage": '0', "pageSize":"10000"};	
		};

  		StudentService.loadGrades().then(function(response){
  			$scope.grades=response;
  		});

		
		UserService.searchUsers({"pageSize":"99999"}).then(function(response) {
			if(response.data) {
				$scope.users = response.data.searchResults;
			}
		});

		$scope.changeState = function(state) {
			if($scope.studentGroup.id) {
				if(state != $scope.originalStudentGroup.stateAbbreviation) {
		   			if(!confirm($scope.modifyErrorMessage)){
		   				event.preventDefault();
		   				$scope.studentGroup.stateAbbreviation = $scope.originalStudentGroup.stateAbbreviation;
		   			}  else {
		   				$scope.availableStudents = [];
		   			}
				}
			}
		};
		//load students from the student group
		if($scope.studentGroup.id) {
			var studentSearchParams = $scope.getSearchParams();
			StudentService.searchStudents(studentSearchParams).then(function(response){
	    		if(response.data){
					angular.forEach($scope.studentGroup.studentIds, function(studentId){
						angular.forEach(response.data.searchResults, function(student){
							if(student.entityId == studentId){
								$scope.availableStudents.push(student);
								return;
							}
						});
					});
	    		}
	        });
		}
		
        $scope.convertGradesToSelect2Array = function(grades) {
            return $.map( grades, function(grade) { return { "id":grade.id, "text":grade.id }; });
        };
        
        $scope.convertGradesToStrings = function(grades) {
        	return $.map( grades, function(grade) { 
        		return grade;
        		} );
        };
        
		$scope.gradesSelector = {
   	   			'placeholder': "Select...",
   	   			'allowClear': true,
   	   			'multiple': true,
   	   	        'simple_tags': true,
   	   	        'width' :'resolve',
   	  	        'query': function (query) {
   	  	            var data = { results: $scope.convertGradesToSelect2Array($scope.grades) };
   	  	            query.callback(data);
   	  	        },
   	  	        'id': function(select2Object) {  // retrieve a unique id from a select2 object
   	  	            return select2Object.id; 
   	  	        },
                'setPristine': true
   	   	};
		
		$scope.xwalk   = function(label) {
			return $scope.safewalk('StudentGroup', label);
		};

		if($scope.studentGroup && $scope.studentGroup.id){
			$scope.formAction = 'Edit';		

		}
		
		$scope.toggleStudent = function (student, index) {
			if($scope.chkboxStudent[index] == "YES") {
				$scope.selectedStudents.push(student);
			}else{
				var index = $scope.selectedStudents.indexOf(student);
				$scope.selectedStudents.splice(index, 1);
				$scope.chkboxSelectAll = "NO";
			}
		};
		$scope.toggleAvailableStudent = function (student, index) {
			if($scope.chkboxAvailableStudent[index] == "YES") {
				$scope.selectedAvailableStudents.push(student);
			}else{
				var index = $scope.selectedAvailableStudents.indexOf(student);
				$scope.selectedAvailableStudents.splice(index, 1);
				$scope.chkboxRemoveAll = "NO";
			}
		};		
		$scope.addStudents = function () {

			angular.forEach($scope.selectedStudents, function(student){
				var studentFound = false;
				angular.forEach($scope.availableStudents, function(availableStudent){
					if(availableStudent.entityId == student.entityId){
						studentFound = true;
						return;
					}
				});
				if(!studentFound) {
					$scope.availableStudents.push(student);
				}
				
			});
			$scope.chkboxRemoveAll = "NO";
		};
		$scope.removeStudents = function () {
			angular.forEach($scope.selectedAvailableStudents, function(student){
				var index = $scope.availableStudents.indexOf(student);
				$scope.availableStudents.splice(index, 1);
			});
			$scope.chkboxAvailableStudent =[];
			$scope.selectedAvailableStudents=[];
		};
		
		$scope.toggleSelectAll = function () {
			if($scope.chkboxSelectAll == "YES") {
				angular.forEach($scope.searchResponse.searchResults, function(student, index){
					$scope.chkboxStudent[index] = "YES"; 
					$scope.selectedStudents.push(student);
				});
			}else{
				angular.forEach($scope.searchResponse.searchResults, function(student, index){
					$scope.chkboxStudent[index] = "NO"; 
				});
				$scope.selectedStudents = [];
			}
		};
			
		$scope.toggleRemoveAll = function () {
			if($scope.chkboxRemoveAll == "YES") {
				angular.forEach($scope.availableStudents, function(student, index){
					$scope.chkboxAvailableStudent[index] = "YES"; 
					$scope.selectedAvailableStudents.push(student);
				});				
			} else{
				angular.forEach($scope.availableStudents, function(student, index){
					$scope.chkboxAvailableStudent[index] = "NO"; 
				});
				$scope.selectedAvailableStudents = [];
			}
		};		
		/* custom paging and filter students */
		$scope.nextPage = function(){
			$scope.searchParams.currentPage = $scope.searchParams.currentPage + 1;
			$scope.searchStudents($scope.searchParams);
		};
		$scope.prevPage = function(){
			$scope.searchParams.currentPage = $scope.searchParams.currentPage - 1;
			$scope.searchStudents($scope.searchParams);
		};
		$scope.lastPage = function(){
			$scope.searchParams.currentPage = parseInt($scope.searchResponse.totalCount / 10);
			$scope.searchStudents($scope.searchParams);
		};
		$scope.firstPage = function(){
			$scope.searchParams.currentPage = 0;
			$scope.searchStudents($scope.searchParams);
		};
		
		$scope.searchStudents = function(params) {
			if (!params) {
				params = $scope.getSearchParams();
			}
			$scope.errors = [];
			if( !params.stateAbbreviation ||  !params.institutionIdentifier) {
				$scope.errors.push("State Abbreviation and Institution Identifier are required for searching students");
			} else {
				$scope.errors =[];
				$scope.selectedStudents= [];
				$scope.chkboxStudent = [];
				$scope.chkboxSelectAll = [];
				$scope.searchParams = params;
				//add advanced params
				params.firstName = $scope.firstName;
				params.lastName = $scope.lastName;
				params.entityId = $scope.entityId;
				StudentService.searchStudentsWithMultiGrades(params, $scope.selectedGrades).then(function(response){
	    		if(response.data){
	    			$scope.searchResponse = response.data;
	    		}
	        	});
			}
		};
		
		/* Custom paging script and filter students ends */

 		$scope.formatDistrictLabel = function(district) {
 			if(district) {
 				$scope.studentGroup.districtEntityMongoId = district.id;  
 	  			return district.entityId; 				
 			}
 		};

 		$scope.formatInstitutionLabel = function(institution){
 			if (institution) {
 				$scope.studentGroup.institutionEntityMongoId = institution.id; 
 				return institution.entityId;	
 			}			
 		};
 		
 		$scope.changeDistrictId = function(districtId){
 			$scope.studentGroup.districtIdentifier = districtId;
 		};
 		$scope.changeInstitutionId = function(institutionId){
 			$scope.studentGroup.institutionIdentifier = institutionId;
 		};
 		  		
 		$scope.changeDistrict = function(selectedItem){
			if($scope.studentGroup.id) {
				if(selectedItem.district.entityId != $scope.originalStudentGroup.districtIdentifier) {
		   			if(!confirm($scope.modifyErrorMessage)){
		   				event.preventDefault();
		   				$scope.studentGroup.districtIdentifier = $scope.originalStudentGroup.districtIdentifier;
		   				selectedItem.district.entityId = $scope.originalStudentGroup.districtIdentifier;
		   				return false;
		   			}  else {
		   				$scope.availableStudents = [];
		   	 			$scope.studentGroup.districtIdentifier = selectedItem.district.entityId;
		   			}
				}
			}else{
				$scope.studentGroup.districtIdentifier = selectedItem.district.entityId;
			}
 		};
 		$scope.changeInstitution = function(selectedItem){
			if($scope.studentGroup.id) {
				if(selectedItem.institution.entityId != $scope.originalStudentGroup.institutionIdentifier) {
		   			if(!confirm($scope.modifyErrorMessage)){
		   				event.preventDefault();
		   				$scope.studentGroup.institutionIdentifier = $scope.originalStudentGroup.institutionIdentifier;
		   				selectedItem.institution.entityId = $scope.originalStudentGroup.institutionIdentifier;
		   				return false;
		   			}  else {
		   				$scope.availableStudents = [];
		   				$scope.studentGroup.institutionIdentifier = selectedItem.institution.entityId;
		   			}
				} 
			}else{
				$scope.studentGroup.institutionIdentifier = selectedItem.institution.entityId;
			}
 		};
		StateService.loadStates().then(function(loadedData) {
			$scope.states = loadedData.data;
		});
		
		$scope.save = function(studentGroup) {					
			$scope.savingIndicator = true;

			//add students from available students in the group
			studentGroup.studentIds = [];
			studentGroup.studentMongoIds = [];
			angular.forEach($scope.availableStudents, function(student, index){
				studentGroup.studentIds.push(student.entityId);
				studentGroup.studentMongoIds.push(student.id);
			});

			StudentGroupService.saveStudentGroup(studentGroup).then(function(response) {
				$scope.savingIndicator = false;
				$scope.errors = response.errors;
				if($scope.errors.length == 0){
					$scope.studentGroupForm.$setPristine();
					$scope.studentGroup = response.data;
					$state.transitionTo("searchStudentGroup");
				}
			});
		};
   
		$scope.cancel = function() {
			$scope.actionButton = 'cancel';
			$state.transitionTo("searchStudentGroup");
		};
		
 		$scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){ 
   		if ($scope.studentGroupForm.$dirty) {
   			if(!confirm("You have unsaved changes. Are you sure you want to leave this page?")){
   				event.preventDefault();
   			}    	
	    	}
 		});
	}
]);

