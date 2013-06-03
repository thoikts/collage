define([ "jquery", "underscore","backbone","settings","postal",
         "models/collage/collage", "models/editor/layout",
         "views/editor/frame-renderer", "views/editor/tile", "models/editor/tile",
         "handlebars", "text!templates/editor/frame.html","helpers/canvas"], 

    function($,_,Backbone,settings,postal,CollageData,
        Layout,FrameRenderer,Tile,TileData,Handlebars,template,CanvasHelper){

        /*
            Frame is the central element visible in the editor comprised of a variable number of tile views
            (based on the layout configuration)
        */

        var Frame = FrameRenderer.extend({
            className : "frame",
            template : Handlebars.compile(template),

            initialize : function(options){

                FrameRenderer.prototype.initialize.call(this,options);

                this.__channel = postal.channel();
                // track the usage of filters through the app message bus
                this.__channel.subscribe("filter.apply", _.bind(function(filter){
                    var selectedTile = this.getSelectedTile();
                    if(selectedTile){
                        selectedTile.applyFilter(filter.type);
                    }
                },this));
            },

            clear : function(){
                this.tiles = [];
                TileData.clearArchiveTiles();
                this.render();
            },

            disableEditing : function(){
                _.each(this.tiles, function(t){
                    t.disableEditing();
                });
            },

            buildCollage : function(){

                var canvas = CanvasHelper.getOffscreenCompositeCanvas(settings.collageWidth, settings.collageHeight),
                    dfd = $.Deferred();

                _.each(this.tiles, function(t){
                    canvas.addCanvas(t.getCanvas(),
                        t.model.get("left"), t.model.get("top"),
                        t.model.get("width"), t.model.get("height")
                    );      
                },this);

                // give the offscreen canvas some time to update the visuals
                setTimeout(function(){
                    $.when(CollageData.fromDataUrl(canvas.toDataURL(true))).done(function(collage){
                        dfd.resolve(collage);
                    }); 
                },500);

                return dfd.promise();
            },

            getTiles : function(){
                return this.tiles;
            },

            getSelectedTile : function(){
                return _.find(this.tiles, function(t){
                    return t.model.get("selected");
                });
            },

            deselectAll : function(){
                _.each(this.tiles, function(t){
                    t.undim();
                });
            },

            /*
                Figure out if current frame is complete
            */
            updateFrameState : function(){

                var ready = _.filter(this.tiles, function(t){ return !t.model.get("imageUrl"); }).length === 0, 
                    deferreds = [];
    
                _.each(this.tiles, function(t) {
                    deferreds.push( t.model.loaded() );
                });

                if(ready){
                    $.when.apply(window, deferreds).then(_.bind(function(){
                        this.trigger("update",ready);
                    },this));    
                }else{
                    this.trigger("update",ready);
                }

                
            },

            /*
                Create a tile view based
                    @tile : tile model
                    @i : tile number
                    @tileArchive : archive of tiles in the system 
            */
            __createTile : function(tile,i,tileArchive){
                var t = Tile.create(tile); 
                
                // propagate edit event outside the frame        
                t.on("edit", function(m){ 
                    this.__channel.publish("tile.selected", m.toJSON());
                    this.trigger("edit",m); 
                }, this);

                // determine if the frame is ready when a tile gets an image
                t.model.on("change:imageUrl", function(){
                    this.updateFrameState();
                },this);

                // tweak tile view based on selection state
                t.model.on("change:selected", function(model,selected){
                    
                    var hasSelected = _.find(this.tiles, function(t){
                        return t.model.get("selected");
                    });

                    _.each(this.tiles, function(t){
                        if(t.model.get("selected")){
                            t.undim();
                        }else{
                            t.dim();
                        }
                    });
                },this);

                // if there is a tile in the archive that can be reused,
                // update curren tile's model using this data
                if(tileArchive.length-1 >= i){
                    t.model.set({ 
                        imageUrl : tileArchive[i].imageUrl, 
                        file : tileArchive[i].file,
                        filter : tileArchive[i].filter
                    });
                }

                return t;
            },

            /*
                Apply a given layout to the frame
            */
            applyLayout : function(layout){

                var tileArchive = TileData.getArchivedTiles();

                if(layout instanceof Layout.Layout){
                    this.model = layout;
                    this.tiles = _.map(layout.getTiles(), _.bind(function(tile,i){
                        return this.__createTile(tile,i,tileArchive);
                    },this), this);
                    this.updateFrameState();
                    this.render();
                }else{
                    throw new Error("Invalid argument");
                }
            }
        });

        return {
            
            Frame : Frame,

            create : function(frameData){
                TileData.clearArchiveTiles();
                return new Frame();
            }
        };

    }
);