testreg.directive("menuSlider", function() {
	return {
		restrict:"A",
		transclude:false,
		link:function(scope, element, attrs){
		    element.bind("click", function(){
		    	 if($(this).hasClass('show')){
		    		    $( ".slider-arrow, .secondary .navCore" ).animate({
		    	          left: "+=220"
		    			  }, 700, function() {
		    	            // Animation complete.
		    	          });
		    			  $(".secContent").animate({'margin-left': "240px"}, 700, function(){});		    			
		    			  $(this).html('&laquo;').removeClass('show').addClass('hide');
		    			  scope.menuSliding(false);
		    	  } else {   	
		    		    $( ".slider-arrow, .secondary .navCore" ).animate({
		    	          left: "-=220"
		    			  }, 700, function() {
		    	            // Animation complete.
		    	          });
		    			  $(".secContent").animate({'margin-left': "0px"}, 700, function(){});    			  
		    			  $(this).html('&raquo;').removeClass('hide').addClass('show');    
		    			  scope.menuSliding(true);
		    	}
		    });
		}
	};
});
