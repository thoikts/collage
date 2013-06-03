/*
    
    Collage controller renders a collage page based on the collage id the parameter

*/
define(["jquery","models/collage/collage","views/pages/collage"],function($,CollageData,CollagePage){
	return {
		run : function(id){
            
            var collageData = CollageData.fromHash(id);

            $(".container").html(
                new CollagePage({ model : collageData }).render()
            );
		}
	};
});