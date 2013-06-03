(function(window){
    define(["jquery","models/filepicker/filepicker"],function($,FilepickerData){
        
        /*
            Collage data contains all the data required to render a collage
        */
        var CollageData = function(file){
            this.file = file;
            if(!this.file.filename){
                this.file.filename = "collage.jpg";
            }
        };

        CollageData.prototype = {

            /*
                returns a FPFile object
            */
            getFile : function(){
                return this.file;
            },

            /*
                returns absolute or relative url for the collage
            */
            getUrl : function(absolute){
                
                absolute = (typeof absolute !== 'undefined') ? absolute : true; 

                var parts = this.file.url.split("https://www.filepicker.io/api/file/");
                
                if(parts.length === 2){
                    var url = "/c/" + parts[1]; 
                    return absolute ? (window.location.protocol + "//" + window.location.host + url) : url;
                }   
            },

            /*
                Mimicking Backbone.Model.toJSON
            */
            toJSON : function(){
                return { 
                    file : this.file, 
                    collageUrl : this.getUrl(false)
                };
            }
        };

        return {

            /*
                Create a CollageData model based on the collage id
                The id of the collage is the same as the id of the underlying Filpicker file
            */
            fromHash : function(id){
                return new CollageData({ url : "https://www.filepicker.io/api/file/" + id });
            },

            /*
                Create a CollageData object based on the base64 data passed as @dataUrl
                Collage file is generated on S3 using filepicker to obtain an FPFile object
            */
            fromDataUrl : function(dataUrl){
                var dfd = $.Deferred();

                $.when(FilepickerData.store(dataUrl)).done(function(file){
                    dfd.resolve(new CollageData(file));
                });

                return dfd.promise();
            }
        };

    });
}(window));