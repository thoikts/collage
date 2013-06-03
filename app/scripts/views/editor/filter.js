define(["jquery","backbone","handlebars","text!templates/editor/filter.html"],

    function($,Backbone,Handlebars,template){

        /*
            Filter view displayed within the filters panel on the left
        */
        var Filter = Backbone.View.extend({
            tagName : "li",
            className : "filter",
            template : Handlebars.compile(template),
            events : {
                "click" : "onClick"
            },

            initialize : function(){
                this.model.on("change:selected", function(model, selected){
                    if(selected){
                        $(this.el).addClass("selected");
                    } else {
                        $(this.el).removeClass("selected");
                    }
                },this);
            },

            onClick : function(){
                this.select();
                this.trigger("apply",this.model);
            },

            select : function(){
                this.model.select();
            },

            render : function(){
                $(this.el).html(this.template(this.model.toJSON()));
                return this.el;
            }
        });

        return {
            create : function(filterData){
                if(filterData instanceof Backbone.Model){
                    return new Filter({ model : filterData });
                }else{
                    throw new Error("Invalid argument");
                }
            }
        };

    }
);