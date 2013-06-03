define(["jquery","backbone","postal","controllers/editor","controllers/collage","reveal"],
    
    function($,Backbone,postal,EditorController,CollageController){
        return {
            run : function(){
                $(document).ready(function(){
                    
                    /*
                        Application router:
                            The app supports 2 types of urls
                                - default behavior is to render collage editor
                                - for urls that look like /c/<collage-id>, a collage page is rendered
                    */
                    var ApplicationRouter = Backbone.Router.extend({

                        routes: {
                            "" : "showEditor",
                            "c/:id" : "showCollage"
                        },

                        showCollage: function(id){
                            CollageController.run(id);
                        },

                        showEditor: function() {
                            var welcome = window.location.href.indexOf("#nowelcome") === -1;
                            EditorController.run(welcome);                                
                        }

                    });


                    var applicationRouter = new ApplicationRouter();

                    Backbone.history.start({pushState: true});

                    // once collage is published, go to the collage page
                    postal.subscribe({
                        topic : "collage.published",
                        callback : function(d){
                            applicationRouter.navigate(d.collageUrl,{trigger : true});
                        }
                    });

                    // navigate to the editor page when a user wants to create a new collage 
                    postal.subscribe({
                        topic : "collage.create",
                        callback : function(){
                            applicationRouter.navigate("/",{trigger : true});
                        }
                    });

					// register the facebook share link
					$("a.share.facebook").on("click", function(){
						var sharer = "https://www.facebook.com/sharer/sharer.php?u=";
						window.open(sharer + location.href, 'sharer', 'width=626,height=436');
					});
                });
            }
        };
    }
);