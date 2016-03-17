


describe('AssetGroup New Controller ', function() {
  var $scope, newController, service, stateProv = null;
  
  var unsavedAssetGroup = {
					  "tenantId" : "51fee64b46d1c929412e778f",
					  "componentName" : "tib",
					  "assets" : [],
					};
  var savedAssetGroup = {
		  "id" : "id_12345",
		  "tenantId" : "51fee64b46d1c929412e778f",
		  "componentName" : "tib",
		  "assets" : [],
		};

  //you need to indicate your module in a test
  beforeEach(module('progman'));
 
  beforeEach(inject(function($rootScope, $controller, $injector, $state, $http) {
	    //create a scope object for us to use.
	    $scope = $rootScope.$new();
	    httpMock = $injector.get('$httpBackend');
	    stateProv = $state;
	    //respond nothing for templates....
	    httpMock.whenGET(/\.html/).respond("");

	    //tenants is called to load selectbox
	    httpMock.whenGET("tenants").respond([ {
	    	  "id" : "51fee64b46d1c929412e778f",
	    	  "name" : "Wisconsin",
	    	  "type" : "STATE",
	    	  "url" : "/tenant/51fee64b46d1c929412e778f"
	    	}]); 
	    
	    //components is called to load selectbox
	    httpMock.whenGET("components").respond([ {
	    	  "id" : "51fee64b46d1c929412e998f",
	    	  "name" : "Component Name",
	    	  "url" : "/component/51fee64b46d1c929412e998f"
	    	}]); 
	    
	    newController = $controller('AssetGroupNewController', {
		      $scope : $scope
	    });

	    var mockForm = {};
	    mockForm.$setPristine = function(){};
	    $scope.assetGroupForm = mockForm;
	    
  }));

  
  it('verify we are routed to edit page correctly after save', function() {
	  httpMock.whenPOST("assetGroup").respond(savedAssetGroup); 
	  $scope.save(unsavedAssetGroup);
	  //routes to edit page on successful save
	  httpMock.whenGET(/^assetGroup\/id_12345/).respond(savedAssetGroup);

	  httpMock.flush();
	  expect($scope.assetGroup.id).toBe("id_12345");
	  expect(stateProv.current.name).toBe("assetgroupedit");
	  
  });
  

  
  it('verify error handled correctly', function() {
	  var errorMessageResponse = {
			  "messages" : {
				    "tenant" : [ "assetGroup.tenant.required" ],
				    "component" : [ "assetGroup.component.required" ]
				  }
				};
	  httpMock.whenPUT("assetGroup/"+savedAssetGroup.id).respond(400, errorMessageResponse); 
	
	  $scope.save(savedAssetGroup);
	  httpMock.flush();
	  expect($scope.errors.length).toBe(2);
	  expect($scope.errors[0]).toBe("assetGroup.tenant.required");
	  expect($scope.errors[1]).toBe("assetGroup.component.required");
  });
  
  it('saving indicator toggles correctly', function() {
	  expect($scope.savingIndicator).toEqual(false);
	  httpMock.whenGET(/^assetGroup\/id_12345/).respond(savedAssetGroup);
	  httpMock.whenPOST("assetGroup").respond(savedAssetGroup); 
	  $scope.save(unsavedAssetGroup);
	  expect($scope.savingIndicator).toEqual(true);
	  httpMock.flush();
	  expect($scope.savingIndicator).toEqual(false);
  });
 
});

