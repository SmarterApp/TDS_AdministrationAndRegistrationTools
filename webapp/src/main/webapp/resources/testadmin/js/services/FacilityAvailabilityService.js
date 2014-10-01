testadmin.factory("FacilityAvailabilityService", function($http){
	var service = {
		getResource : function() {
			return 'facilityAvailability';
		},
		
		getHttp : function() {
			return $http;
		},
		
		getBaseUrl : function() {
			return baseUrl;
		},
		
	    loadAvailabilityChoices: function() {
	    	return [{id: 'AVAILABLE', name: 'Available'},
	    	        {id: 'NOTAVAILABLE', name: 'Not Available'}
	    	        ];
	    },  
	    
	    getTimeSlot: function(facilityId, institutionId, scheduledDay, timeSlotId) {
	    	var params = {
	    			facilityId: facilityId, 
	    			institutionId:institutionId, 
	    			scheduledDate: scheduledDay, 
	    			timeSlotId: timeSlotId
	    			};
	    	var url = this.getBaseUrl() + this.getResource() + 'TimeSlot';
		    return  this.getHttp()({
	            method: 'GET',
	            url: url,
	            params: params
		    }).then(this.successHandler, this.errorHandler);
	    },
	    
	    loadAffinityTypes: function() {
	    	return [{id: 'ASSESSMENT', name: 'Assessment'},
	    	        {id: 'SUBJECT', name: 'Subject'},
	    	        {id: 'GRADE', name: 'Grade'}
	    	        ];
	    }	    
    };
	return angular.extend(service, BaseService);
});