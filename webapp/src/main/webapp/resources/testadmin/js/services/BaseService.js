BaseService = {
	errorHandler : function (response) {
		var returnVal = {
				data : {},
				errors : []
		};
		for(var field in response.data.messages){
         	for(var messages in response.data.messages[field]) {
         		returnVal.errors.push(response.data.messages[field][messages]);
         	}
 		}
		return returnVal;
	},

	successHandler: function(response) {
		return  {
				data : response.data,
				errors : []
		};
    },
    
    save : function(object){
		if(object.id){
			return this.update(object);
		}else{
			return this.create(object);
		}
	},

	create : function(object) {
		var url = this.getBaseUrl() + this.getResource();
		return this.getHttp()({
				method: "POST",
				url: url,
				data: object
				}).then(this.successHandler, this.errorHandler);
	},

	update : function(object) {
		var url = this.getBaseUrl() + this.getResource() + '/' + object.id;
		return this.getHttp()({
				method: "PUT",
				url: url,
				data: object
				}).then(this.successHandler, this.errorHandler);
	},
	
	patch: function(id, object) {
		var url = this.getBaseUrl() + this.getResource() + '/' + id;
		return this.getHttp()({
				method: "PATCH",
				url: url,
				data: object
				}).then(this.successHandler, this.errorHandler);
	},

	search : function(params){
		var url = this.getBaseUrl() + this.getResource() + '/?_=' + Math.random();
	    return  this.getHttp()({
            method: 'GET',
            url: url,
            params: params
	    }).then(this.successHandler, this.errorHandler);
	},

	remove : function(id){
        return this.getHttp()({
                method: 'DELETE',
                url: this.getBaseUrl() + this.getResource() + '/' + id
        }).then(this.successHandler, this.errorHandler);
    },
	findAll : function(){
		var url = this.getBaseUrl() + this.getResource() +  '?_=' + Math.random();
		return  this.getHttp().get(url).then(this.successHandler, this.errorHandler);
	},
	findById : function(id){
		var url = this.getBaseUrl() + this.getResource() + '/' + id + '?_=' + Math.random();
		return  this.getHttp().get(url).then(this.successHandler, this.errorHandler);
	}
};
