# Udacity FSND Map Project

## This is my Udacity Full Stack Nanodegree Neighborhood Map Project. 

### About

This is a project that explores front end web development using Javascript and Knockout.JS. The goal is to integrate multiple web APIs into a cohesive, integrated user experience. The data model is based on a variety of locations I visited on a recent trip to India.

I decided to take a well rounded approach and not spend too much time on one area while exluding another. I wanted the aesthetic experience
to match the attention to detail of the underlying functionality. 

However, a lot of time was spent figuring out a model that allowed me to easily and reliably bypass Google Maps query limit. Of course, this
would not be an issue for paying customers, but it was a challenging and rewarding programming exercise nonetheless. 

The program is split into 5 main components, map.js, viewmodel.js, wikiAPI.js, error_handler.js, and wikiPageBuilder.js. Each file handles
an unique set of responsibilities.

map.js is responsible for all the code related to controling the Google Maps Api. It handles displaying the map, building markers and their
associated functions, as well as filtering incorrect api responses.

viewmodel.js is where all the Knockout related code is stored. It handles dynamically updating the site for any data model related issues.

wikiAPI.js is responsible for making wikimedia ajax api calls.

error_handler and wikiPageBuilder each handle one off user interface functions and building specific HTML elements that don't need to be 
part of the MvvM pattern as there is no data model to build off of. 

### Getting Started

In order to run this project, clone the repo and open main.html.


### Prerequisites

This project relies on two javascript libraries: Jquery and knockout.JS. Both are provided with the source files. Two web APIs are also
used: Google Maps JS Api and the Wikimedia API. An internet connection is required to access these APIs.


### Installing

Once the repo is cloned. You can find main.html in the root directory. Simply open in directl in your web browser. 

### Comments

JS Doc was used to provide comment structure. You can find a structured list of comments in js/out/index.html

