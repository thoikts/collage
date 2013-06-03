define(["jquery","backbone","handlebars","text!templates/pages/browser.html"],

    function($,Backbone,Handlebars,template){
        var BrowserPage = Backbone.View.extend({
            className : "browser",
            template : Handlebars.compile(template),

            render : function(){
                $(this.el).html(this.template({}));
                return this.el;
            }
        });

        return BrowserPage;
    }
);