define(["jquery", "filepicker", "models/filepicker/filepicker", "settings"],function($,filepicker,filepickerHelper,settings){

    /*
        Adapter around Filepicker Dialog so it can be used with a promise interface
        Also configures the Dialog to be image centric
    */

    var pictureMimes = ['image/*'],
        services = ['FACEBOOK','INSTAGRAM','PICASA','FLICKR','DROPBOX','IMAGE_SEARCH','COMPUTER','URL','WEBCAM','GOOGLE_DRIVE','BOX'];


    function initialize(key) {
        filepicker.setKey(key);
    }

    initialize(settings.filepickerApplicationKey);

    return {

        loadImage : function(afterImagePicked){

            var dfd = $.Deferred();

            filepicker.pick( { mimetypes: pictureMimes, services: services },
                function(file){
                    
                    if(typeof afterImagePicked !== 'undefined'){
                        afterImagePicked();
                    }

                    $.when(filepickerHelper.resizeIfNeeded(file)).done(function(file){
                        dfd.resolve(file);    
                    }); 
                },
                function(fpError){ dfd.reject(fpError); }
            );     

            return dfd.promise();
        },

        saveImage : function(file){
            var dfd = $.Deferred();

            filepicker.exportFile(file, {mimetype:'image/'},
                function(FPFile){
                    dfd.resolve(FPFile);
                }
            );
            
            return dfd.promise();
        }

    };

});