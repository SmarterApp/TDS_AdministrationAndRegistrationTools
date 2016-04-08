testreg.factory("ClientService", function($http) {
	

	return {
		errorHandler : function(response) {
			var returnVal = {
				data : {},
				errors : []
			};
			for ( var field in response.data.messages) {
				for ( var messages in response.data.messages[field]) {
					returnVal.errors
							.push(response.data.messages[field][messages]);
				}
			}
			return returnVal;
		},
		loadClient : function() {
    		var url = baseUrl + 'client' + '/?_=' + Math.random();
    		return $http.get(url).then(this.successHandler, this.errorHandler);
	    },
		saveClient : function(clientInfo) {
			return $http({
				method: 'PUT',
				url: baseUrl + 'client/' + clientInfo.id,
				data: clientInfo
			}).then(this.successHandler, this.errorHandler);
	    },
		successHandler : function(response) {
			return {
				data : response.data,
				errors : []
			};
		},
		
		getGuid : function() {
			return $http.get(baseUrl + 'datawarehouse/guid').then(this.guidSuccess, null);
		},
		
		guidSuccess : function(response) {
			return {
				data : response.data,
				errors : []
			};
		},
		
		loadAssessmentTypes : function() {
			return $http.get(baseUrl + 'assessment/types').then(this.successHandler, this.errorHandler);
	    },
	    
	    loadTimeZone : function() {
			return  [
						{name:"America/New_York"},
						{name:"America/Detroit"},
						{name:"America/Kentucky/Louisville"},
						{name:"America/Kentucky/Monticello"},
						{name:"America/Indiana/Indianapolis"},
						{name:"America/Indiana/Vincennes"},
						{name:"America/Indiana/Winamac"},
						{name:"America/Indiana/Marengo"},
						{name:"America/Indiana/Petersburg"},
						{name:"America/Indiana/Vevay"},
						{name:"America/Chicago"},
						{name:"America/Indiana/Tell_City"},
						{name:"America/Indiana/Knox"},
						{name:"America/Menominee"},
						{name:"America/North_Dakota/Center"},
						{name:"America/North_Dakota/New_Salem"},
						{name:"America/North_Dakota/Beulah"},
						{name:"America/Denver"},
						{name:"America/Boise"},
						{name:"America/Phoenix"},
						{name:"America/Los_Angeles"},
						{name:"America/Anchorage"},
						{name:"America/Juneau"},
						{name:"America/Sitka"},
						{name:"America/Yakutat"},
						{name:"America/Nome"},
						{name:"America/Adak"},
						{name:"America/Metlakatla"},
						{name:"Pacific/Honolulu"}
					];
	    },
	};
});