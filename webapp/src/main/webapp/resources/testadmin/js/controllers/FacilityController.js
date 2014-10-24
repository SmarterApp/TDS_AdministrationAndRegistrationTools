
testreg.controller('FacilityController',['$scope','$state', '$window', 'loadedData','FacilityService', 'TestPlatFormService', 'AccessibilityService', 'StateService',
    function($scope, $state, $window,loadedData,FacilityService,TestPlatFormService,AccessibilityService, StateService) {
		$scope.domain = "facility";
		$scope.savingIndicator = false;
		$scope.errors = [];
		$scope.actionButton = '';
		$scope.formAction = 'Add';
		$scope.errors = loadedData.errors;
		$scope.facility = loadedData.data;
		$scope.states=[];
		
		if($scope.facility && $scope.facility.id){
			$scope.formAction = 'Edit';				
		} 
    	StateService.loadStates().then(function(loadedData) {
    		$scope.states = loadedData.data;
    	});
        TestPlatFormService.getAll().then(function (response){
        	$scope.testPlatforms=response.data;
	        });
        
		accessibilityParams = {"currentPage": '0', "pageSize":"10000"};
		AccessibilityService.search(accessibilityParams).then(function(response){
    		if(response.data){
    			 $scope.equipments = response.data.searchResults;
    		}
        });
        
		$scope.xwalk   = function(label) {
			return $scope.safewalk('Institution', label);
		};
        
        /*********************Accessibility Equipment Selector*****************************/
        
        $scope.convertAccEquipToSelect2Array = function(accessibilityEquips) {
            return $.map( accessibilityEquips, function(accessibilityEquip) { return { "id":accessibilityEquip.name, "text":accessibilityEquip.name }; });
        };
        
        $scope.convertAccessibilityEquipIdsToStrings = function(grades) {
        	return $.map( grades, function(grade) { return grade; } );
        };
        
		$scope.accessibilityEquipSelector = {
   	   			'placeholder': "Select...",
   	   			'allowClear': true,
   	   			'multiple': true,
   	   	        'simple_tags': true,
   	   	        'width' :'resolve',
   	  	        'query': function (query) {
   	  	            var data = { results: $scope.convertAccEquipToSelect2Array($scope.equipments) };
   	  	            query.callback(data);
   	  	        },
   	  	        'id': function(select2Object) {  // retrieve a unique id from a select2 object
   	  	            return select2Object.id; 
   	  	        },
                'setPristine': false
   	   	};
        /**********************************************************************************/
        $scope.addSeatConfig = function() {
        	if(!$scope.facility || !$scope.facility.seatConfigurations) {
        		$scope.facility.seatConfigurations=[];
        	}
        	var seats = [];
        	$scope.facility.seatConfigurations.push({numberOfSeats:null,testPlatform:"",accessibilityEquipments:"", seats:seats});
        	$scope.facilityForm.$dirty = true;
        };
        
        $scope.removeSeatConfig = function(index) {
        	$scope.facilityForm.$dirty = true;
        	$scope.facility.seatConfigurations.splice(index, 1);
        }; 
        
		$scope.save = function(facility){
			$scope.savingIndicator = true;
			FacilityService.save(facility).then(function(response){
				$scope.savingIndicator = false;
				$scope.errors = response.errors;
				if($scope.errors.length == 0){
					$scope.facilityForm.$setPristine();
					$scope.facility = response.data;
					$state.transitionTo("searchFacility");
				}
			});
		};
    
		$scope.cancel = function() {
			$scope.actionButton = 'cancel';
			$state.transitionTo("searchFacility");
		};
		
  		$scope.formatInstitutionLabel = function(institution){
  			if (institution) {
  				$scope.facility.institutionId = institution.id; 
  				return institution.entityId;	
  			}			
  		};
  		
  		$scope.changeInstitutionId = function(institutionId){
  			$scope.facility.institutionIdentifier = institutionId;
  		};
  		  		
  		$scope.changeInstitution = function(selectedItem){
  			$scope.facility.institutionIdentifier = selectedItem.institution.entityId;
  		};		
  		
  		$scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){ 
    		if ($scope.facilityForm.$dirty) {
    			if(!confirm("You have unsaved changes. Are you sure you want to leave this page?")){
    				event.preventDefault();
    			}    	
	    	}
  		});
	}
]);

