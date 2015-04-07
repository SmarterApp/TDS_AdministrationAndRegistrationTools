testreg.factory("AccommodationService", function($http){

    return {
    	
	    subjects : function(studentId,stateAbbreviation) {
    		var url = baseUrl + 'subjects' + '/?_=' + Math.random();
			return $http.get(url).then(this.successHandler, this.errorHandler);
	    },

	    americanSignLanguage : function() {
			return  [
			         	{name:"TDS_ASL0",description:"Do not show ASL videos"},
			         	{name:"TDS_ASL1",description:"Show ASL videos"},
					];
	    },
	    
	    colorContrast : function() {
			return  [
			         	{name:"TDS_CCMagenta",description:"Black on Rose"},
			         	{name:"TDS_CCMedGrayLtGray",description:"Medium Gray on Light Gray"},
			         	{name:"TDS_CCYellowB",description:"Yellow on Blue"},
			         	{name:"TDS_CCInvert",description:"Reverse Contrast"},		
			         	{name:"TDS_CC0",description:"Black on White"},		
					];
	    },
    
	    closedCaptioning : function() {
			return  [
			         	{name:"TDS_ClosedCap0",description:"Closed Captioning Not Available"},
			         	{name:"TDS_ClosedCap1",description:"Closed Captioning Available"},
					];
	    },
	    
	    language : function() {
			return  [
			         	{name:"ENU",description:"English"},
			         	{name:"ENU-Braille",description:"Braille"},
			         	{name:"ESN",description:"Spanish (Stacked Translation)"},		
					];
	    },
	    
	    masking : function() {
	    	return [
	    	        	{name:"TDS_Masking0",description:"Masking Not Available"},
	    	        	{name:"TDS_Masking1",description:"Masking Available"}
	    	       ];
	    },
	    
	    permissiveMode : function() {
	    	return [
	    	        	{name:"TDS_PM0",description:"Permissive Mode Disabled"},
	    	        	{name:"TDS_PM1",description:"Permissive Mode Enabled"}
	    	        ];
	    },
	    
	    printOnDemand : function() {
			return  [
			         	{name:"TDS_PoD_Stim",description:"Stimuli"},
			         	{name:"TDS_PoD0",description:"None"},
			         	{name:"TDS_PoD_Items",description:"Items"},
			         	{name:"TDS_PoD_Stim&TDS_PoD_Items",description:"Stimuli and Items"},
			         	
					];
	    },

	    printSize : function() {
			return  [
			         	{name:"TDS_PS_L0",description:"No default zoom applied"},
			         	{name:"TDS_PS_L1",description:"Level 1"},
			         	{name:"TDS_PS_L2",description:"Level 2"},
			         	{name:"TDS_PS_L3",description:"Level 3"},	
			         	{name:"TDS_PS_L4",description:"Level 4"},	
					];
	    },

	    streamlinedInterface : function() {
	    	return [
	    	        	{name:"TDS_SLM0",description:"Off"},
	    	        	{name:"TDS_SLM1",description:"On"}
	    	       ];
	    },

	    textToSpeech : function() {
			return  [
			         	{name:"TDS_TTS_Stim&TDS_TTS_Item",description:"Stimuli and Items"},
			         	{name:"TDS_TTS_Item",description:"Items Only"},
			         	{name:"TDS_TTS_Stim",description:"Stimuli Only"},
			         	{name:"TDS_TTS0",description:"None"},			
					];
	    }, 
	    
	    translation : function() {
			return  [
			         	{name:"TDS_WL_Glossary",description:"English"},
			         	{name:"TDS_WL_ArabicGloss",description:"Arabic"},
			         	{name:"TDS_WL_CantoneseGloss",description:"Cantonese"},
			         	{name:"TDS_WL_ESNGlossary",description:"Spanish"},
			         	{name:"TDS_WL_KoreanGloss",description:"Korean"},
			         	{name:"TDS_WL_MandarinGloss",description:"Mandarin"},
			         	{name:"TDS_WL_PunjabiGloss",description:"Punjabi"},
			         	{name:"TDS_WL_RussianGloss",description:"Russian"},
			         	{name:"TDS_WL_TagalGloss",description:"Filipino (Ilokano and Tagalog)"},
			         	{name:"TDS_WL_UkrainianGloss",description:"Ukrainian"}, 
			         	{name:"TDS_WL_VietnameseGloss",description:"Vietnamese"},
			         	{name:"TDS_WL_Glossary&TDS_WL_ArabicGloss",description:"English & Arabic"}, 
			         	{name:"TDS_WL_Glossary&TDS_WL_CantoneseGloss",description:"English & Cantonese"}, 
			         	{name:"TDS_WL_Glossary&TDS_WL_ESNGlossary",description:"English & Spanish"}, 
			         	{name:"TDS_WL_Glossary&TDS_WL_KoreanGloss",description:"English & Korean"},
			         	{name:"TDS_WL_Glossary&TDS_WL_MandarinGloss",description:"English & Mandarin"}, 
			         	{name:"TDS_WL_Glossary&TDS_WL_PunjabiGloss",description:"English & Punjabi"},
			         	{name:"TDS_WL_Glossary&TDS_WL_RussianGloss",description:"English & Russian"},
			         	{name:"TDS_WL_Glossary&TDS_WL_TagalGloss",description:"English & Filipino (Ilokano and Tagalog)"}, 
			         	{name:"TDS_WL_Glossary&TDS_WL_UkrainianGloss",description:"English & Ukrainian"}, 
			         	{name:"TDS_WL_Glossary&TDS_WL_VietnameseGloss",description:"English & Vietnamese"},
			         	{name:"TDS_WL0",description:"None"},				         	
					];
	    },
	    
	    nonEmbeddedDesignatedSupports : function() {
	    	return [
	    	        	{name:"NEDS0",description:"None"},
	    	        	{name:"NEDS_BD",description:"Bilingual Dictionary"},
	    	        	{name:"NEDS_CC",description:"Color Contrast"},
	    	        	{name:"NEDS_CO",description:"Color Overlay"},
	    	        	{name:"NEDS_Mag",description:"Magnification"},
	    	        	{name:"NEDS_NoiseBuf",description:"Noise Buffer"},
	    	        	{name:"NEDS_RA_Items",description:"Read Aloud Items"},
	    	        	{name:"NEDS_SC_Items",description:"Scribe Items (Non-Writing)"},
	    	        	{name:"NEDS_SS",description:"Separate Setting"},
	    	        	{name:"NEDS_TransDirs",description:"Translated Test Directions"},
	    	        	{name:"NEDS_TArabic",description:"Glossary - Arabic"},
	    	        	{name:"NEDS_TCantonese",description:"Glossary - Cantonese"},
	    	        	{name:"NEDS_TFilipino",description:"Glossary - Filipino (Ilokano and Tagalog)"},
	    	        	{name:"NEDS_TKorean",description:"Glossary - Korean"},
	    	        	{name:"NEDS_TMandarin",description:"Glossary - Mandarin"},
	    	        	{name:"NEDS_TPunjabi",description:"Glossary - Punjabi"},
	    	        	{name:"NEDS_TRussian",description:"Glossary - Russian"},
	    	        	{name:"NEDS_TSpanish",description:"Glossary - Spanish"},
	    	        	{name:"NEDS_TUkrainian",description:"Glossary - Ukrainian"},
	    	        	{name:"NEDS_TVietnamese",description:"Glossary - Vietnamese"},
	    	       ];
	    },
	    
	    nonEmbeddedAccommodations : function() {
			return  [
			         	{name:"NEA0",description:"None"},
			         	{name:"NEA_AR",description:"Alternate Response Options"},
			         	{name:"NEA_RA_Stimuli",description:"Read Aloud Stimuli"},
			         	{name:"NEA_SC_WritItems",description:"Scribe Items (Writing)"},
			         	{name:"NEA_STT",description:"Speech-to-Text"},
			         	{name:"NEA_Abacus",description:"Abacus"},
			         	{name:"NEA_Calc",description:"Calculator"},
			         	{name:"NEA_MT",description:"Multiplication Table"},
			        	
					];
	    }, 
	    
	    	    
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
      
    };
});
