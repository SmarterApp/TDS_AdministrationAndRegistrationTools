testreg.controller('StudentGroupSearchController', ['$scope', '$state','$window', 'StudentGroupService', 'StateService', 'UserService',
     function ($scope, $state,$window, StudentGroupService, StateService, UserService ) {
		$scope.activeLink = $state.$current.self.name;
		$scope.users = [];
		$scope.isActiveLink = function(link){
			return  $scope.activeLink == link; 
		};
		if(!$state.current.searchParams) {
			$scope.searchParams = {"stateAbbreviation":"", "districtIdentifier":"", "institutionIdentifier":"", "studentGroupName":"","sortKey":"stateAbbreviation", "sortDir":"asc", "currentPage": 1};
		}else{
			$scope.searchParams = $state.current.searchParams;
		}
		$scope.searchResponse = {};
		
		$scope.xwalk   = function(label) {
			return $scope.safewalk('StudentGroup', label);
		};
		
		StateService.loadStates().then(function(loadedData) {
			$scope.states = loadedData.data;
		});
		
	    $scope.formatDistrictLabel = function(district) {
			if(district) {
	  			return district.entityId; 				
			}
		};
		
	    $scope.formatOwnerLabel = function(owner) {
			if(owner) {
	  			return owner.lastName + ', ' + owner.firstName; 				
			}
		};
	
		$scope.formatInstitutionLabel = function(institution){
			if (institution) {
				return institution.entityId;	
			} 			
		};
		
		$scope.changeDistrictId = function(districtId){
			$scope.searchParams.districtIdentifier = districtId;
		};
		$scope.changeInstitutionId = function(institutionId){
			$scope.searchParams.institutionIdentifier = institutionId;
		};
		$scope.changeOwnerEmail = function(owner){
			$scope.searchParams.ownerEmail = owner.ownerUser.email;
		};
		  		
		$scope.changeDistrict = function(selectedItem){
			$scope.searchParams.districtIdentifier = selectedItem.district.entityId;
		};
	
		$scope.changeInstitution = function(selectedItem){
			$scope.searchParams.institutionIdentifier = selectedItem.institution.entityId;
		};
		
		$scope.createNew = function(){
			$state.transitionTo("editStudentGroup",{"studentGroupId":""});
		};
		
		$scope.edit = function(studentGroup) {
			$state.transitionTo("editStudentGroup",{"studentGroupId":studentGroup.id});
		};
	
		$scope.deleteItem = function(studentGroupId) {
			StudentGroupService.deleteStudentGroup(studentGroupId).then(function(response){
				$scope.errors = response.errors;
				if($scope.errors.length == 0){
					$state.current.searchParams = $scope.searchParams;
					for (var i=$scope.searchResponse.searchResults.length; i--; ) {
					   if ($scope.searchResponse.searchResults[i].id === studentGroupId) {
						   $scope.searchResponse.searchResults.splice(i, 1);
						   return;
					   }
					}
				}
			});
		};
		
		$scope.postProcess = function(studentGroup) {
	    };
		$scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){ 
	        $state.current.searchParams = $scope.searchParams;
		});
     }
]);