
testreg.factory("CurrentUserService", function($http,$cookies){
	var service =   {
		getTenantId : function(){
			return $cookies.currentTenantId;
		},
		
		setTenantId : function(tenantId){
			$cookies.currentTenantId = tenantId;
		},
			
		getTenantType : function(){
			//Need to convert the Progmn Grp to TestReg Grp
			if($cookies.currentTenantType=='DISTRICT_GROUP'){
				return "GROUPOFDISTRICTS";
			}else if($cookies.currentTenantType=='STATE_GROUP'){
				return "GROUPOFSTATES";
			}else if($cookies.currentTenantType=='INSTITUTION_GROUP'){
				return "GROUPOFINSTITUTIONS";
			}else{
				return $cookies.currentTenantType;
			}
		},
		
		setTenantType : function(tenantType){
			$cookies.currentTenantType = tenantType;
		},
		
		getTenantName : function(){
			return $cookies.currentTenantName;
		},
		
		setTenantName : function(tenantName){
			$cookies.currentTenantName = tenantName;
		}
			
    };
	
	return service;
});