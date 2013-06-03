define(["jquery", "filepicker"],function($, filepicker){

    // max dimensions for image scaling
    var maxWidth = 700, maxHeight = 700;

    return {
        /*
            Adapter around Filepicker.store
        */
        store : function(imageData){
            var dfd = $.Deferred();
            filepicker.store(imageData, {location: 'S3', base64decode: true, filename: 'collage.jpg'},
                function(new_fpfile){
                    return dfd.resolve(new_fpfile);
                }
            );
            return dfd.promise();
        },

        /* 
            Resizes an the image if its bigger dimension exceeds maxWidth/maxHeight
        */
        resizeIfNeeded : function(file){
            var dfd = $.Deferred();

            filepicker.stat(file, {width: true, height: true},
              function(metadata){
                
                var targetDimension = metadata.width > metadata.height ? "width" : "height",
                    needsScaling = (targetDimension === "width") ? metadata.width > maxWidth : 
                        metadata.height > maxHeight;

                if(needsScaling){

                    var scalingOptions = { fit : 'crop' };  

                    if(targetDimension === "width"){
                        scalingOptions.width = maxWidth;
                    } else {
                        scalingOptions.height = maxHeight;
                    }

                    filepicker.convert(file, scalingOptions,
                        _.bind(function(file){
                            dfd.resolve(file);
                        },this) 
                    );

                } else {
                    dfd.resolve(file);
                }

                
            });

            return dfd.promise();
        }
    };

});