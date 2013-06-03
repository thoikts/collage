/*
    Wrappers around fabric.js filters 
*/

define(function(){

    //fabric is imported globally

    var Filter = function(){};
    Filter.prototype = {
        apply : function(imageObject, canvas){
  
            var filter = this.__definition();

            imageObject.filters = [];

            if(filter){
                imageObject.filters.push(filter);
            }
            
            imageObject.applyFilters(canvas.renderAll.bind(canvas));
        },

        __definition : function(){
            throw new Error("Not implemented");
        }
    };

    var ClearFilter = function(){};
    _.extend(ClearFilter.prototype, Filter.prototype, {
        __definition : function(){
            return null;
        }  
    });

    var GrayscaleFilter = function(){};
    _.extend(GrayscaleFilter.prototype, Filter.prototype, {
        __definition : function(){
            return new fabric.Image.filters.Grayscale();
        }  
    });  

    var SepiaFilter = function(){};
    _.extend(SepiaFilter.prototype, Filter.prototype, {
        __definition : function(){
            return new fabric.Image.filters.Sepia();
        }  
    });  

    var Sepia2Filter = function(){};
    _.extend(Sepia2Filter.prototype, Filter.prototype, {
        __definition : function(){
            return new fabric.Image.filters.Sepia2();
        }  
    });
    
    var InvertFilter = function(){};
    _.extend(InvertFilter.prototype, Filter.prototype, {
        __definition : function(){
            return new fabric.Image.filters.Invert();
        }  
    });

    var ConvoluteFilter = function(){};
    _.extend(ConvoluteFilter.prototype, Filter.prototype, {
        __definition : function(){
            return new fabric.Image.filters.Convolute({matrix: [  0, -1,  0, -1,  5, -1, 0, -1,  0 ]});
        }  
    });

    var SuperConvoluteFilter = function(){};
    _.extend(SuperConvoluteFilter.prototype, Filter.prototype, {
        __definition : function(){
            return new fabric.Image.filters.Convolute({ matrix: [ 1,   1,  1,  1, 0.7, -1, -1,  -1, -1 ]});
        }  
    });

    var NoiseFilter = function(){};
    _.extend(NoiseFilter.prototype, Filter.prototype, {
        __definition : function(){
            return new fabric.Image.filters.Noise({noise: 40});
        }  
    });

    var PixelateFilter = function(){};
    _.extend(PixelateFilter.prototype, Filter.prototype, {
        __definition : function(){
            return new fabric.Image.filters.Pixelate({blocksize: 1.5});
        }  
    });

    return {
        createFilter : function(type){
            var filters = {
                clear : function(){ return new ClearFilter(); },
                grayscale : function(){ return new GrayscaleFilter(); },
                sepia : function(){ return new SepiaFilter(); },
                sepia2 : function(){ return new Sepia2Filter(); },
                invert : function(){ return new InvertFilter(); },
                convolute : function(){ return new ConvoluteFilter(); },
                superconvolute : function(){ return new SuperConvoluteFilter(); },
                noise : function(){ return new NoiseFilter(); },
                pixelate : function(){ return new PixelateFilter(); }
            };

            return filters[type] ? filters[type]() : null;
        }
    };

});