define(["jquery","underscore","backbone","handlebars", "models/editor/tile", "text!templates/editor/toolbar.html"],
    function($,_,Backbone,Handlebars,Tile,template){

        /*
            The toolbar is rendered above the frame
            It has the model of a currently selected tile associated with it and allows users 
            to apply transformations on the selected tile  
        */
        var Toolbar = Backbone.View.extend({
            className: "toolbar hidden",
            template : Handlebars.compile(template),
            thumbnailSize : 47,

            events : {
                "click .flip-horizontal" : "onFlipHorizontal",
                "click .flip-vertical" : "onFlipVertical",
                "click .zoom-in" : "onZoomIn",
                "click .zoom-out" : "onZoomOut",
                "click .change-image" : "onChangeImage",
                "click .done" : "onDone"
            },

            onFlipHorizontal : function(){  
                if(this.model){
                    this.model.flipHorizontally();
                }
            },

            onFlipVertical : function(){ 
                if(this.model){
                    this.model.flipVertically();
                }
            },

            onZoomIn : function(){ 
                if(this.model){
                    this.model.zoomIn();
                }
            },
            
            onZoomOut : function(){ 
                if(this.model){
                    this.model.zoomOut();
                }
            },
            
            onChangeImage : function(){
                if(this.model){
                    this.trigger("change-image", this.model);
                }
            },
            
            onDone : function(){ 
                if(this.model){
                    this.model.deselect();
                }         

                this.trigger("done");
            }, 

            show : function(){
                if(this.model){
                    $.when(this.model.loaded()).done(_.bind(function(){
                        $(this.el).removeClass("hidden");
                    },this));
                }                
            },

            hide : function(){
                $(this.el).addClass("hidden");
            },

            setTile : function(tile){
                if(tile instanceof Tile.Tile){
                    
                    if(this.model !== tile){
                        this.hideThumbnail();
                    }

                    this.model = tile;
                    
                    this.model.on("change:selected", function(model, selected){
                        if(selected){ this.show();}
                        else { this.hide();}
                    },this);

                    // grab a thumbnail for the current tile
                    $.when(this.model.getThumbnail(this.thumbnailSize,this.thumbnailSize)).done(_.bind(function(url){
                        this.showThumbnail();
                    },this));

                } else {
                    throw new Error("Invalid argument");
                }
            },

            hideThumbnail : function(){
                $(this.el).find("ul li:first-child").html("");
            },

            showThumbnail : function(){
                $(this.el).find("ul li:first-child").html(
                    jQuery("<img>")
                        .attr("src", this.model.get("thumbnail"))
                        .attr("width", this.thumbnailSize)
                        .attr("height", this.thumbnailSize)
                );
            },

            render : function(){
                $(this.el).html(this.template({}));
                return this.el;
            }
        });

        return {
            create : function(tile){
                if(tile){
                    if(tile instanceof Tile.Tile){
                        return new Toolbar({ model : tile });    
                    }else{
                        throw new Error("Invalid argument");
                    }
                } else{
                    return new Toolbar();
                }
            }
        };

    }
);