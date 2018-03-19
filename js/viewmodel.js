/**
 * @class observableLocation
 * @description the observable locations are the six buttons at the top of the screen. clicking them fires off the events necessary to load the local loxations
 * @param data {object}
 * @param index {number}
 * @param location {string}
 */

var observableLocation = function (data, index, location) {
    this.title = ko.observable(data.title);
    this.latLng = ko.observable(data.location);
    this.index = ko.observable(index);
    this.trueName = ko.observable(data.trueName);
    this.locationVisible = ko.computed(function () {
        if (location() === "") { // if the search field is empty, turn all markers on and set visible to true
            //toggleAllMarkersOn()
            //return true
        } else {
            if (this.title().indexOf(location())) { //location() is the search field value
               // toggleMarker(this.index(), 'off');
               // return false
            } else {
               // toggleMarker(this.index(), 'on');
               // return true
            }
        }}, this)


};


/**
 * @class observableLocalLocation
 * @description the local locations are the invidivual markers that are loaded when the location buttons are pressed
 * @param textSearchObject {object} The returned google places API object
 * @param locationsArrayIndex {number} the index of the greater location
 * @param locationSearch {string} whatever is passed in by the search box
 * @param markerIndex {number} index of the local location name
 */

var observableLocalLocation = function(textSearchObject, locationsArrayIndex, locationSearch, markerIndex){
    this.name = ko.observable(textSearchObject.name);
    this.markerIndex = markerIndex;
    this.locationIcon = ko.observable(textSearchObject.icon)
    this.greaterLocation = ko.observable(locations[locationsArrayIndex].title);
    this.locationID = ko.observable(textSearchObject.id);
    this.locationVisible = ko.computed(function () {
        if (locationSearch() === "") { // if the search field is empty, turn all markers on and set visible to true
            toggleAllMarkersOn()
            return true
        } else {
            if (this.name().toUpperCase().indexOf(locationSearch().toUpperCase())) { //location() is the search field value
                toggleMarker(this.markerIndex, 'off')
                return false
            } else {
                toggleMarker(this.markerIndex, 'on')
                return true
            }
        }}, this)

};


/**
 * @function viewModel
 * @description The Knockout.JS viewModel object. Handles knockout related MVVM functions.
 *
 */


var viewModel = function () {
    var self = this;
    self.missingLocationsObservable = ko.observable(0)
    self.locationSearch = ko.observable("")
    self.koLocationList = ko.observableArray([]);
    self.koLocalLocationList = ko.observableArray([]);
    locations.forEach(function (location, index) {
      self.koLocationList.push( new observableLocation(location, index, self.locationSearch))
    });

    self.koToggleLocalLocationMarker = function () {

    };

    self.zoomToMarker = function (data) {
        zoomToMarker(data.locationID())
    };

    self.koToggleMarker = function (index) {
        resetPage();
        viewModelClickInit(index.index());
        constructWikiHtml(index.index());
        openGreaterLocationMenu();
    };

    self.updateLocalObservableLocations = function (textSearchObject, locationsArrayIndex, index) {//textSearchObject = google places API data for locals location search. locationsArrayIndex = the index of the greater location buttons
        let localMarker = locations[locationsArrayIndex].title;
        let obslocalloc = new observableLocalLocation(textSearchObject, locationsArrayIndex, self.locationSearch, index);
        if (localMarker !== undefined) {
            if (self.koLocalLocationList().length > 0) { //this means there are already knockout observable markers on the screen
                if (self.koLocalLocationList()[0].greaterLocation() === localMarker) {//if the first komarker buttons 'greater location' property matches location array index passed by map.js
                    let nameMatch = ko.utils.arrayFirst(self.koLocalLocationList(), function (obsLocLocName) { //looks at the koLocalLocationlist observable array to see if the object already exists
                        return textSearchObject.name === obsLocLocName.name()
                    });
                    if (!nameMatch) {
                        self.koLocalLocationList.push(obslocalloc)
                    }
                } else {
                    self.koLocalLocationList.removeAll();
                    self.koLocalLocationList.push(obslocalloc)
                }
            } else {
                self.koLocalLocationList.push(obslocalloc)
            }
        } else {
            //do nothing
        }
    }
};
const activeViewModel = new viewModel();
ko.applyBindings(activeViewModel);







