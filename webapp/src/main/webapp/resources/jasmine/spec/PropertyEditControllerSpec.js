


describe('PropertyEditController ', function() {
  var $scope, editController, service = null;

  //you need to indicate your module in a test
  beforeEach(module('progman'));
 
  beforeEach(inject(function($rootScope, $controller, $injector, $state, $http, PropertyConfigService) {
	    //create a scope object for us to use.
	    $scope = $rootScope.$new();
	    httpMock = $injector.get('$httpBackend');
		
	    //respond nothing for templates....
	    httpMock.whenGET(/\.html/).respond("");

	    service  = PropertyConfigService;
	    
	    editController = $controller('PropertyEditController', {
		      $scope : $scope,
		      loadedData:{data:{}, errors: []}
	    });

	    var mockForm = {};
	    mockForm.$setPristine = function(){};
	    $scope.configForm = mockForm;
	    
  }));

  
  it('check if id is set after save', function() {
	  var propertyConfig = {"name":"dude","envName":"dev"};
	  httpMock.whenPOST("propertyConfig").respond({"name":"dude", "envName":"dev", "id":"abc123"}); 
	  
	  $scope.save(propertyConfig);
	  httpMock.flush();
	  expect($scope.propertyConfig.id).toBe("abc123");
  });
  
  it('verify post if id is empty string', function() {
	  var propertyConfig = {"name":"dude","envName":"dev" , "id":""};
	  httpMock.whenPOST("propertyConfig").respond({"name":"dude", "envName":"dev", "id":"abc123"}); 
	  $scope.save(propertyConfig);
	  httpMock.flush();
	  expect($scope.propertyConfig.id).toBe("abc123");
  });
  
  it('verify error handled correctly', function() {
	  var propertyConfig = {"name":"dude","envName":"dev"};
	  var errorMessageResponse = {
			  	"messages" : {
				"properties" : [ "propertyConfig.properties.required" ]
				}
			};
	  httpMock.whenPOST("propertyConfig").respond(400, errorMessageResponse); 
	  
	  $scope.save(propertyConfig);
	  httpMock.flush();
	  expect($scope.errors.length).toBe(1);
	  expect($scope.errors[0]).toBe("propertyConfig.properties.required");
  });


  it('check update if id is found on object', function() {
	  var propertyConfig = {"name":"dude","envName":"dev", "id":"abc123"};
	  httpMock.expectPUT("propertyConfig/abc123").respond({"name":"dude", "envName":"dev", "id":"abc123"}); 
	  $scope.save(propertyConfig);
	  httpMock.flush();
  });
  
  
  it('saving indicator toggles correctly', function() {
	  var propertyConfig = {"name":"dude","envName":"dev"};
	  expect($scope.savingIndicator).toEqual(false);
	  httpMock.whenPOST("propertyConfig").respond({"name":"dude", "envName":"dev", "id":"abc123"}); 
	  $scope.save(propertyConfig);
	  expect($scope.savingIndicator).toEqual(true);
	  httpMock.flush();
	  expect($scope.savingIndicator).toEqual(false);
  });
 
});

