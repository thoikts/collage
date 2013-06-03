define(["jquery","backbone","handlebars","postal","text!templates/pages/editor.html"],

    function($,Backbone,Handlebars,postal,template){
        var EditorPage = Backbone.View.extend({
            className : "editor",          
            template : Handlebars.compile(template),
            events : {
                "click .update-collage" : "onPublish",
                "click .start-new" : "onStartNew",
                "click .scene" : "onClickWithinScene"
            },

            initialize : function(){
                this.__channel = postal.channel();
            },

            onClickWithinScene : function(e){
                
                function isTargetAnEditControl(el){
                    return (el.tagName.toLowerCase() === "canvas") ||  
                        $(el).hasClass("tool-icon");
                }

                if(!isTargetAnEditControl(e.srcElement)){
                    this.trigger("click-off-frame");
                    console.log("click off",e);
                }
            },

            enablePublishing : function(){
                this.$(".actions-container").removeClass("hidden");
            },

            disablePublishing : function(){
                this.$(".actions-container").addClass("hidden");
            },

            switchingToPublishMode : function(){
                this.$(".actions-container").addClass("hidden");
                this.$(".scene").addClass("expanded");
                this.$(".panel").addClass("hidden");
                this.$(".making-collage").removeClass("hidden");
                this.$(".frame").addClass("making");
            },

            switchToEditMode : function(){
                this.$(".panel").removeClass("hidden");
                this.$(".scene").removeClass("expanded");
            }, 

            onPublish : function(){
                this.trigger("publish");
                this.switchingToPublishMode();
            },

            onStartNew : function(){
                this.__channel.publish("collage.new",{});
                this.switchToEditMode();
            },

            render : function(){
                $(this.el).html(this.template());
                return this.el;
            }
        }); 

        return EditorPage;
    }
);