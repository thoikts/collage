<img alt="Collage" src="https://www.filepicker.io/api/file/7WWoCV6Smet1LMvsP2Bw" class="center">

Getting started
======
Make sure you have [Grunt 0.4](http://gruntjs.com/) installed. Install project dependencies listed in package.json using the following command
 
```
npm install
```

Collage uses [Filepicker JS API](https://developers.filepicker.io/docs/web/) extensively. To roll your own version of the collage application you will need a valid [Filepicker API key](https://developers.filepicker.io/register/). You then need to update application settings in app/scripts/settings.js 

```
filepickerApplicationKey : "your-application-key"
```

Make sure you also have an S3 bucket attached to your Filepicker application key  


Run the app
=======

```
grunt 
```

Your local (and organic) collage will be available at [http://localhost:9001](http://localhost:9001) 


Building the app
=======
```
grunt build
```

dist/ will contain compiled and optimized version of the app ready for deployment

Deploying to Heroku
=======

server/ contains everything you need to put roll your own version of collage app on Heroku. To put the app on Heroku, you can do something like this

```
grunt build
cp -fr server/* <path-to-your-heorku-app-directory>
```  

This will rebuild the project and copy all the files for the app to a directory you've provided. Go to that directory and do the following

```
git init
git add .
git commit -a -m "initial commit"
heroku login
heroku create <name-of-the-application>
git push heroku master
heroku open
```