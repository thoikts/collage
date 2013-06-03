define(["jquery", "underscore", "backbone","filepicker"],function($,_,Backbone,filepicker){
    

    /*
        Selection manager makes sure there's only one tile selected at a time
    */
    var SelectionManager = function(){
        this.__selection = null;
    };

    SelectionManager.prototype = {
        select : function(tile){
            if(this.__selection){
                this.__selection.set({ selected : false });
            }

            tile.set({ selected : true });
            this.__selection = tile;
        },

        deselect : function(tile){
            if(this.__selection === tile){
                this.__selection = null;
            }

            tile.set({ selected : false });
        }
    };

    /*
        Tile archive is used to store data for images used with tiles
        to make sure we have a central image repository to set images correctly when
        a different layout is applied to a set of tiles
    */
    var TileArchive = function(){
        this.__tiles = [];
    };

    TileArchive.prototype = {

        add : function(tile){
            var index = _.indexOf(this.__tiles, _.find(this.__tiles, function(t){ 
                return t.imageUrl === tile.imageUrl; 
            }));

            if(index !== -1){
                this.__tiles[index] = tile;
            }else{
                this.__tiles.push(tile);
            }
        },

        update : function(url, tile){
            var oldIndex = _.indexOf(this.__tiles, _.find(this.__tiles, function(t){ 
                return t.imageUrl === url; 
            }));

            this.__tiles[oldIndex] = tile;
        },

        getTiles : function(){
            return this.__tiles;
        },

        clear : function(){
            this.__tiles = [];
        }
    };

    // internal singletons for the selection manager and the tile archive
    var __theSelectionManager = new SelectionManager(),
        __theTileArchive = new TileArchive();

    /*
        Tile model stores the url of the image associated with the tile
        It also keeps track of tiles states (loaded, selected) and contains transformations applied on the tile
    */
    var Tile = Backbone.Model.extend({
        defaults : {
            horizontalFlip : false,
            verticalFlip : false,
            xOffset : 0,
            yOffset : 0,
            selected : false,
            filter : 'clear',
            loaded : false
        }, 

        initialize : function(){
            this.on("change:imageUrl", function(imageUrl){
                if(!this.previous("imageUrl")){
                    __theTileArchive.add(this.toJSON());
                } else {
                    __theTileArchive.update(this.previous("imageUrl"),this.toJSON());
                }

                this.set({thumbnail : null});
            },this);

            this.on("change:filter", function(filter){
                __theTileArchive.update(this.previous("imageUrl"),this.toJSON());
            },this);

        },

        /*
            Generate a thumbnail for the tile 
        */
        getThumbnail : function(width, height){
            var dfd = $.Deferred();

            if(this.get("thumbnail")){
                dfd.resolve(this.get("thumbnail"));
            } else {
                filepicker.convert(
                    this.get("file"),
                    { width : width, height : height, fit : 'crop' },
                    _.bind(function(thumbnail){
                        this.set({ thumbnail : thumbnail.url });
                        dfd.resolve(thumbnail.url);
                    },this) 
                );
            }

            return dfd.promise();
        },

        __loaded : function(field){
            var dfd = $.Deferred();

            if(this.get(field)){
                dfd.resolve();
            } else {
                this.once("change:" + field,_.bind(function(model,loaded){
                    if(loaded){ dfd.resolve(); }
                },this));
            }

            return dfd.promise();
        },

        /*
            Resolves when the tile is loaded
        */
        loaded : function(){
            
            var dfd = $.Deferred();

            $.when(this.__loaded("loaded")).done(function(){
                dfd.resolve();
            });

            return dfd.promise();
        },

        select : function(){
            __theSelectionManager.select(this);
        },

        deselect : function(){
            __theSelectionManager.deselect(this);
        },

        flipHorizontally : function(){
            this.set({ 
                horizontalFlip : !this.get("horizontalFlip")
            });
        },

        flipVertically : function(){
            this.set({
                verticalFlip : !this.get("verticalFlip")
            });
        },

        zoomIn : function(){
            this.set({
                zoomLevel : this.get("zoomLevel")*1.1
            });
        },

        zoomOut : function(){
            this.set({
                zoomLevel : this.get("zoomLevel")*0.9
            });
        }
    });

    return {
        Tile : Tile,

        create : function(){
            return new Tile();
        },

        getArchivedTiles : function(){
            return __theTileArchive.getTiles();
        },

        clearArchiveTiles : function(){
            __theTileArchive.clear();
        }
    };
});