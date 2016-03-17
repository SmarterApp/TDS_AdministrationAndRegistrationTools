


describe('Tenant Edit Controller ', function() {
  var $scope, editController, service = null;

  //you need to indicate your module in a test
  beforeEach(module('progman'));
 
  beforeEach(inject(function($rootScope, $controller, $injector, $state, $http, TenantService) {
	    //create a scope object for us to use.
	    $scope = $rootScope.$new();
	    httpMock = $injector.get('$httpBackend');
		
	    //respond nothing for templates....
	    httpMock.whenGET(/\.html/).respond("");

	    service  = TenantService;
	    
	    editController = $controller('TenantEditController', {
		      $scope : $scope,
		      loadedData: {data:{}, errors:[]}
	    });

	    var mockForm = {};
	    mockForm.$setPristine = function(){};
	    $scope.tenantForm = mockForm;
	    
  }));

  it('check if id is set after save', function() {
	  var tenant = {"name":"WISCONSIN","type":"STATE"};
	  httpMock.whenPOST("tenant").respond({"name":"WISCONSIN", "type":"STATE", "id":"XYZ19er"}); 
	  
	  $scope.save(tenant);
	  httpMock.flush();
	  expect($scope.tenant.id).toBe("XYZ19er");
  });
  
  it('verify post if id is empty string', function() {
	  var tenant = {"name":"WISCONSIN","type":"STATE"};
	  httpMock.whenPOST("tenant").respond({"name":"WISCONSIN", "type":"STATE", "id":"XYZ19er"}); 
	  $scope.save(tenant);
	  httpMock.flush();
	  expect($scope.tenant.id).toBe("XYZ19er");
  });
  
  it('verify error handled correctly', function() {
	  var errorMessageResponse = {
			  "messages" : {
				    "name" : [ "tenant.name.required" ],
				    "type" : [ "tenant.type.required" ]
				  }
				};
	  httpMock.whenPOST("tenant").respond(400, errorMessageResponse); 
	
	  var tenant = {"name":"","type":"", "id":""};
	  $scope.save(tenant);
	  httpMock.flush();
	  expect($scope.errors.length).toBe(2);
	  expect($scope.errors[0]).toBe("tenant.name.required");
	  expect($scope.errors[1]).toBe("tenant.type.required");
  });


  it('check update if id is found on object', function() {
	  var tenant = {"name":"WISCONSIN","type":"STATE", "id":"superCoolId"};
	  httpMock.expectPUT("tenant/superCoolId").respond(tenant); 
	  $scope.save(tenant);
	  httpMock.flush();
  });
  
  it('saving indicator toggles correctly', function() {
	  var tenant = {"name":"WISCONSIN","type":"STATE", "id":""};
	  expect($scope.savingIndicator).toEqual(false);
	  httpMock.whenPOST("tenant").respond({"name":"WISCONSIN","type":"STATE", "id":"ageneratedId"}); 
	  $scope.save(tenant);
	  expect($scope.savingIndicator).toEqual(true);
	  httpMock.flush();
	  expect($scope.savingIndicator).toEqual(false);
  });
 
});

