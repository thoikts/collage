define(["jquery", "underscore", "postal", "ua-parser",

        "models/editor/layout", 
        "models/editor/filter",
        
        "views/pages/editor", 
        "views/pages/browser",
        "views/editor/layout-panel", 
        "views/editor/filter-panel", 
        "views/editor/frame", 
        "views/editor/toolbar", 
        "views/dialogs/filepicker", 
        "views/editor/filter-panel"],

    function($,_,postal,UAParser,  
        LayoutData,FilterData,
        EditorPage,BrowserPage, 
        LayoutPanel,FilterPanel,Frame,Toolbar,FilepickerDialog,FilterPanel){


        var EditorController = function(){};


        EditorController.prototype = {

            __filterPanel : null,
            __toolbar : null,
            __frame : null,
            __editorPage : null,
            __layoutPanel : null,
            __layouts : null,

            initialize : function(){
                this.initializeEditorPage();
                this.initializeToolbar();
                this.initializeFrame();
                this.initializeLayouts();
                this.initializeFilters();
                this.initializeMessaging();
            },


            /*
                Load layout data and render available layouts in the left panel
            */

            initializeLayouts : function(){
                $.when(LayoutData.getLayouts()).done(_.bind(function(layouts){
                    if(typeof layouts !== 'undefined'){

                        this.__layouts = layouts;

                        this.__layoutPanel = LayoutPanel.create(layouts);
                        $(".panel").append(this.__layoutPanel.render());

                        this.__layouts.on("select", function(layout){
                            this.__frame.applyLayout(layout);
                            $(".help-layout").addClass("hidden");                            
                        }, this);
                    }
                },this));
            },

            /*
                Load filter data and render filters in the left panel
            */

            initializeFilters : function(){
                $.when(FilterData.getFilters()).done(_.bind(function(filters){
                    if(filters){
                        this.__filterPanel = FilterPanel.create(filters);
                        $(".panel").append(this.__filterPanel.render());
                    }
                },this));
            },

            /*
                Create the toolbar and attach it to the toolbar container
            */

            initializeToolbar : function(){
                this.__toolbar = Toolbar.create();



                // change image in the selected frame tile
                this.__toolbar.on("change-image", function(tile){
                    // loadImage has 2 callbacks
                    // - the 1st one (passed in as the argument) gets called when an image is selected
                    //   in the filepicker dialog
                    // - the 2nd one (returned as a deferred object) gets called when the image gets
                    //   checked for size (and gets scaled if needed)   
                    $.when(FilepickerDialog.loadImage(_.bind(this.__onImagePicked,this)))
                        .done(_.bind(function(fpFile){
                            if(fpFile){
                                tile.set({ imageUrl : fpFile.url, file : fpFile });
                            }
                        },this));
                }, this);

                // done editing the image
                this.__toolbar.on("done", function(){
                    this.exitEditMode();
                }, this);

                $(".toolbar-container").append(this.__toolbar.render());
            },

            // ask the currently selected tile to display a loading animation
            // used as a callback for FilepickerDialog.loadImage
            __onImagePicked : function(){ 
                this.__frame.getSelectedTile().loading(); 
            },

            /*
                Create an empty frame and render it
            */
            initializeFrame : function(){
                this.__frame = Frame.create();

                // handle frame update to adjust publish button visibility
                this.__frame.on("update", function(ready){
                    if(ready){
                        this.__editorPage.enablePublishing();
                    } else {
                        this.__editorPage.disablePublishing();
                    }
                }, this);

                // handle the edit event (user clicks on one of the tiles within the frame)
                // by invoking the Filepicker dialog and switching to the edit mode
                this.__frame.on("edit",function(tile){        
                    if(!tile.get("imageUrl")){
                        this.exitEditMode();
                        
                        $.when(FilepickerDialog.loadImage(_.bind(this.__onImagePicked,this)))
                            .done(_.bind(function(fpFile){
                                if(fpFile){
                                    tile.set({ imageUrl : fpFile.url, file : fpFile });
                                    this.enterEditMode(tile);
                                }
                            },this));
                    } else {
                        this.enterEditMode(tile);
                    }
                },this);

                $(".frame-container").append(this.__frame.render());                
            },

            /*
                Initialize editor page and render it
                This page is the foundation of the editor
            */

            initializeEditorPage : function(){

                this.__editorPage = new EditorPage();
                
                // exit edit mode when user clicks outside of the frame/toolbar/left panel
                this.__editorPage.on("click-off-frame", function(){
                    this.__frame.deselectAll();
                    this.exitEditMode(); 
                },this);

                // adjust the UI when publishing the collage
                this.__editorPage.on("publish", function(tiles){

                    this.__frame.disableEditing();

                    this.__toolbar.hide();

                    // ask the frame to build the collage
                    $.when(this.__frame.buildCollage()).done(_.bind(function(collage){
                        postal.publish({
                            topic : "collage.published",
                            data : collage.toJSON()
                        });
                    },this));

                },this);

                $(".container").html(this.__editorPage.render());
            },

            /*
                Respond to application wide events
            */
            initializeMessaging : function(){
                postal.subscribe({
                    topic : "collage.new",
                    callback : _.bind(function(){
                        console.log("postal: collage.new");
                        this.__frame.clear();
                        this.__layouts.getDefaultLayout().toggleSelected();   
                        this.__frame.applyLayout(this.__layouts.getDefaultLayout());
                    },this)
                });
            },

            enterEditMode : function(tile){                
                $(".help-layout").addClass("hidden");
                this.__toolbar.setTile(tile);
                this.__toolbar.show();
                this.__layoutPanel.hide();
                this.__filterPanel.show();
            },

            exitEditMode : function(){
                this.__toolbar.hide();
                this.__layoutPanel.show();
                this.__filterPanel.hide();        
            },

            run : function(welcome) {
                
                this.initialize();

                if(welcome){ 
                    $('#welcome-screen').reveal(); 
                    $(".close-reveal-modal").on("click", function(){
                        $(".help-layout").removeClass("hidden"); 
                    });                          
                }
                
                // select a default layout when the editor is loaded
                this.__layouts.getDefaultLayout().toggleSelected();
            }
        };


        var __instance;

        return {
            run : function(welcome){
                
                function isDesktopChromeOrSafari(ua){
                    return (["chrome","chromium","safari"].indexOf(ua.browser.name.toLowerCase()) !== -1) && 
                        (["console", "mobile", "tablet"].indexOf(ua.device.type) === -1);
                }

                // browser check
                if(!isDesktopChromeOrSafari(new UAParser().getResult())){
                    $(".container").html(new BrowserPage().render());
                    return;
                } 

                if(!__instance){
                    __instance = new EditorController();
                }

                __instance.run(welcome);
            }
        };
    }
);