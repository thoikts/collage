/*
    Require setup + entry point for the application
*/

require.config({
    baseUrl : "scripts/",
    shim: {
        'underscore' : {exports: '_' },
        'backbone' : {exports: 'Backbone', deps: ['underscore']},
        'json' : {exports: 'JSON'},
        'handlebars' :  {exports: 'Handlebars'},
        'filepicker' : {exports: 'filepicker'},
        'reveal' : {deps:['jquery']},
        'ua-parser' : {exports: 'UAParser'}
    },

    paths: {
        jquery: 'vendor/jquery.min',
        underscore: 'vendor/underscore',
        backbone: 'vendor/backbone',
        text : 'vendor/text',
        json : 'vendor/json2',
        handlebars : 'vendor/handlebars',
        filepicker : 'vendor/filepicker',
        reveal : 'vendor/jquery.reveal',
        postal : 'vendor/postal',
        'ua-parser' : 'vendor/ua-parser',
        templates : '../templates',
        data: '../data'
    }
});

require(['jquery','app'], function($,Application) {
    Application.run();
});
