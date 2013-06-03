define(["underscore", "backbone"], function(_,Backbone){

    /*
        Base panel class used by LayoutPanel and FilterPanel
    */
    var Panel = Backbone.View.extend({
        initialize : function(){
            this.children = _.map(this.collection.models, this.createChildElement, this);
        },

        // must be implemented by the child class
        createChildElement : function(m){
            throw new Error("Not impemented");
        },

        findChild : function(predicate){
            if(predicate){
                return _.find(this.children,predicate);
            }
        },

        getChildren : function(){
            return this.children;
        },

        show : function(){
            $(this.el).css("display","block");
            setTimeout(_.bind(function(){
                $(this.el).removeClass("hidden");
            },this),200);
        },

        hide : function(){
            $(this.el).addClass("hidden");
            setTimeout(_.bind(function(){
                $(this.el).css("display","none");
            },this),500);
        }

    });

    return Panel;
});