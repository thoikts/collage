define(["jquery","underscore","backbone","helpers/canvas",
    "models/editor/tile","handlebars","text!templates/editor/tile.html"],

    function($,_,Backbone,CanvasHelper,TileData,Handlebars,template){

        /*
            Tiles are rendered within the frame
            Each tile can have an image associated with it
        */
    
        var Tile = Backbone.View.extend({
            tagName : "li",
            className : "empty",
            template : Handlebars.compile(template),

            initialize : function(){

                // tiles can be edited by default
                this.__canEdit = true;

                // add/update image associated with the tile
                this.model.on("change:imageUrl", function(model,imageUrl){
                    this.__addImage(imageUrl);
                }, this);

                // update UI when selected/deselected
                this.model.on("change:selected", function(){
                    this.__adjustSelectionStyle();
                },this);

                // apply flip transformation
                this.model.on("change:horizontalFlip", function(model, horizontalFlip){
                    if(this.__canvas){
                        this.__canvas.flipX(horizontalFlip); 
                    }
                }, this);

                // apply flip transformation
                this.model.on("change:verticalFlip", function(model, verticalFlip){
                    if(this.__canvas){
                        this.__canvas.flipY(verticalFlip);
                    }
                }, this);

                // zoom in/out
                this.model.on("change:zoomLevel", function(model, zoomLevel){
                    if(this.__canvas){
                        this.__canvas.zoom(zoomLevel);
                    }
                }, this);
            },

            // show loading animation
            loading : function(){
                if(this.__canvas){
                    this.__canvas.clear();
                }
                $(this.el).removeClass("empty").addClass("loading");
            },

            // render image on the underlying canvas
            __addImage : function(imageUrl){
                if(this.__canvas){
                    $.when(this.__canvas.setImage(imageUrl)).done(_.bind(function(zoom){
                        this.__afterSetImage();
                        this.model.set({zoomLevel : zoom}, {silent: true});
                        this.model.set({ loaded : true });

                        // if there's a filter associated with the image, apply it
                        if(this.model.get("filter")){
                            this.applyFilter(this.model.get("filter"));
                        }

                    }, this));
                }  
            },

            // create a canvas for the tile
            __buildCanvas : function(id){
                this.__canvas = CanvasHelper.create(id);        
                this.__canvas.on("click", function(){
                    if(this.__canEdit){
                        this.model.select();
                        this.trigger("edit", this.model);
                    }
                }, this);
            },

            render : function(){

                this.__adjustSelectionStyle();

                var canvasId = _.uniqueId("c");

                $(this.el).html(this.template({
                    canvasId : canvasId,
                    width : this.model.get("width"),
                    height : this.model.get("height")
                }));                

                // delay canvas creation to make sure the underlying DOM element is there
                setTimeout(_.bind(function(){
                    
                    this.__buildCanvas(canvasId);

                    $.when(this.__canvas.setOverlayImage(this.model.get("frame"))).done(_.bind(function(){
                        this.trigger("rendered");
                    },this));


                    // if there's already an image associated with the tile, render it
                    if(this.model.get("imageUrl")){
                        this.__addImage(this.model.get("imageUrl"));
                    }

                },this),200);

                return this.el;
            },

            applyFilter : function(name){
                var filter = CanvasHelper.createFilter(name);
                if(filter){
                    this.model.set({ filter : name });
                    filter.apply(this.__canvas.getImageObject(),this.__canvas.getCanvas());
                }     
            },

            getCanvas : function(){
                return this.__canvas;
            },

            isImageSet : function(){
                return this.model.get("imageUrl");
            },

            // switch to read-only mode
            // - cannot add/update images
            // - cannot transform images
            disableEditing : function(){

                this.__canEdit = false;

                if(this.__canvas){
                    this.__canvas.disableEditing();
                }
            },

            dim : function(){
                $(this.el).addClass("dim");
            },

            undim : function(){
                $(this.el).removeClass("dim");
            },

            __adjustSelectionStyle : function(){
                if(this.model.get("selected")){
                    $(this.el).addClass("selected");
                }else{
                    $(this.el).removeClass("selected");
                }
            },

            __afterSetImage : function(){
                $(this.el).removeClass("loading").removeClass("empty");
            }

        });

        return {
            create : function(tile){
                if(tile instanceof TileData.Tile){
                    return new Tile({ model : tile });
                } else {
                    throw new Error("Invalid argument");
                }
            }
        };
    }
);