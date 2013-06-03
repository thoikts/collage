define(["jquery","json","underscore","backbone","text!data/filters.json"], 
    function($,JSON,_,Backbone,filterData){

        /*
            Filters are loaded from data/filters.json file
        */
    
        var Filter = Backbone.Model.extend({
            defaults : {
                selected : false
            },

            select : function(){
                this.set({ selected : true });
            }
        });

        var Filters = Backbone.Collection.extend({
            model : Filter,

            initialize : function(){
                // make sure there's always only 1 filter selected 
                this.on("change:selected",function(model,selected){
                    if(selected){
                        var otherSelection = _.find(this.models, function(m){
                            return m.get("selected") && (m !== model);  
                        });

                        if(typeof otherSelection !== 'undefined'){
                            otherSelection.set({ selected : false });
                        }    
                    }
                },this);
            }
        });

        return {
            /*
                Load filters and return them through a deferred object
            */
            getFilters : function(){
                var dfd = $.Deferred(), data = JSON.parse(filterData), filters = new Filters();

                _.each(data,function(f){
                    filters.add(new Filter(f));
                });

                dfd.resolve(filters);
                
                return dfd.promise();
            }
        };
    }
);