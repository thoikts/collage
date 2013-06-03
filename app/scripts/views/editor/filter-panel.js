define(["jquery", "backbone", "postal", "views/editor/panel", "views/editor/filter", "handlebars", "text!templates/editor/filter-panel.html"],

    function($, Backbone, postal, Panel, Filter, Handlebars, template){
        
        /*
            Panel containing the filters
        */

        var FilterPanel = Panel.extend({
            template : Handlebars.compile(template),
            className : "filter-panel hidden",

            initialize : function(options){
                Panel.prototype.initialize.call(this, options);
                
                // use global application message bus to respond tile selection event
                this.__channel = postal.channel(); 
                this.__channel.subscribe("tile.selected", _.bind(function(data){
                    if(data.filter){
                        var filterView = this.findChild(function(f){
                            return f.model.get("type") === data.filter;
                        });

                        if(filterView){
                            filterView.select();
                        }
                    } else {
                        this.getDefaultFilterView().select();
                    }
                },this));
            },

            getDefaultFilterView : function(){
                return this.children[0];
            },

            createChildElement : function(m){
                var c = Filter.create(m);

                if(typeof c !== 'undefined'){
                    c.on("apply", function(filter){
                        this.__channel.publish("filter.apply", filter.toJSON());
                    }, this);    
                }

                return c;
            },

            render : function(){
                $(this.el).html(this.template({}));
                
                _.each(this.getChildren(), function(f){
                    this.$(".filters").append(f.render());
                },this);

                return this.el;
            }
        });

        return {
            create : function(filters){
                if(filters instanceof Backbone.Collection){
                    return new FilterPanel({ collection : filters });    
                } else {
                    throw new Error("Invalid argument");
                }
            }     
        };
    }
);