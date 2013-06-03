define(["jquery","underscore","backbone","helpers/filters"], function($,_,Backbone,Filters){

    //fabric is imported globally

    // patch fabric for cross domain image jazz
    fabric.Image.fromURL=function(d,f,e){
        console.log("calling patched Image.fromURL");

        var c=fabric.document.createElement("img");
        c.onload=function(){
            if(f){f(new fabric.Image(c,e))}
            c=c.onload=null
        };
        c.setAttribute('crossOrigin','anonymous');
        c.src=d;
    };

    /*
        Canvas helper is an adaptor on top of fabric.js (http://fabricjs.com/) canvas API
    */
    var Canvas = function(canvasElementId){
        this.__canvas = new fabric.Canvas(canvasElementId);
        this.__canvas.selection = false;
        this.__canvas.on("mouse:up", _.bind(function(){ this.trigger("click"); }, this));
    };

    _.extend(Canvas.prototype, Backbone.Events, {

        getCanvas : function(){
            return this.__canvas;
        },
        
        clear : function(){
            this.__canvas.clear();
        },

        toDataURL : function(options){
            return this.__canvas.toDataURL(options);
        },

        setOverlayImage : function(imageUrl){

            var dfd = $.Deferred();

            if(imageUrl){
                this.__canvas.setOverlayImage(imageUrl,
                    _.bind(function(){
                        this.__canvas.renderAll();
                        dfd.resolve();
                    },this)
                );    
            } else {
                dfd.resolve();
            }

            return dfd.promise();
        },

        disableEditing : function(){
            var img = this.getImageObject();
            if(img){
                img.selectable = false;
            }
        },

        setImage : function(url){
            
            var width = this.__canvas.getWidth(), height = this.__canvas.getHeight(), dfd = $.Deferred();

            if(url){
                fabric.Image.fromURL(url, _.bind(function(img) {
                        
                        if(width > height){
                            img.scaleToWidth(width);                        
                        }else{
                            img.scaleToHeight(height);
                        }

                        img.set({ 
                            left : img.getWidth()/2, 
                            top: img.getHeight()/2, 
                            hasControls : false,
                            borderColor : 'rgba(255,255,255,0)' //no border, please
                        });
                        
                        if(this.getImageObject()){
                            this.__canvas.remove(this.getImageObject());
                        }
                        this.__canvas.add(img);   

                        dfd.resolve(img.scaleX);
         
                    },this)
                );    
            }else{
                dfd.resolve(1);       
            }

            return dfd.promise();
        },

        flipX : function(flip){
            this.__canvas.getObjects()[0].setFlipX(flip);
            return this.__canvas.renderAll();
        },

        flipY : function(flip){
            this.__canvas.getObjects()[0].setFlipY(flip);
            return this.__canvas.renderAll();
        },

        zoom : function(zoom){
            this.__canvas.getObjects()[0].scale(zoom);
            return this.__canvas.renderAll();
        },

        getWidth : function(){
            return this.__canvas.getWidth();
        }, 

        getHeight : function(){
            return this.__canvas.getHeight();
        },

        getImageObject : function(){
            return this.__canvas.getObjects()[0];            
        },

        renderAll : function(){
            return this.__canvas.renderAll.bind(this.__canvas);
        }

    });


    /*
        Composite canvas is used to create the resulting collage canvas 
        containing visuals from multiple canvases 
    */
    var CompositeCanvas = function(canvasElement,options){
        this.__canvas = new fabric.Canvas(canvasElement,options);
        this.__canvas.selection = false;
    };

    CompositeCanvas.prototype = {

        clear : function(){
            this.__canvas.clear();
        },

        // add content from the given canvas to the current composite canvas
        // offset the content of the canvas by @offsetX horizontally
        // and @offsetY vertically
        addCanvas : function(canvas,offsetX,offsetY,frameWidth,frameHeight){
            var img = document.createElement("img");
            img.onload= _.bind(function(){                
                var i = new fabric.Image(img); 

                i.set({ left : offsetX + frameWidth/2, top: offsetY + frameHeight/2, hasControls : false });
                
                this.__canvas.add(i);
                img=img.onload=null;

            },this);
            img.src=canvas.toDataURL({format : 'jpeg'});
        },

        // base64 representation of the result
        toDataURL : function(removePrefix){
            var d = this.__canvas.toDataURL({format : 'jpeg'});
            return removePrefix ? d.replace("data:image/jpeg;base64,","") : d; 
        }
    };

    return {

        Canvas : Canvas,
        CompositeCanvas : CompositeCanvas,

        /*
            A shortcut for creating a filter (see helpers/filters for details)
        */
        createFilter : function(type){
            return Filters.createFilter(type);
        },

        /*
            Create and invisible composite canvas to build a collage
        */
        getOffscreenCompositeCanvas : function(width,height){
            var canvas = document.createElement("canvas");
            
            canvas.setAttribute("width",width);
            canvas.setAttribute("height",height);
        
            document.body.appendChild(canvas);

            return new CompositeCanvas(canvas,{ containerClass : "hidden-canvas"}); 
        },

        /*
            Create a canvas attached to the element specified through @canvasElementId
        */
        create : function(canvasElementId, composite){
            if(!composite){
                return new Canvas(canvasElementId);    
            } else {
                return new CompositeCanvas(canvasElementId);
            }
        }
    };

});
