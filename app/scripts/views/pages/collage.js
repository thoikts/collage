define(["jquery","backbone","postal","views/dialogs/filepicker","handlebars","text!templates/pages/collage.html"],

    function($,Backbone,postal,Filepicker,Handlebars,template){
        
        function twitterShareUrl(text,url,via){
            return "https://twitter.com/intent/tweet?text=" +
                encodeURIComponent(text) + "&url=" + encodeURIComponent(url) + "&via=" + encodeURIComponent(via);         
        }
        
        function facebookShareUrl(url){
            return "https://www.facebook.com/sharer/sharer.php?u=" + 
                encodeURIComponent(url);
        }


        var CollagePage = Backbone.View.extend({
            className : "collage-holder",
            template : Handlebars.compile(template),

            events : {
                "click .start-new" : "onNewCollage",
                "click .save" : "onSave"
            },

            render : function(){
                $(this.el).html(this.template({
                    imageUrl : this.model.getFile().url,
                    collageUrl : this.model.getUrl(),
                    twitterShareUrl : twitterShareUrl("look what i've made",this.model.getUrl(),"filepicker"),
                    facebookShareUrl : facebookShareUrl(this.model.getUrl())
                }));
                
                this.$(".collage").load(function(){
                    $(this).removeClass("hidden");
                });

                return this.el;
            },

            onSave : function(){
                Filepicker.saveImage(this.model.getFile());
            },

            onNewCollage : function(){
                postal.publish({
                    topic : "collage.create"
                });
            }
        });

        return CollagePage;
    }
);