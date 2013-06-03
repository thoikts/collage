define(["jquery", "underscore", "backbone", "views/editor/panel", "views/editor/layout", "handlebars", "text!templates/editor/layout-panel.html" ], 

    function($,_,Backbone,Panel,Layout,Handlebars,template){
        
        /*
            Layout panel contains a collection of layouts rendered in the left panel
        */

        var LayoutPanel = Panel.extend({
            className : "layout-panel",
            template : Handlebars.compile(template),

            createChildElement : function(m){
                var c = Layout.create(m);

                if(typeof c !== 'undefined'){
                    c.on("select", function(layout){
                        this.trigger("select",layout);
                    }, this);    
                }

                return c;
            },
            
            render : function(){
                $(this.el).html(this.template({}));
                
                _.each(this.getChildren(), function(l){
                    this.$(".layouts").append(l.render());
                },this);

                return this.el;
            }
        });

        return {
            create : function(layouts){
                if(layouts instanceof Backbone.Collection){
                    return new LayoutPanel({ collection : layouts });    
                } else {
                    throw new Error("Invalid argument");
                }
            }
        };
    }
);