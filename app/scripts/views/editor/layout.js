define(["jquery","backbone","models/editor/layout","handlebars","text!templates/editor/layout.html"],

    function($,Backbone,LayoutData,Handlebars,template){

        /*
            Layout view used within LayoutPanel
        */
        var Layout = Backbone.View.extend({
            template : Handlebars.compile(template),
            tagName : "li",
            className : "layout",
            events : {
                "click" : "onClick"
            },

            initialize : function(){
                this.model.on("change:selected", function(model, selected){
                    if(selected){
                        $(this.el).addClass("selected");
                        this.trigger("select",this.model);
                    } else {
                        $(this.el).removeClass("selected");
                    }
                },this);
            },

            onClick : function(){
                this.toggleSelect();
            },

            render : function(){
                $(this.el).html(this.template(this.model.toJSON()));
                return this.el;
            },

            toggleSelect : function(){
                if(!this.model.get('selected')){
                    this.model.toggleSelected();
                }
            }
        });

        return {
            create : function(layoutData){
                if(layoutData instanceof LayoutData.Layout){
                    return new Layout({model : layoutData});
                } else {
                    throw new Error("Invalid argument");
                }
            }
        };

    }
);