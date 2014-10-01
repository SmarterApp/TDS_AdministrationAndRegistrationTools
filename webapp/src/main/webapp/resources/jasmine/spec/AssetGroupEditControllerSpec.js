


describe('AssetGroup Edit Controller ', function() {
  var $scope, editController, service = null;

  var savedAssetGroup = {
		  "id" : "id_12345",
		  "tenantId" : "51fee64b46d1c929412e778f",
		  "componentName" : "tib",
		  "assets" : [ {
		    "name" : "backgroundColor",
		    "type" : "PROPERTY",
		    "property" : "red",
		    "assetFileGridId" : null
		  }, {
		    "name" : "title text",
		    "type" : "PROPERTY",
		    "property" : "hello world",
		    "assetFileGridId" : null
		  } ],
		};

  //you need to indicate your module in a test
  beforeEach(module('progman'));
 
  beforeEach(inject(function($rootScope, $controller, $injector, $state, $http) {
	    //create a scope object for us to use.
	    $scope = $rootScope.$new();
	    httpMock = $injector.get('$httpBackend');
		
	    //respond nothing for templates....
	    httpMock.whenGET(/\.html/).respond("");

	    //tenants is called to load selectbox
	    httpMock.whenGET(/^tenant\/51fee64b46d1c929412e778f/).respond({
	    	  "id" : "51fee64b46d1c929412e778f",
	    	  "name" : "Wisconsin",
	    	  "type" : "STATE",
	    	  "url" : "/tenant/51fee64b46d1c929412e778f"
	    	}); 
	    
	    httpMock.whenGET(/^assetPool\/tenant\/51fee64b46d1c929412e778f/).respond({
	    	  "id" : "520d40607b023b2cc54dd3e9",
	    	  "tenantId" : "51fee64b46d1c929412e778f",
	    	  "name" : "Asset Pool for Wisconsin",
	    	  "assets" : [ {
		    	    "name" : null,
		    	    "type" : null,
		    	    "property" : "/assetPool/assetFile/520e50967b02f5c3eb7d048c/keanu-reeves-cheer-up.png",
		    	    "assetFileGridId" : "520e50967b02f5c3eb7d048c",
		    	    "assetFileName" : "keanu-reeves-cheer-up.png",
		    	    "fileContentType" : "image/jpeg",
		    	    "basePath" : "http://localhost:8089/prog-mgmnt.rest",
		    	    "url" : "http://localhost:8089/prog-mgmnt.rest/assetPool/assetFile/520e50967b02f5c3eb7d048c/keanu-reeves-cheer-up.png"
		    	  }],
	    	  "url" : "/assetPool/520d40607b023b2cc54dd3e9"
	    	}); 
	    
	  
	    
	    editController = $controller('AssetGroupEditController', {
		      $scope : $scope,
		      loadedData : {data:savedAssetGroup, errors:[]}
	    });

	    var mockForm = {};
	    mockForm.$setPristine = function(){};
	    $scope.assetGroupForm = mockForm;
	    
  }));

  it('verify tenant info loaded', function(){
	  httpMock.flush();
	  expect($scope.tenant.name).toBe('Wisconsin');
  });
  
  it('verify assetPool info loaded', function(){
	  httpMock.flush();
	  expect($scope.assetsFromPool.length).toBe(1);
	  expect($scope.assetsFromPool[0].assetFileName).toBe("keanu-reeves-cheer-up.png");
	  expect($scope.assetsFromPool[0].assetFileGridId).toBe("520e50967b02f5c3eb7d048c");
	  expect($scope.assetsFromPool[0].url).toBe("http://localhost:8089/prog-mgmnt.rest/assetPool/assetFile/520e50967b02f5c3eb7d048c/keanu-reeves-cheer-up.png");
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
	  httpMock.whenPUT("assetGroup/"+savedAssetGroup.id).respond(savedAssetGroup); 
	  $scope.save(savedAssetGroup);
	  expect($scope.savingIndicator).toEqual(true);
	  httpMock.flush();
	  expect($scope.savingIndicator).toEqual(false);
  });
 
});

