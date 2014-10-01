
describe('Component Edit Controller ', function() {
  var $scope, editController, service = null;

  //you need to indicate your module in a test
  beforeEach(module('progman'));
 
  beforeEach(inject(function($rootScope, $controller, $injector, $state, $http, ComponentService) {
	    //create a scope object for us to use.
	    $scope = $rootScope.$new();
	    httpMock = $injector.get('$httpBackend');
		
	    //respond nothing for templates....
	    httpMock.whenGET(/\.html/).respond("");

	    service  = ComponentService;
	    
	    editController = $controller('ComponentEditController', {
		      $scope : $scope,
		      loadedData: {data:{}, errors:[]}
	    });

	    var mockForm = {};
	    mockForm.$setPristine = function(){};
	    $scope.componentForm = mockForm;
	    
  }));

  it('check if id is set after save', function() {
	  var component = {"name":"Component Name"};
	  httpMock.whenPOST("component").respond({"name":"Component Name", "id":"DGS6437gh"}); 
	  
	  $scope.save(component);
	  httpMock.flush();
	  expect($scope.component.id).toBe("DGS6437gh");
  });
  
  it('verify post if id is empty string', function() {
	  var component = {"name":"Component Name"};
	  httpMock.whenPOST("component").respond({"name":"Component Name", "id":"DGS6437gh"}); 
	  $scope.save(component);
	  httpMock.flush();
	  expect($scope.component.id).toBe("DGS6437gh");
  });
  
  it('verify error handled correctly', function() {
	  var errorMessageResponse = {
			  "messages" : {
				    "name" : [ "component.name.required" ]
				  }
				};
	  httpMock.whenPOST("component").respond(400, errorMessageResponse); 
	
	  var component = {"name":"", "id":""};
	  $scope.save(component);
	  httpMock.flush();
	  expect($scope.errors.length).toBe(1);
	  expect($scope.errors[0]).toBe("component.name.required");
  });


  it('check update if id is found on object', function() {
	  var component = {"name":"Component Name", "id":"DGS6437gh"};
	  httpMock.expectPUT("component/DGS6437gh").respond(component); 
	  $scope.save(component);
	  httpMock.flush();
  });
  
  it('saving indicator toggles correctly', function() {
	  var component = {"name":"Component Name", "id":""};
	  expect($scope.savingIndicator).toEqual(false);
	  httpMock.whenPOST("component").respond({"name":"Component Name", "id":"DGS6437gh"}); 
	  $scope.save(component);
	  expect($scope.savingIndicator).toEqual(true);
	  httpMock.flush();
	  expect($scope.savingIndicator).toEqual(false);
  });
 
});

