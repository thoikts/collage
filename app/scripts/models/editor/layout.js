
define(["jquery","json","underscore","backbone","models/editor/tile", "text!data/layouts.json"],

    function($, JSON, _, Backbone, Tile, layoutData){
        /*
            Layouts are loaded from data/layouts.json
        */

        var Layout = Backbone.Model.extend({
            defaults : {
                selected : false
            },

            toggleSelected : function(){
                this.set({
                    selected : !this.get("selected")
                });
            },

            // returns a collection of tile models based on the layout spec
            getTiles : function(){
                return _.map(this.get("tiles"),function(t){
                    return new Tile.Tile(t);
                });
            }
        });

        var Layouts = Backbone.Collection.extend({
            model: Layout,

            initialize : function(){
                // make sure there's only 1 layout selected 
                this.on("change:selected",function(model,selected){
                    if(selected){
                        var otherSelection = _.find(this.models, function(m){
                            return m.get("selected") && (m !== model);  
                        });

                        if(typeof otherSelection !== 'undefined'){
                            otherSelection.toggleSelected();
                        }

                        this.trigger('select',model);
                    }
                },this);
            },

            // assume the first layout in the set is the default one
            getDefaultLayout : function(){
                return this.models[0];
            }
        });


        return {
            /*
                Load layouts and return them through a deferred object
            */
            getLayouts : function(dataPath){
                var dfd = $.Deferred(), data = JSON.parse(layoutData),
                    layouts = new Layouts();

                _.each(data.layout,function(a){ layouts.add(new Layout(a)); });

                dfd.resolve(layouts);
                
                return dfd.promise();
            },

            Layout : Layout
        };
    }
);


