define(["jquery", "underscore", "backbone"],function($,_,Backbone){

    /*
        Base class used by the Frame view focused on rendering 
        tiles within the frame
    */
    var FrameRenderer = Backbone.View.extend({

        // keep track of how many tiles have been rendered
        __renderingCounter : 0,
        __reportRenderingCompletion : function(){
            this.__renderingCounter = this.__renderingCounter + 1;
            if(this.__renderingCounter === this.tiles.length){
                // all the tiles have been rendered
                this.__postRender();
                this.__renderingCounter = 0;
            }
        },

        // show a loader before rendering
        __preRender : function(){
            $(this.el).addClass("loading");
        },

        // and remove the loading animation when we're done rendering
        __postRender : function(){
            $(this.el).removeClass("loading");    
        },

        // core rendering is delayed to make sure the element is attached  
        render : function(){

            this.__preRender();

            setTimeout(_.bind(function(){
                $(this.el).html(this.template(
                    typeof this.model !== 'undefined' ? this.model.toJSON() : {}
                ));

                // render all the tile views associated with the frame and track 
                // rendering completion
                _.each(this.tiles, function(t){
                    t.once("rendered", this.__reportRenderingCompletion, this);
                    this.$("ul").append(t.render());
                },this);
            },this), 500);

            return this.el;
        }
    });

    return FrameRenderer; 
});