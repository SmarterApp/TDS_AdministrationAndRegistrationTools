testadmin.controller('ReportController',['$scope','$state','$window','ReportService','CurrentUserService','EntityService','AssessmentService',
                                                       
		function($scope, $state,$window,ReportService,CurrentUserService,EntityService,AssessmentService) {
  	
	 $scope.activeLink = $state.$current.self.name;
	 
	 $scope.isActiveLink = function(link){
		return  $scope.activeLink.indexOf(link) == 0; 
	 };
	 
	 $scope.goToFormsPage = function(tabLink) {
         $state.transitionTo(tabLink);
         $scope.activeLink = tabLink;
     };
     EntityService.loadClientConfig().then(function(response){
    	 $scope.clientConfig= response.data;
     });
		$scope.requestName=$state.$current.self.name;
			$scope.selectedEntityId = "";
			$scope.entityType = "";
			$scope.userEntityType = CurrentUserService.getTenantType();
			$scope.format="yyyy-MM-dd";
			if($scope.requestName == "proctorScheduleReport"){
				$scope.scheduleReportLabel="Proctor Schedule Report";
			}else{
				$scope.scheduleReportLabel="Student Schedule Report";
			}
		  if(!$state.current.participationReport) {

	     		$scope.participationReport = {"assessmentId":"", "reportLevel":"","testStatus":"","opportunity":"","startDate":"","endDate":""};
	     	}else{

	     		$scope.participationReport = $state.current.participationReport;
	     	}    
	  		ReportService.loadOpportunities().then(function(response){
	  			$scope.opportunities = new Array();
	  			var dataVal= response.data;
 				 for(var i=1;i<=dataVal;i++){
 					$scope.opportunities.push(i);
 				 }
 			 });
		  EntityService.loadClientConfig().then(function(response){
			$scope.reportLevels = EntityService.loadReportEntities(response.data);
		});	 
     var tenantType = CurrentUserService.getTenantType();
     var tenantId = "" ;
     if(tenantType=="CLIENT"||tenantType=="STATE"){
        tenantId = CurrentUserService.getTenantName();
     }else{
    	 tenantId = CurrentUserService.getTenantId();
     }
     
     ReportService.findEntityById(tenantId,CurrentUserService.getTenantType()).then(function(loadData){
    	 var selectedData=loadData.data;
    	 $scope.entityType = CurrentUserService.getTenantType();
    	 $scope.participationReport.reportLevel= CurrentUserService.getTenantType();
    	 $scope[EntityService.getByName(tenantType)] = loadData.data;
    	 $scope.participationReport[EntityService.getByName(tenantType)+"Id"] = selectedData[0].id;
    	 $scope.selectedEntityId = selectedData[0].id;
    	 $scope.populateChildValues(selectedData[0].id,CurrentUserService.getTenantType());
    	 $scope.setAccessFlag($scope.entityType);
    	 if(CurrentUserService.getTenantType() != "STATE" && CurrentUserService.getTenantType() !="CLIENT"){
    		 //get the assessments by tenant type
    		 AssessmentService.loadAssessmentsByTenantId(CurrentUserService.getTenantId()).then(function(response){
    			 $scope.assessments=response.data; 
    		 });
    	 }

     });
     $scope.testStatuses= ReportService.loadTestStatus();
     $scope.selectedEntityType = function(parentId,parentType){
     	 if(parentId ==null){
    		var entitiesList= ReportService.findAllEntities();
    		var index = entitiesList.indexOf(parentType);
    		while(index >0){
    			index = index -1;
    			 if($scope.participationReport[EntityService.getByName(entitiesList[index])+"Id"] != ""){
    				 parentId = $scope.participationReport[EntityService.getByName(entitiesList[index])+"Id"];
    				 parentType= entitiesList[index];
    				 break;
    			 }	
    		}
    		
    	 }
    	 
    	 $scope.selectedEntityId = parentId;
    	 $scope.entityType = parentType;
    	 if(parentType != "INSTITUTION"){
    		 $scope.populateChildValues(parentId,parentType);
    	 }
     };
     $scope.groupOfStatesFlag = function(){
    	 if(! $scope.clientConfig.groupOfStates){
    		 return true;
    	 }
    	 return false;
     };
     $scope.groupOfDistrictsFlag = function(){
    	 if(! $scope.clientConfig.groupOfDistricts){
    		 return true;
    	 }
    	 return false;
     };
     $scope.groupOfInstitutionsFlag = function(){
    	 if($scope.clientConfig){
    		 if(! $scope.clientConfig.groupOfInstitutions){
    			 return true;
    		 }
    		 return false;
    	 }
     };
	 $scope.populateChildValues = function(parentId,parentType){
		 var childArrays= ReportService.loadChildHierarchy(parentType,$scope.clientConfig);
		 angular.forEach(childArrays, function(entityType){
			 $scope.participationReport[EntityService.getByName(entityType)+"Id"]="";
			 ReportService.loadParentByIdAndType(parentId,parentType,entityType).then(function(loadData){
	        	 $scope[EntityService.getByName(entityType)] = loadData.data;
			 });
		 	});

	 };

	 var assessmentSearchValue = "";
	 if(CurrentUserService.getTenantType() == "STATE"){
		 assessmentSearchValue = CurrentUserService.getTenantId();
	 }
		
	 if(CurrentUserService.getTenantType() == "STATE" || CurrentUserService.getTenantType() == "CLIENT"){
		 AssessmentService.findAssessmentByTenantId(assessmentSearchValue,'9999','tenantId').then(function(response){
			 $scope.assessments=response.data;
		 });
	 }
	 
	
	 

     $scope.setAccessFlag = function(selectedReportType){
    	 if(selectedReportType == null){
    		 return;
    	 }
    	 var resetEntities = ReportService.loadChildHierarchy(CurrentUserService.getTenantType(),$scope.clientConfig);
    	 resetEntities.push(CurrentUserService.getTenantType());
    		 angular.forEach(resetEntities, function(eachEntity){
    		 $scope[EntityService.getByName(eachEntity)+"Flag"]= "";
    	 });
    	 var childEntities = ReportService.loadChildHierarchy(selectedReportType,$scope.clientConfig);
    	 angular.forEach(childEntities, function(entityType){
    		 $scope.participationReport[EntityService.getByName(entityType)+"Id"]="";
    		 $scope[EntityService.getByName(entityType)+"Flag"]= "true";
    	 });
    	 var entitiesList= ReportService.findAllEntities();
        	 if( entitiesList.indexOf(selectedReportType) < entitiesList.indexOf($scope.entityType)){
        		 $scope.selectedEntityId = $scope.participationReport[EntityService.getByName(selectedReportType)+"Id"];
        		 $scope.entityType= selectedReportType;	        		 
        	 }	   
     };
     $scope.reportTypeFlag = function(reportType){
    	 if(EntityService.isEntityAllowed(reportType)) {
    		 return true;
    	 }
    	 return false;
     };
 
     $scope.createSummaryReport = function(participationReport){
    	 $scope.errors =[];
    	 var serviceName="participationSummaryReport";
    	 var paramsValues ={tenantId:CurrentUserService.getTenantId(),tenantType:CurrentUserService.getTenantType(),entityType:$scope.entityType,entityId:$scope.selectedEntityId,
			 levelOfReport:participationReport.reportLevel,assessmentId:participationReport.assessmentId,opportunity:participationReport.opportunity};	 
	     	if( participationReport.reportLevel == null || participationReport.reportLevel ==""){
		   		 $scope.errors.push("Report Type is required");
		     	}    	 
		     	if( participationReport.opportunity == null || participationReport.opportunity ==""){
		   		 $scope.errors.push("Opportunity is required");
		     	}
	     	 if($scope.errors.length == 0) {
	     		$window.open(baseUrl + serviceName+".pdf?"+ $.param(paramsValues));	
	     	 }

     };
     $scope.createDetailReport = function(participationReport){
    	 $scope.errors =[];
    	 if($scope.entityType != 'INSTITUTION' || $scope.selectedEntityId ==null || $scope.selectedEntityId ==""){
    		 $scope.errors.push($scope.entityNameLabels['Institution'] + " is required");
    	 }
    	if( participationReport.opportunity == null || participationReport.opportunity ==""){
    		 $scope.errors.push("Opportunity is required");
    	}
    	 if(participationReport.assessmentId == null){
    		 participationReport.assessmentId ="";
    	 }
    	 if(participationReport.testStatus == null){
    		 participationReport.testStatus ="";
    	 }
    	 if($scope.errors.length == 0) {
	    	 var params =$.param({tenantId:CurrentUserService.getTenantId(),tenantType:CurrentUserService.getTenantType(),entityType:$scope.entityType,entityId:$scope.selectedEntityId,
	    		 testStatus:participationReport.testStatus,assessmentId:participationReport.assessmentId,opportunity:participationReport.opportunity});
	   		 $window.open(baseUrl + "participationDetailReport.pdf" + '?'+ params);
    	 }
     };           
     $scope.createScheduledReport = function(report){
    	 $scope.errors = [];
    	 if($scope.entityType != 'INSTITUTION' || $scope.selectedEntityId ==null || $scope.selectedEntityId ==""){
    		 $scope.errors.push($scope.entityNameLabels['Institution'] + " is required");
    	 }
    	
    	 if(!report || report.startDate == null || report.startDate == ""){
    		 $scope.errors.push("Start date is required");
    	 }
    	 if(!report || report.endDate == null || report.endDate == ""){
    		 $scope.errors.push("End date is required");
    	 }
 		var startDate = ReportService.getFormattedDate(report.startDate, "yyyy-MM-dd");
 		var endDate = ReportService.getFormattedDate(report.endDate, "yyyy-MM-dd");
    	var currentTime = ReportService.getFormattedDate(new Date(), "yyyy-MM-dd");

    	 if(startDate < currentTime){
    		 $scope.errors.push("Start Date should be equal or greater than current Date");
    	 }
    	 if(startDate > endDate){
    		 $scope.errors.push("End Date should be less than than Start Date");
    	 }
    	 if($scope.errors.length == 0) {
        	 var params =$.param({tenantId:CurrentUserService.getTenantId(),institutionId: $scope.selectedEntityId,startDate:startDate,endDate:endDate});
        	 if($scope.requestName == "proctorScheduleReport"){
        		 $window.open(baseUrl + "proctorScheduleReport.pdf" + '?'+ params);
        	 }else{
        		 $window.open(baseUrl + "studentScheduleReport.pdf" + '?'+ params);
        	 }
    	 }
     };
     
} ]);